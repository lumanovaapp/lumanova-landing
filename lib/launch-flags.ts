// Pre-launch waitlist mode: hides the public "Sign in" link/button from
// marketing pages so "Join the Waitlist" is the only visible public CTA.
// /login and /signup keep working by direct URL regardless of this flag —
// it only controls whether links to them are rendered on public pages.
// Flip back to true at launch to restore the visible "Sign in" link.
// LOCAL-ONLY: temporarily flipped to true for local building/testing so the
// full Sign in / Sign up flow is visible again. Flip back to false (and do
// not commit this change) before pushing — waitlist mode expects false.
export const SHOW_PUBLIC_SIGN_IN = true;
