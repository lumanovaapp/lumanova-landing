import { NextResponse } from "next/server";
import { toZonedTime } from "date-fns-tz";
import { createAdminClient } from "@/utils/supabase/admin";
import { phaseForDay } from "@/lib/streak";
import { buildReminderMessage } from "@/lib/reminder-message";
import { sendReminderEmail } from "@/lib/send-reminder-email";

export const runtime = "nodejs";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PLAN_URL = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://lumanova.app"}/dashboard/plan`;

// toZonedTime returns a Date whose *local* (system-timezone) getters read
// as the wall-clock time in `timeZone` — regardless of what timezone this
// process actually runs in (Vercel/cron functions run in UTC, but this
// works the same anywhere). Always read it with local getters (getHours,
// getFullYear, ...), never the UTC ones, or you get the wrong values back.
// Falls back to UTC for a missing/invalid IANA name so one bad row can't
// throw and take the whole cron run down with it.
function zonedNow(now: Date, timeZone: string): Date {
  try {
    return toZonedTime(now, timeZone);
  } catch {
    return toZonedTime(now, "UTC");
  }
}

function localDateStr(date: Date, timeZone: string): string {
  const zoned = zonedNow(date, timeZone);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, "0");
  const d = String(zoned.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Same shape as lib/streak.ts's toDateOnlyUTC (a UTC-midnight Date usable
// for day-count subtraction), but keyed to the user's own calendar day
// instead of the server's. `daily_checkins.date` is written from the
// client's local date (see app/api/checkin/route.ts), so day-number and
// "today's checkins" both have to key off the same local day here, or a
// user far from UTC gets matched against the wrong date around their
// midnight.
function toDateOnlyInZone(date: Date, timeZone: string): Date {
  const zoned = zonedNow(date, timeZone);
  return new Date(Date.UTC(zoned.getFullYear(), zoned.getMonth(), zoned.getDate()));
}

// Accepts either `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`
// so it works with any scheduler regardless of whether it can set custom
// headers — cron-job.org's free tier can only reliably do the query param.
// Fails closed: an unset CRON_SECRET can never be "matched" by an empty token.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  return queryToken === secret || headerToken === secret;
}

// Hit hourly by an external scheduler (see cron-job.org setup). Every run:
// finds users whose reminder hour is the current hour IN THEIR OWN TIMEZONE
// and who haven't already been reminded today (also by their own local
// calendar date), skips anyone who's already finished today's habits, and
// emails the rest a specific "here's what's left" nudge.
//
// Both the "is it their hour" and "already reminded today" checks depend on
// each user's individual timezone, which SQL can't filter on cheaply here —
// so unlike before, this fetches every reminder-enabled user and does both
// checks in JS. Fine at this app's scale; revisit if the user count grows
// large enough for a full table scan every hour to matter.
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  const { data: candidates, error: usersError } = await supabase
    .from("users")
    .select("id, email, full_name, reminder_time, timezone, last_reminded_at")
    .eq("reminder_enabled", true);

  if (usersError) {
    console.error("REMINDER CRON ERROR (fetch users):", usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const dueUsers = (candidates ?? []).filter((u) => {
    const tz = u.timezone || "UTC";
    const reminderHour = parseInt((u.reminder_time ?? "").slice(0, 2), 10);
    if (reminderHour !== zonedNow(now, tz).getHours()) return false;

    // Not already reminded today, on the user's own local calendar date —
    // an hourly run can otherwise re-fire within the same local hour, or
    // (near a user's midnight) compare against the wrong UTC day.
    if (!u.last_reminded_at) return true;
    return localDateStr(new Date(u.last_reminded_at), tz) !== localDateStr(now, tz);
  });

  let sent = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const user of dueUsers) {
    try {
      const tz = user.timezone || "UTC";
      const todayStr = localDateStr(now, tz);

      const { data: planRow } = await supabase
        .from("plans")
        .select("plan_json, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      // No plan yet (still on analysis/upload) — nothing to nudge them about.
      if (!planRow) {
        skipped++;
        continue;
      }

      const planStart = toDateOnlyInZone(new Date(planRow.created_at), tz);
      const today = toDateOnlyInZone(now, tz);
      const dayNumber = Math.min(
        90,
        Math.max(1, Math.floor((today.getTime() - planStart.getTime()) / MS_PER_DAY) + 1)
      );
      const phase = phaseForDay(dayNumber);
      const activeHabits = planRow.plan_json.daily_habits.filter(
        (h) => h.phase_start <= phase
      );

      if (activeHabits.length === 0) {
        skipped++;
        continue;
      }

      const { data: checkinRows } = await supabase
        .from("daily_checkins")
        .select("habit_id, done")
        .eq("user_id", user.id)
        .eq("date", todayStr);

      const doneSet = new Set(
        (checkinRows ?? []).filter((row) => row.done).map((row) => row.habit_id)
      );
      const incomplete = activeHabits.filter((h) => !doneSet.has(h.id));

      // Everything active today is already checked off — the whole point of
      // this cron is to never nag someone who's already done.
      if (incomplete.length === 0) {
        skipped++;
        continue;
      }

      const { data: streakRow } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      const { subject, headline, remainingLabels } = buildReminderMessage(
        incomplete,
        streakRow?.current_streak ?? 0
      );

      // NOTE: sent to public.users.email, which is set once at signup and
      // never updated by the settings "Change email" flow (that only updates
      // auth.users). If a user has since changed their email, this will
      // still go to their old address — fine for now, but worth syncing
      // public.users.email on email change (or reading auth.users via
      // supabase.auth.admin.getUserById) if that turns out to matter.
      await sendReminderEmail({
        to: user.email,
        firstName: user.full_name?.split(" ")[0] || "there",
        subject,
        headline,
        remainingLabels,
        planUrl: PLAN_URL,
      });

      const { error: markSentError } = await supabase
        .from("users")
        .update({ last_reminded_at: now.toISOString() })
        .eq("id", user.id);
      if (markSentError) throw markSentError;

      sent++;
    } catch (err) {
      console.error(`REMINDER CRON ERROR (user ${user.id}):`, err);
      failed.push(user.id);
    }
  }

  return NextResponse.json({
    utcHour: now.getUTCHours(),
    candidates: candidates?.length ?? 0,
    due: dueUsers.length,
    sent,
    skipped,
    failed: failed.length,
  });
}
