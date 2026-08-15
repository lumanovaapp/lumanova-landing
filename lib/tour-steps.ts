// Ordered step definitions for the guided product tour. Each step points at
// a `data-tour="<target>"` attribute somewhere in the dashboard UI and the
// route that element lives on — the tour navigates there automatically.
//
// `requiresPlan` steps are skipped entirely for users with no 90-day plan
// yet (brand-new accounts), since their target simply doesn't render. This
// is decided up front from server-known state rather than discovered by
// probing the DOM, so a first-time tour never bounces through empty pages.
export interface TourStep {
  id: string;
  route: string;
  target: string;
  title: string;
  body: string;
  requiresPlan?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "upload",
    route: "/dashboard",
    target: "tour-nav-upload",
    title: "Upload Photo",
    body: "Scan your face for a personalized grooming, skin, and style analysis.",
  },
  {
    id: "plan",
    route: "/dashboard",
    target: "tour-nav-plan",
    title: "90-Day Plan",
    body: "Once you've scanned a photo, your personalized 90-day plan lives here — daily habits, phases, and your calendar.",
  },
  // The next four all live on /dashboard/plan's "Today" tab (the default
  // tab), so none of them need to switch tabs themselves — see PlanView's
  // tour-sync effect, which forces "Today" active if the user had wandered
  // to "Journey" before reaching this point in the tour.
  {
    id: "streak",
    route: "/dashboard/plan",
    target: "tour-plan-streak",
    title: "Your streak",
    body: "Keep your streak alive by checking off your habits every day — miss a day and it resets, so consistency is everything. Earn a freeze to protect it once in a while.",
    requiresPlan: true,
  },
  {
    id: "week-strip",
    route: "/dashboard/plan",
    target: "tour-week-strip",
    title: "Your week at a glance",
    body: "Today's highlighted — the chain builds as you check off days. Tap any past day to look back, or browse other weeks with the arrows.",
    requiresPlan: true,
  },
  {
    id: "routine",
    route: "/dashboard/plan",
    target: "tour-routine",
    title: "Today's routine",
    body: "Your daily routine, split into morning and evening (plus afternoon or anytime habits when you have them) — check each off to build your streak.",
    requiresPlan: true,
  },
  {
    id: "journey",
    route: "/dashboard/plan",
    target: "tour-journey-tab",
    title: "The Journey tab",
    body: "Tap Journey anytime to see your 3 phases, your target look, and the full 90-day map.",
    requiresPlan: true,
  },
  {
    id: "coach",
    route: "/dashboard",
    target: "tour-nav-coach",
    title: "AI Coach",
    body: "Ask your personal coach anything about grooming, skincare, or style — grounded in your own analysis and plan.",
  },
  {
    id: "achievements",
    route: "/dashboard",
    target: "tour-nav-achievements",
    title: "Achievements",
    body: "Unlock badges as you build streaks, stay consistent, and hit your milestone photos.",
  },
];
