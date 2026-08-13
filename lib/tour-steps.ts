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
    id: "streak",
    route: "/dashboard",
    target: "tour-streak",
    title: "Your streak",
    body: "Keep your streak alive by checking off your habits every day — miss a day and it resets, so consistency is everything. Earn a freeze to protect it once in a while.",
    requiresPlan: true,
  },
  {
    id: "habits",
    route: "/dashboard",
    target: "tour-habits",
    title: "Today's habits",
    body: "Your daily routine, built from your analysis. Head to your 90-Day Plan to check them off and keep your streak going.",
    requiresPlan: true,
  },
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
  {
    id: "calendar",
    route: "/dashboard/plan",
    target: "tour-calendar",
    title: "Your 90-day calendar",
    body: "Track your whole journey at a glance — gold means done, coral means missed. Keep an eye out for the milestone markers, too.",
    requiresPlan: true,
  },
  {
    id: "milestones",
    route: "/dashboard/plan",
    target: "tour-milestones",
    title: "Milestones",
    body: "Right on the calendar, upload progress photos at day 30, 60, and 90 to see how far you've come.",
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
