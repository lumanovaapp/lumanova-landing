import LogoutButton from "./LogoutButton";

interface UserFooterProps {
  fullName: string;
  email?: string | null;
}

export default function UserFooter({ fullName, email }: UserFooterProps) {
  const initial = fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="border-t border-white/[0.08] pt-4 mt-4">
      <div className="flex items-center gap-3 px-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4C430] to-[#1A1A1A] text-white flex items-center justify-center font-manrope font-bold text-sm flex-shrink-0 shadow-[0_0_0_1px_rgba(244,196,48,0.25)]">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-cream-ivory font-medium truncate">
            {fullName}
          </p>
          {email && (
            <p className="text-xs text-cream-ivory/50 truncate">{email}</p>
          )}
        </div>
      </div>
      <LogoutButton className="w-full justify-center mt-3" />
    </div>
  );
}
