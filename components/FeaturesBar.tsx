const features = [
  { emoji: "🧬", label: "Multi-ethnic AI" },
  { emoji: "📈", label: "90-day plan" },
  { emoji: "🪞", label: "Weekly check-ins" },
  { emoji: "🌟", label: "Real results" },
];

export default function FeaturesBar() {
  return (
    <div className="hidden md:block bg-[#0F0F0F] py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-center">
        {features.map(({ emoji, label }, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5 px-8">
              <span className="text-base leading-none" aria-hidden="true">
                {emoji}
              </span>
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F8F4E3]/45">
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
  );
}
