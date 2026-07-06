export const PHOTO_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_ACCEPT_ATTRIBUTE = PHOTO_ACCEPTED_MIME_TYPES.join(",");
export const PHOTO_MAX_FILE_SIZE_MB = 8;
export const PHOTO_MAX_FILE_SIZE_BYTES = PHOTO_MAX_FILE_SIZE_MB * 1024 * 1024;
export const PHOTO_MAX_COMPRESSED_BYTES = 700_000;
export const PHOTO_MAX_COMPRESSED_KB = 700;
export const PHOTO_MAX_WIDTH_PX = 900;

export function validateImageFile(file: File): string | null {
  if (!PHOTO_ACCEPTED_MIME_TYPES.includes(file.type as (typeof PHOTO_ACCEPTED_MIME_TYPES)[number])) {
    return "Please choose a JPG, PNG, or WebP photo.";
  }
  if (file.size > PHOTO_MAX_FILE_SIZE_BYTES) {
    return `Photo is too large. Please use an image under ${PHOTO_MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

export function compressImageFile(
  file: File,
  maxWidth = PHOTO_MAX_WIDTH_PX,
  quality = 0.82
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected photo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not process the selected photo."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not prepare the photo for upload."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputType, quality);

        if (dataUrl.length > PHOTO_MAX_COMPRESSED_BYTES) {
          reject(
            new Error(
              `Photo is still too large after compression. Try a smaller image (max ~${PHOTO_MAX_COMPRESSED_KB} KB after compression).`
            )
          );
          return;
        }

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}