import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildDoneFlags, computeStreakState, dateToStr } from "@/lib/streak";
import { checkAndAwardAchievements } from "@/lib/check-achievements";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      habit_id?: string;
      date?: string;
      done?: boolean;
    };

    if (
      !body.habit_id ||
      typeof body.habit_id !== "string" ||
      !body.date ||
      !DATE_RE.test(body.date) ||
      typeof body.done !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid check-in payload" }, { status: 400 });
    }

    const { habit_id, date, done } = body;

    // (1) & (2): real columns are user_id, habit_id, date, done — the upsert
    // conflict target matches the daily_checkins_user_habit_date_key unique
    // constraint on (user_id, habit_id, date).
    const { error: checkinError } = await supabase
      .from("daily_checkins")
      .upsert(
        { user_id: user.id, habit_id, date, done },
        { onConflict: "user_id,habit_id,date" }
      );

    if (checkinError) {
      console.error("CHECKIN ERROR:", checkinError);
      return NextResponse.json({ error: checkinError.message }, { status: 500 });
    }

    // (3) Streak recompute is a separate concern from saving the check-in —
    // wrap it on its own so a failure here can't be confused with the upsert
    // above, and so the check-in is never silently lost behind a streak bug.
    try {
      const { data: planRow, error: planError } = await supabase
        .from("plans")
        .select("plan_json, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planError) throw planError;

      if (!planRow) {
        return NextResponse.json({ current: 0, best: 0, freezes: 0 });
      }

      const { data: checkinRows, error: checkinsFetchError } = await supabase
        .from("daily_checkins")
        .select("habit_id, date, done")
        .eq("user_id", user.id);

      if (checkinsFetchError) throw checkinsFetchError;

      const doneFlags = buildDoneFlags(
        planRow.created_at,
        planRow.plan_json.daily_habits,
        checkinRows ?? []
      );
      const state = computeStreakState(doneFlags);

      // streaks columns: current_streak, longest_streak, last_checkin_date
      // (unchanged since original setup) plus freezes, last_freeze_award
      // (added for the earned streak-freeze system — see migration SQL).
      const { data: streakRow, error: streakFetchError } = await supabase
        .from("streaks")
        .select("longest_streak, freezes")
        .eq("user_id", user.id)
        .maybeSingle();

      if (streakFetchError) throw streakFetchError;

      const freezesBefore = streakRow?.freezes ?? 0;
      const best = Math.max(state.best, streakRow?.longest_streak ?? 0);

      const { error: streakUpsertError } = await supabase.from("streaks").upsert(
        {
          user_id: user.id,
          current_streak: state.current,
          longest_streak: best,
          last_checkin_date: dateToStr(new Date()),
          freezes: state.freezes,
          last_freeze_award: state.lastFreezeAward,
        },
        { onConflict: "user_id" }
      );

      if (streakUpsertError) throw streakUpsertError;

      // Streak + habit-count badges both depend on state just written above,
      // so this has to run after the upserts, not before.
      const newlyUnlocked = await checkAndAwardAchievements(user.id);

      return NextResponse.json({
        current: state.current,
        best,
        freezes: state.freezes,
        // computeStreakState is pure — replaying the same fixed history always
        // yields the same freeze count, so comparing against what was
        // persisted before this call tells us what just changed this request.
        freezeUsedToday: state.freezes < freezesBefore,
        freezeEarnedToday: state.freezes > freezesBefore,
        newlyUnlocked,
      });
    } catch (streakErr) {
      console.error("CHECKIN ERROR:", streakErr);
      return NextResponse.json(
        {
          error: streakErr instanceof Error ? streakErr.message : String(streakErr),
          checkinSaved: true,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    // (4) Nothing above this point should ever throw silently.
    console.error("CHECKIN ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
