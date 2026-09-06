import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { phaseForDay, toDateOnlyUTC, dateToStr } from "@/lib/streak";
import { buildReminderMessage } from "@/lib/reminder-message";
import { sendReminderEmail } from "@/lib/send-reminder-email";

export const runtime = "nodejs";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PLAN_URL = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://lumanova.app"}/dashboard/plan`;

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
// finds users whose reminder hour is the current UTC hour and who haven't
// already been reminded today, skips anyone who's already finished today's
// habits, and emails the rest a specific "here's what's left" nudge.
//
// KNOWN LIMITATION: `users.reminder_time` has no timezone attached (see
// types/database.ts) — it's treated as a UTC hour here, so a user's reminder
// will actually land at their chosen clock time only if they happen to be in
// UTC. Fix: add a `users.timezone` column (IANA name, e.g. "America/New_York"),
// capture it once client-side via `Intl.DateTimeFormat().resolvedOptions().timeZone`
// (e.g. in RemindersCard.tsx, or once at signup), and convert reminder_time
// with it here instead of reading the UTC hour directly.
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const nowUtcHour = now.getUTCHours();
  const todayStr = dateToStr(now);
  const todayStartIso = `${todayStr}T00:00:00.000Z`;

  const { data: candidates, error: usersError } = await supabase
    .from("users")
    .select("id, email, full_name, reminder_time, last_reminded_at")
    .eq("reminder_enabled", true)
    // Not already reminded today (UTC calendar day) — the actual per-user
    // send guard; the hour filter below just narrows which users are even
    // worth checking on this particular run.
    .or(`last_reminded_at.is.null,last_reminded_at.lt.${todayStartIso}`);

  if (usersError) {
    console.error("REMINDER CRON ERROR (fetch users):", usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const dueUsers = (candidates ?? []).filter(
    (u) => parseInt((u.reminder_time ?? "").slice(0, 2), 10) === nowUtcHour
  );

  let sent = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const user of dueUsers) {
    try {
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

      const planStart = toDateOnlyUTC(new Date(planRow.created_at));
      const today = toDateOnlyUTC(now);
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
    hour: nowUtcHour,
    candidates: candidates?.length ?? 0,
    due: dueUsers.length,
    sent,
    skipped,
    failed: failed.length,
  });
}
