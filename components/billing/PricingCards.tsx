import { Check } from "lucide-react";
import UpgradeButton from "./UpgradeButton";

const FEATURES = [
  "Personalized 90-day plan",
  "AI grooming & style coach",
  "Progress & milestone comparisons",
  "Unlimited photo analyses",
];

interface PricingCardsProps {
  // Compact drops the feature list (used inside the inline Paywall card,
  // where the unlocks are already listed above it) — see
  // components/billing/Paywall.tsx.
  compact?: boolean;
}

export default function PricingCards({ compact = false }: PricingCardsProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-5 w-full ${
        compact ? "max-w-xl mx-auto" : "max-w-2xl mx-auto"
      }`}
    >
      <PlanCard name="Monthly" price="$14.99" cadence="/mo" plan="monthly" compact={compact} />
      <PlanCard
        name="Yearly"
        price="$99"
        cadence="/yr"
        plan="yearly"
        badge="Save 45%"
        highlighted
        compact={compact}
      />
    </div>
  );
}

interface PlanCardProps {
  name: string;
  price: string;
  cadence: string;
  plan: "monthly" | "yearly";
  badge?: string;
  highlighted?: boolean;
  compact?: boolean;
}

function PlanCard({ name, price, cadence, plan, badge, highlighted, compact }: PlanCardProps) {
  return (
    <div
      className={`relative rounded-3xl border p-6 flex flex-col ${
        highlighted
          ? "border-lumen-gold/40 bg-gradient-to-b from-lumen-gold/[0.09] to-lumen-gold/[0.02] shadow-[0_0_32px_rgba(244,196,48,0.12)]"
          : "border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02]"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 right-6 bg-lumen-gold text-pure-black text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(244,196,48,0.4)]">
          {badge}
        </span>
      )}

      <p className="text-xs font-bold tracking-[0.18em] uppercase text-cream-ivory/50">{name}</p>
      <p className="mt-2 font-manrope font-extrabold text-3xl text-cream-ivory">
        {price}
        <span className="text-base font-medium text-cream-ivory/50">{cadence}</span>
      </p>

      {!compact && (
        <ul className="mt-5 space-y-2.5 flex-1">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-cream-ivory/70">
              <Check className="w-4 h-4 text-lumen-gold flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <UpgradeButton plan={plan} label={`Get ${name}`} />
      </div>
    </div>
  );
}
