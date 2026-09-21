import LogoutButton from "./LogoutButton";
import ProBadge from "@/components/billing/ProBadge";

interface UserFooterProps {
  fullName: string;
  email?: string | null;
  // Display only — swaps the avatar's plain gradient for a gold-ringed
  // treatment and puts a PRO chip beside the name. Resolved upstream by
  // isPro() in app/dashboard/layout.tsx; nothing here gates anything.
  isPro?: boolean;
}

export default function UserFooter({ fullName, email, isPro = false }: UserFooterProps) {
  const initial = fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="border-t border-white/[0.08] pt-4 mt-4">
      <div className="flex items-center gap-3 px-1">
        {/* Pro gets a brighter gold ring and a warm glow around the avatar —
            the status should be legible at a glance even before the badge
            text is read. */}
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#F4C430] to-[#1A1A1A] text-white flex items-center justify-center font-manrope font-bold text-sm flex-shrink-0 ${
            isPro
              ? "shadow-[0_0_0_1.5px_rgba(244,196,48,0.75),0_0_14px_rgba(244,196,48,0.35)]"
              : "shadow-[0_0_0_1px_rgba(244,196,48,0.25)]"
          }`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm text-cream-ivory font-medium truncate">
              {fullName}
            </p>
            {isPro && <ProBadge className="flex-shrink-0" />}
          </div>
          {email && (
            <p className="text-xs text-cream-ivory/50 truncate">{email}</p>
          )}
        </div>
      </div>
      <LogoutButton className="w-full justify-center mt-3" />
    </div>
  );
}
