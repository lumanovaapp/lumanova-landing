"use client";

import { useRef, useState } from "react";
import { Play, Maximize2, Volume2, VolumeX } from "lucide-react";

interface TechniqueVideoPanelProps {
  src: string;
  label: string;
  onEnlarge: () => void;
}

// Compact click-to-play player shown on the RIGHT side of an expanded habit
// card (desktop only — see HabitCard, which skips this on mobile in favor
// of opening the video straight into TechniqueVideoModal). Never autoplays.
export default function TechniqueVideoPanel({
  src,
  label,
  onEnlarge,
}: TechniqueVideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <div className="relative w-full sm:w-44 md:w-48 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-pure-black/40">
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        playsInline
        loop
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full aspect-video sm:aspect-square object-cover cursor-pointer"
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={`Play ${label} video`}
          className="absolute inset-0 flex items-center justify-center bg-pure-black/35 hover:bg-pure-black/20 transition-colors focus-gold"
        >
          <span className="w-9 h-9 rounded-full bg-lumen-gold flex items-center justify-center shadow-[0_0_16px_rgba(244,196,48,0.4)]">
            <Play className="w-4 h-4 text-pure-black fill-pure-black ml-0.5" />
          </span>
        </button>
      )}

      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="w-6 h-6 rounded-full bg-pure-black/60 flex items-center justify-center text-cream-ivory/80 hover:text-cream-ivory transition-colors focus-gold"
        >
          {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnlarge();
          }}
          aria-label="Enlarge video"
          className="w-6 h-6 rounded-full bg-pure-black/60 flex items-center justify-center text-cream-ivory/80 hover:text-cream-ivory transition-colors focus-gold"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
