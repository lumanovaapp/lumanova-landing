"use client";

import { useState } from "react";
import { Check, Loader2, Maximize2 } from "lucide-react";
import { PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import MilestoneUpload from "@/components/dashboard/plan/MilestoneUpload";
import PhotoLightbox, { LightboxImage } from "@/components/dashboard/plan/PhotoLightbox";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";

export const MILESTONE_LABELS: Record<PhotoMilestone, string> = {
  baseline: "Baseline",
  day_30: "Day 30 Check-In",
  day_60: "Day 60 Check-In",
  day_90: "Day 90 Check-In",
};

export interface MilestoneSectionProps {
  milestoneType: PhotoMilestone;
  photo: MilestonePhotoSummary | undefined;
  baselinePhotoUrl: string | null;
  onUploaded: () => void;
}

// The one place a milestone photo actually gets uploaded and its before/after
// comparison reviewed — shared by every surface that can trigger it (the
// Progress tab's timeline, and DayDrawer's day-habits panel for the rare case
// a milestone day is opened there) so the upload/comparison/retry flow is
// never re-implemented per surface.
export function MilestoneSection({
  milestoneType,
  photo,
  baselinePhotoUrl,
  onUploaded,
}: MilestoneSectionProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  async function handleRetry() {
    if (!photo) return;
    setRetrying(true);
    setRetryError("");

    try {
      const response = await fetchWithTimeout("/api/milestone-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id }),
      });
      if (!response.ok) {
        throw await apiErrorFromJson(response, "Comparison failed again.");
      }
      onUploaded();
    } catch (err) {
      setRetryError(toFriendlyMessage(err));
    } finally {
      setRetrying(false);
    }
  }

  if (!photo) {
    return (
      <MilestoneUpload
        milestoneType={milestoneType}
        label={`Check in — ${MILESTONE_LABELS[milestoneType]}`}
        onUploaded={onUploaded}
      />
    );
  }

  if (photo.comparison) {
    const c = photo.comparison;

    // Built only from whichever photos actually exist, so the lightbox's
    // index always lines up with what's tappable — no gaps for a missing
    // baseline (rare, but possible on very old accounts).
    const comparisonImages: LightboxImage[] = [];
    const beforeIndex = baselinePhotoUrl
      ? comparisonImages.push({ url: baselinePhotoUrl, label: "Before — Baseline" }) - 1
      : -1;
    const afterIndex = photo.photoUrl
      ? comparisonImages.push({
          url: photo.photoUrl,
          label: `After — ${MILESTONE_LABELS[milestoneType]}`,
        }) - 1
      : -1;

    return (
      <div className="rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] p-5">
        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-2">
          {MILESTONE_LABELS[milestoneType]}
        </p>
        {comparisonImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <ComparisonPhotoTile
              url={baselinePhotoUrl}
              tag="Before"
              caption="Baseline"
              onOpen={() => setLightboxIndex(beforeIndex)}
            />
            <ComparisonPhotoTile
              url={photo.photoUrl}
              tag="After"
              caption={MILESTONE_LABELS[milestoneType]}
              onOpen={() => setLightboxIndex(afterIndex)}
            />
          </div>
        )}
        <PhotoLightbox
          images={comparisonImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
        <p className="font-manrope font-semibold text-sm text-cream-ivory mb-3">
          {c.headline}
        </p>
        {c.improvements.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wide text-cream-ivory/50 font-medium mb-1.5">
              Improvements
            </p>
            <ul className="space-y-1">
              {c.improvements.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-cream-ivory"
                >
                  <Check className="w-3.5 h-3.5 text-lumen-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {c.keep_working.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wide text-cream-ivory/50 font-medium mb-1.5">
              Keep Working On
            </p>
            <ul className="space-y-1">
              {c.keep_working.map((item, i) => (
                <li key={i} className="text-xs text-cream-ivory/70">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-cream-ivory/60 italic">{c.next_focus}</p>
      </div>
    );
  }

  if (photo.status === "failed") {
    return (
      <div className="rounded-3xl border border-warm-coral/30 bg-warm-coral/5 p-5">
        <p className="text-sm text-warm-coral mb-3">
          {retryError || "We couldn't compare your progress photo."}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="h-9 px-4 rounded-full bg-lumen-gold text-pure-black text-xs font-manrope font-bold flex items-center gap-2 hover:bg-lumen-gold/90 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:active:scale-100 focus-gold"
        >
          {retrying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {retrying ? "Comparing your progress…" : "Try again"}
        </button>
        {retrying && (
          <p className="text-xs text-cream-ivory/50 mt-2">
            This usually takes about 10 seconds.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 flex items-center gap-3">
      <Loader2 className="w-4 h-4 text-lumen-gold animate-spin flex-shrink-0" />
      <div>
        <p className="text-sm text-cream-ivory/70">Analyzing your progress…</p>
        <p className="text-xs text-cream-ivory/50 mt-0.5">
          This usually takes about 10 seconds.
        </p>
      </div>
    </div>
  );
}

interface ComparisonPhotoTileProps {
  url: string | null;
  tag: string;
  caption: string;
  onOpen: () => void;
}

// One side of the before/after pair — a real, viewable photo size instead of
// a small thumbnail strip, with a persistent expand affordance (visible on
// tap-only devices, not just on hover) that opens the shared lightbox.
function ComparisonPhotoTile({ url, tag, caption, onOpen }: ComparisonPhotoTileProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onOpen}
        disabled={!url}
        aria-label={`View ${tag.toLowerCase()} photo full-size`}
        className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5 focus-gold disabled:cursor-default"
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${tag} — ${caption}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pure-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-pure-black/60 border border-white/15 flex items-center justify-center text-cream-ivory/80 opacity-80 group-hover:opacity-100 group-hover:bg-pure-black/80 transition-all duration-300">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-cream-ivory/25 text-xs">
            No photo
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-pure-black/70 text-cream-ivory/90 border border-white/10">
          {tag}
        </span>
      </button>
      <p className="text-xs uppercase tracking-wide text-cream-ivory/40 mt-2 text-center">
        {caption}
      </p>
    </div>
  );
}
