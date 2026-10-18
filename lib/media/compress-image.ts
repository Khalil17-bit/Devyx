/**
 * Client-Side Browser WebP Image Compression Engine
 * Strictly adheres to PRD Section 6.3:
 * Automatically scales down large screenshots/mockups to max 1920px dimension
 * and encodes to modern WebP format at 85% quality in-browser prior to upload,
 * conserving the Supabase Free Tier 1 GB storage quota.
 */
export async function compressImageToWebP(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<{ blob: Blob; fileName: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    // If SVG, skip raster compression
    if (file.type === "image/svg+xml") {
      resolve({
        blob: file,
        fileName: file.name,
        originalSize: file.size,
        compressedSize: file.size,
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate scaled dimensions maintaining strict aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable for image compression."));
        return;
      }

      // Draw and compress to WebP
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("WebP blob conversion failure."));
            return;
          }

          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
          const webpName = `${cleanName}_${Date.now()}.webp`;

          resolve({
            blob,
            fileName: webpName,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image file into browser buffer."));
    };

    img.src = objectUrl;
  });
}
