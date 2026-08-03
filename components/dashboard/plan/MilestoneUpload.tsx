"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadPhoto,
} from "@/lib/upload-photo";
import { PhotoMilestone } from "@/lib/types";

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

      const response = await fetch("/api/milestone-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not compare your progress photo.");
      }

      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
    <div className="rounded-2xl border border-lumen-gold/30 bg-lumen-gold/5 p-4">
      <p className="font-manrope font-semibold text-sm text-cream-ivory mb-1">
        {label}
      </p>
      <p className="text-xs text-cream-ivory/60 mb-3">
        Upload a fresh selfie to see your progress since day 1.
      </p>
      {error && (
        <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      <label
        className={`w-full h-11 rounded-lg bg-lumen-gold text-pure-black font-manrope font-bold text-sm flex items-center justify-center gap-2 transition-shadow duration-300 ${
          busy
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-[0_0_20px_rgba(244,196,48,0.35)]"
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
    </div>
  );
}
