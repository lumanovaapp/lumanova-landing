"use client";

import { useRef, useState, ChangeEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadPhoto,
} from "@/lib/upload-photo";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import { PhotoMilestone } from "@/lib/types";
import { showAchievementToasts } from "@/components/AchievementToast";

interface MilestoneUploadProps {
  milestoneType: PhotoMilestone;
  label: string;
  onUploaded: () => void;
}

export default function MilestoneUpload({
  milestoneType,
  label,
  onUploaded,
}: MilestoneUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = !!useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("That image is too large. Please choose one under 10MB.");
      return;
    }

    setBusy(true);
    setError("");

    // Tracks whether the photo made it to storage — once it has, a
    // comparison failure shouldn't force the user to re-upload. Instead we
    // still notify the parent so it re-renders against the now-"failed"
    // photo row, which has its own retry (see PlanCalendar's MilestoneSection)
    // that re-runs only the comparison.
    let uploaded = false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You need to be signed in to upload a photo.");
      }

      const photoId = await uploadPhoto(supabase, user.id, file, {
        photoType: milestoneType,
      });
      uploaded = true;

      const response = await fetchWithTimeout("/api/milestone-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not compare your progress photo.");
      }

      const compareData = (await response.json()) as { newlyUnlocked?: string[] };
      if (compareData.newlyUnlocked && compareData.newlyUnlocked.length > 0) {
        showAchievementToasts(compareData.newlyUnlocked);
      }

      onUploaded();
    } catch (err) {
      setError(toFriendlyMessage(err));
      if (uploaded) onUploaded();
    } finally {
      setBusy(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] p-5 hover:border-lumen-gold/35 transition-[border-color] duration-300"
    >
      <p className="font-manrope font-semibold text-sm text-cream-ivory mb-1">
        {label}
      </p>
      <p className="text-xs text-cream-ivory/60 mb-4">
        Upload a fresh selfie to see your progress since day 1.
      </p>
      {error && (
        <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      <label
        className={`w-full h-12 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 focus-gold ${
          busy
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:bg-lumen-gold/90 hover:shadow-[0_0_20px_rgba(244,196,48,0.35)]"
        }`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        {busy ? "Comparing your progress…" : "Check in — upload progress photo"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleChange}
          disabled={busy}
          className="hidden"
        />
      </label>
      {busy && (
        <p className="font-inter text-xs text-cream-ivory/50 mt-2 text-center">
          This usually takes about 10 seconds.
        </p>
      )}
    </motion.div>
  );
}
