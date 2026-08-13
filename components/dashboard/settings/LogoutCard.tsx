import { LogOut } from "lucide-react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import SettingsCard from "./SettingsCard";

interface LogoutCardProps {
  delay?: number;
}

export default function LogoutCard({ delay = 0 }: LogoutCardProps) {
  return (
    <SettingsCard delay={delay} className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <LogOut className="w-4 h-4 text-lumen-gold" />
        </div>
        <div>
          <h3 className="font-manrope font-semibold text-cream-ivory">Log out</h3>
          <p className="text-sm text-cream-ivory/50 mt-0.5">
            End your session on this device.
          </p>
        </div>
      </div>
      <LogoutButton className="focus-gold border border-white/10 hover:border-lumen-gold/30" />
    </SettingsCard>
  );
}
