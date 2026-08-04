"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, ImageOff, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadPhoto,
} from "@/lib/upload-photo";

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
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setError("");
    setStage("uploading");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You need to be signed in to upload a photo.");
      }

      const photoId = await uploadPhoto(supabase, user.id, selectedFile);

      setStage("analyzing");

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!analyzeResponse.ok) {
        const body = await analyzeResponse.json().catch(() => null);
        throw new Error(body?.error ?? "Analysis failed. Please try again.");
      }

      router.push(`/dashboard/upload/${photoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    }
  }

  const isBusy = stage === "uploading" || stage === "analyzing";

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
        Step 1
      </p>
      <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
        Upload a selfie
      </h1>
      <p className="font-inter text-base text-cream-ivory/70 mt-2">
        Good lighting, no filters, face clearly visible. We&apos;ll analyze
        your skin, hair, grooming, and style.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        {isBusy ? (
          <div className="flex flex-col items-center py-10 text-center">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Selected selfie"
                className="w-32 h-32 rounded-2xl object-cover mb-6 opacity-60"
              />
            )}
            <Loader2 className="w-8 h-8 text-lumen-gold animate-spin mb-4" />
            <p className="font-manrope font-semibold text-lg text-cream-ivory">
              {stage === "uploading"
                ? "Uploading your photo…"
                : "Analyzing your features…"}
            </p>
            {stage === "analyzing" && (
              <p className="font-inter text-sm text-cream-ivory/60 mt-2">
                This usually takes 5-15 seconds.
              </p>
            )}
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected selfie"
              className="w-48 h-48 rounded-2xl object-cover mb-6"
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
                className="flex-1 h-14 rounded-xl border border-white/15 text-cream-ivory/70 font-manrope font-medium hover:bg-white/5 hover:text-cream-ivory transition-colors"
              >
                Choose different
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="flex-1 h-14 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
              >
                {error ? "Try again" : "Analyze my photo"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            {error && (
              <div className="mb-5 w-full rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-center gap-2 text-sm text-red-400">
                <ImageOff className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <label className="card-lift group flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] transition-all duration-300">
                <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                  <Upload className="w-5 h-5 text-lumen-gold" />
                </span>
                <span className="text-sm font-manrope font-semibold text-cream-ivory">
                  Upload a photo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {mobile ? (
                <label className="card-lift group flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] transition-all duration-300">
                  <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                    <Camera className="w-5 h-5 text-lumen-gold" />
                  </span>
                  <span className="text-sm font-manrope font-semibold text-cream-ivory">
                    Use camera
                  </span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="card-lift group flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent cursor-pointer hover:border-lumen-gold/50 hover:bg-lumen-gold/5 hover:shadow-[0_8px_24px_rgba(244,196,48,0.12)] transition-all duration-300"
                >
                  <span className="w-11 h-11 rounded-full bg-lumen-gold/10 flex items-center justify-center group-hover:bg-lumen-gold/20 transition-colors duration-300">
                    <Camera className="w-5 h-5 text-lumen-gold" />
                  </span>
                  <span className="text-sm font-manrope font-semibold text-cream-ivory">
                    Use camera
                  </span>
                </button>
              )}
            </div>

            <p className="font-inter text-xs text-cream-ivory/50 mt-4">
              JPEG, PNG, or WebP · under 10MB
            </p>
          </div>
        )}
      </div>

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
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors"
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
            className="flex-1 h-14 rounded-xl border border-white/15 text-cream-ivory/70 font-manrope font-medium hover:bg-white/5 hover:text-cream-ivory transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            className="flex-1 h-14 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}
