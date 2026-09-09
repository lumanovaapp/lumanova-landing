import { Check } from "lucide-react";
import {
  checkPasswordRequirements,
  getPasswordStrength,
  PasswordStrength,
} from "@/lib/password-strength";

interface PasswordStrengthMeterProps {
  password: string;
}

const STRENGTH_COPY: Record<
  PasswordStrength,
  { label: string; barClass: string; textClass: string; segments: 0 | 1 | 2 | 3 }
> = {
  empty: { label: "", barClass: "bg-white/10", textClass: "text-cream-ivory/40", segments: 0 },
  weak: { label: "Weak", barClass: "bg-red-400", textClass: "text-red-400", segments: 1 },
  medium: { label: "Medium", barClass: "bg-lumen-gold", textClass: "text-lumen-gold", segments: 2 },
  strong: { label: "Strong", barClass: "bg-green-400", textClass: "text-green-400", segments: 3 },
};

// Real-time checklist + color-coded strength bar for every password field
// in the app (signup, reset, change-password) — see lib/password-strength.ts.
export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements = checkPasswordRequirements(password);
  const strength = getPasswordStrength(password);
  const { label, barClass, textClass, segments } = STRENGTH_COPY[strength];

  return (
    <div className="flex flex-col gap-3">
      {password.length > 0 && (
        <div>
          <div className="flex gap-1.5 h-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors duration-300 ${
                  i < segments ? barClass : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium mt-1.5 ${textClass}`}>{label}</p>
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {requirements.map((req) => (
          <li
            key={req.key}
            className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
              req.met ? "text-green-400" : "text-cream-ivory/40"
            }`}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full border flex-shrink-0 transition-colors duration-300 ${
                req.met ? "bg-green-400/15 border-green-400/40" : "border-white/15"
              }`}
            >
              {req.met && <Check className="w-2.5 h-2.5" />}
            </span>
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
