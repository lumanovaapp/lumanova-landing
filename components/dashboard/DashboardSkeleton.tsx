// Instant placeholder shown by each dashboard route's loading.tsx while its
// server data streams in — same generic shape everywhere since it's only
// ever on screen for a beat. Reduced-motion users get the .animate-pulse
// override defined in globals.css (a static block instead of a pulse).
export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 lg:space-y-10 animate-pulse" aria-hidden="true">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl w-full">
          <div className="h-3 w-32 rounded-full bg-white/[0.06]" />
          <div className="h-9 w-72 max-w-full rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-64 max-w-full rounded-full bg-white/[0.05]" />
        </div>
        <div className="w-28 h-28 rounded-full bg-white/[0.05] flex-shrink-0" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-4 h-40 rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="lg:col-span-8 h-40 rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="lg:col-span-4 h-52 rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="lg:col-span-8 h-52 rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    </div>
  );
}
