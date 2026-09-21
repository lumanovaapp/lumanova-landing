"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Add/remove a clip by editing this array — plays in this exact order,
// starting from index 0 on every fresh page load, looping forever.
const CLIPS = [
  "/background_hero_clip_1.mp4",
  "/background_hero_clip_2.mp4",
  "/background_hero_clip_3.mp4",
];

const POSTER = "/hero-banner.png";

export default function HeroBackgroundVideo() {
  const reducedMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Fixed sequential order — 1 → 2 → 3 → 1 → ... — no randomization.
  const order = CLIPS;
  const rotationEnabled = order.length > 1;

  // Two stacked <video> layers we crossfade between. `front` says which one
  // is currently visible/playing; the other sits ready with the next clip
  // preloaded, and only starts playing once the front clip actually ends.
  const [front, setFront] = useState<0 | 1>(0);
  const [layerSrc, setLayerSrc] = useState<[string, string]>([
    order[0],
    rotationEnabled ? order[1 % order.length] : "",
  ]);

  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const refs = [refA, refB] as const;

  // Index into `order` of the clip currently assigned to the front layer.
  const stepRef = useRef(0);

  const [srcA, srcB] = layerSrc;

  // Re-load the underlying <video> element whenever its assigned src changes.
  useEffect(() => {
    refA.current?.load();
  }, [srcA]);
  useEffect(() => {
    if (srcB) refB.current?.load();
  }, [srcB]);

  const showVideo = !videoError && !reducedMotion;

  // A clip only ever advances once it fires its own native "ended" event —
  // i.e. after it has played to its actual, full duration. No timers.
  const handleEnded = (layer: 0 | 1) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // eslint-disable-next-line no-console
    console.log(
      `[hero-video] ended fired: layer=${layer} front=${front} src=${video.currentSrc} currentTime=${video.currentTime.toFixed(3)} duration=${video.duration.toFixed(3)}`
    );
    if (!rotationEnabled || layer !== front) return;
    const backLayer: 0 | 1 = layer === 0 ? 1 : 0;
    stepRef.current = (stepRef.current + 1) % order.length;
    // The back layer was preloaded while the front clip played, so it can
    // start immediately — the crossfade (opacity transition) then blends
    // the frozen last frame of the finished clip into the new one.
    refs[backLayer].current?.play().catch(() => {});
    setFront(backLayer);
  };

  // Once the outgoing layer has fully faded out, park it and hand it the
  // next-but-one clip so it has the whole next playthrough to buffer.
  const handleTransitionEnd = (layer: 0 | 1) => (e: React.TransitionEvent<HTMLVideoElement>) => {
    if (!rotationEnabled || e.propertyName !== "opacity" || layer === front) return;
    const video = refs[layer].current;
    video?.pause();
    if (video) video.currentTime = 0;

    const upcomingStep = (stepRef.current + 1) % order.length;
    setLayerSrc((prev) => {
      if (prev[layer] === order[upcomingStep]) return prev;
      const next: [string, string] = [...prev];
      next[layer] = order[upcomingStep];
      return next;
    });
  };

  return (
    <div className="absolute inset-0 z-0">
      {showVideo ? (
        <>
          <video
            ref={refA}
            src={layerSrc[0] || undefined}
            autoPlay
            muted
            loop={!rotationEnabled}
            playsInline
            preload="auto"
            poster={POSTER}
            onError={() => setVideoError(true)}
            onCanPlay={() => setVideoReady(true)}
            onEnded={handleEnded(0)}
            onTransitionEnd={handleTransitionEnd(0)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              front === 0 && videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
          {rotationEnabled && (
            <video
              ref={refB}
              src={layerSrc[1] || undefined}
              muted
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              onEnded={handleEnded(1)}
              onTransitionEnd={handleTransitionEnd(1)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                front === 1 ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </>
      ) : (
        <Image src={POSTER} alt="Lumanova transformation" fill priority className="object-cover" />
      )}
      {/* Poster/base layer beneath the fading-in first clip */}
      {showVideo && !videoReady && (
        <Image src={POSTER} alt="" fill priority aria-hidden="true" className="object-cover" />
      )}
      <div className="absolute inset-0 hero-scrim" />
    </div>
  );
}
