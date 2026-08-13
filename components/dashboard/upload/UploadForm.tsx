"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, ImageOff, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadPhoto,
} from "@/lib/upload-photo";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import { showAchievementToasts } from "@/components/AchievementToast";

type Stage = "idle" | "uploading" | "analyzing";

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function UploadForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  // Set once the photo is actually uploaded to storage. A retry after an
  // analyze failure reuses this id instead of re-uploading the same photo.
  const [uploadedPhotoId, setUploadedPhotoId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleSelectedFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("That image is too large. Please choose one under 10MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setUploadedPhotoId(null);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleSelectedFile(file);
  }

  function handleCameraCaptured(file: File) {
    setShowCamera(false);
    handleSelectedFile(file);
  }

  function handleChooseDifferent() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    setStage("idle");
    setUploadedPhotoId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setError("");

    try {
      // A retry after the analyze step failed already has a photo in
      // storage — reuse it instead of uploading the same file again.
      let photoId = uploadedPhotoId;
      if (!photoId) {
        setStage("uploading");
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("You need to be signed in to upload a photo.");
        }

        photoId = await uploadPhoto(supabase, user.id, selectedFile);
        setUploadedPhotoId(photoId);
      }

      setStage("analyzing");

      const analyzeResponse = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!analyzeResponse.ok) {
        throw await apiErrorFromJson(analyzeResponse, "Analysis failed. Please try again.");
      }

      const analyzeData = (await analyzeResponse.json()) as { newlyUnlocked?: string[] };
      if (analyzeData.newlyUnlocked && analyzeData.newlyUnlocked.length > 0) {
        showAchievementToasts(analyzeData.newlyUnlocked);
      }

      router.push(`/dashboard/upload/${photoId}`);
    } catch (err) {
      setError(toFriendlyMessage(err));
      setStage("idle");
    }
  }

  const isBusy = stage === "uploading" || stage === "analyzing";

  return (
    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-6 sm:p-10">
      {isBusy ? (
        <div className="flex flex-col items-center py-10 text-center">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected selfie"
              className="w-28 h-28 rounded-2xl object-cover mb-6 border border-white/10 opacity-50"
            />
          )}
          <div className="relative flex items-center justify-center w-16 h-16 mb-5">
            <motion.span
              className="absolute inset-0 rounded-full bg-lumen-gold/15"
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20">
              <Loader2 className="w-7 h-7 text-lumen-gold animate-spin" />
            </span>
          </div>
          <p className="font-manrope font-semibold text-lg text-cream-ivory">
            {stage === "uploading"
              ? "Uploading your photo…"
              : "Analyzing your features…"}
          </p>
          {stage === "analyzing" && (
            <p className="font-inter text-sm text-cream-ivory/55 mt-2">
              This usually takes 10-20 seconds.
            </p>
          )}
        </div>
      ) : previewUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected selfie"
            className="w-52 h-52 rounded-2xl object-cover mb-6 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          />
          {error && (
            <div className="mb-4 w-full rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleChooseDifferent}
              className="flex-1 h-14 inline-flex items-center justify-center rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-medium hover:bg-lumen-gold/10 hover:border-lumen-gold/60 transition-all duration-300 focus-gold"
            >
              Choose different
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="flex-1 h-14 inline-flex items-center justify-center gap-2 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold"
            >
              {error ? "Try again" : "Analyze my photo"}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          {error && (
            <div className="mb-5 w-full rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-center gap-2 text-sm text-red-400">
              <ImageOff className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <motion.label
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] focus-within:outline focus-within:outline-2 focus-within:outline-lumen-gold/60 focus-within:outline-offset-2 transition-[border-color,background-color,box-shadow] duration-300"
            >
              <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                <Upload className="w-5 h-5 text-lumen-gold" />
              </span>
              <span className="text-sm font-manrope font-semibold text-cream-ivory">
                Upload a photo
              </span>
              <span className="text-xs text-cream-ivory/45">
                From your device
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.label>

            {mobile ? (
              <motion.label
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] focus-within:outline focus-within:outline-2 focus-within:outline-lumen-gold/60 focus-within:outline-offset-2 transition-[border-color,background-color,box-shadow] duration-300"
              >
                <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                  <Camera className="w-5 h-5 text-lumen-gold" />
                </span>
                <span className="text-sm font-manrope font-semibold text-cream-ivory">
                  Use camera
                </span>
                <span className="text-xs text-cream-ivory/45">
                  Snap it live
                </span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            ) : (
              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setShowCamera(true)}
                className="group flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] transition-[border-color,background-color,box-shadow] duration-300 focus-gold"
              >
                <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                  <Camera className="w-5 h-5 text-lumen-gold" />
                </span>
                <span className="text-sm font-manrope font-semibold text-cream-ivory">
                  Use camera
                </span>
                <span className="text-xs text-cream-ivory/45">
                  Snap it live
                </span>
              </motion.button>
            )}
          </div>

          <p className="font-inter text-xs text-cream-ivory/50 mt-5">
            JPEG, PNG, or WebP · under 10MB
          </p>
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCaptured}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(
            "Could not access your camera. Check your browser permissions and try again."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], "camera-capture.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-pure-black/95 flex flex-col items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close camera"
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors focus-gold"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md">
        {error ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center mb-4">
            {error}
          </div>
        ) : (
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-charcoal">
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lumen-gold animate-spin" />
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-14 inline-flex items-center justify-center rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-medium hover:bg-lumen-gold/10 hover:border-lumen-gold/60 transition-all duration-300 focus-gold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            className="flex-1 h-14 inline-flex items-center justify-center rounded-full bg-lumen-gold text-pure-black font-manrope font-bold hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}
