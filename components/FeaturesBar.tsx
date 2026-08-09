import { Fingerprint, CalendarCheck, MessageCircle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { Icon: LucideIcon; label: string }[] = [
  { Icon: Fingerprint, label: "Multi-ethnic AI" },
  { Icon: CalendarCheck, label: "90-day plan" },
  { Icon: MessageCircle, label: "Weekly check-ins" },
  { Icon: Sparkles, label: "Real results" },
];

export default function FeaturesBar() {
  return (
    <div className="bg-[#0F0F0F] py-5 md:py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Mobile: horizontal snap-scroll strip so nothing gets hidden.
            Desktop: centered row, unchanged. */}
        <div className="flex items-center gap-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible md:justify-center md:gap-0">
          {features.map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center flex-shrink-0 snap-start">
              <div className="flex items-center gap-2.5 px-5 md:px-8">
                <Icon size={15} strokeWidth={2} className="text-[#F4C430]" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F8F4E3]/45 whitespace-nowrap">
                  {label}
                </span>
              </div>
              {i < features.length - 1 && (
                <div className="w-px h-4 bg-[#F4C430]/20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
