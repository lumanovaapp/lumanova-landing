import { ReactNode } from "react";

interface AuthBackgroundProps {
  children: ReactNode;
}

// Shared full-page background for every "landing" auth page (login, signup,
// forgot-password) — centralized so the pages can't drift from each other,
// and a future background tweak is a one-file change instead of several.
// Not used by update-password, which is reached from an email link rather
// than browsed to directly.
//
// Deliberately no imagery — a calm, warm near-black gradient with a soft
// gold glow top-center, so the card (logo, heading, form, the single solid-
// gold button) reads as the only thing competing for attention on the page.
export default function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-10 sm:px-10 [padding-top:max(2.5rem,env(safe-area-inset-top))] [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))]"
      style={{
        background:
          "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(224,169,46,0.10) 0%, rgba(224,169,46,0) 100%), linear-gradient(160deg, #14100a 0%, #0e0b06 100%)",
      }}
    >
      <div className="relative w-full flex justify-center">{children}</div>
    </main>
  );
}
