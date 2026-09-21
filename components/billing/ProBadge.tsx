import { Crown } from "lucide-react";

interface ProBadgeProps {
  // "pill" is the compact gold "PRO" chip that sits next to a name in the
  // sidebar; "full" spells out "Lumanova Pro" for surfaces where the badge
  // IS the statement (Settings), not an accent on something else.
  variant?: "pill" | "full";
  size?: "sm" | "md";
  className?: string;
}

// The one gold "you're a paying member" mark, shared by every surface that
// shows Pro status (sidebar/mobile drawer via UserFooter, Settings via
// SubscriptionCard). Purely presentational and server-safe — it never
// decides anything, it only renders what an isPro() call upstream already
// resolved. See lib/subscription.ts for the gate itself.
export default function ProBadge({
  variant = "pill",
  size = "sm",
  className = "",
}: ProBadgeProps) {
  const sizeClass =
    size === "sm"
      ? "text-[9px] px-1.5 py-[2px] gap-1"
      : "text-[11px] px-2.5 py-1 gap-1.5";
  const iconClass = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <span
      className={`inline-flex items-center rounded-full font-manrope font-extrabold uppercase tracking-[0.12em] text-pure-black bg-gradient-to-br from-[#FBE08A] via-[#F4C430] to-[#D9A518] shadow-[0_1px_3px_rgba(0,0,0,0.35),0_0_12px_rgba(244,196,48,0.35)] ${sizeClass} ${className}`}
    >
      <Crown className={`${iconClass} flex-shrink-0`} aria-hidden="true" />
      {variant === "full" ? "Lumanova Pro" : "Pro"}
    </span>
  );
}
