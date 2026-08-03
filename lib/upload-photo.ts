import type { createClient } from "@/utils/supabase/client";
import { PhotoMilestone } from "@/lib/types";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.85;

export function resizeToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Your browser does not support image processing."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error("Could not process that image."));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image."));
    };
    img.src = objectUrl;
  });
}

export async function uploadPhoto(
  supabase: SupabaseBrowserClient,
  userId: string,
  file: File,
  options?: { photoType?: PhotoMilestone }
): Promise<string> {
  const resizedBlob = await resizeToJpeg(file);
  const storagePath = `${userId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("selfies")
    .upload(storagePath, resizedBlob, {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data: photoRow, error: insertError } = await supabase
    .from("photos")
    .insert({
      user_id: userId,
      storage_path: storagePath,
      status: "analyzing",
      ...(options?.photoType ? { photo_type: options.photoType } : {}),
    })
    .select("id")
    .single();

  if (insertError || !photoRow) {
    throw insertError ?? new Error("Could not save the photo.");
  }

  return photoRow.id;
}
