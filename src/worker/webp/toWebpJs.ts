export async function toWebpJsInWorker(blob: Blob, quality = 0.8) {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const img = await createImageBitmap(blob);
      const offscreenCanvas = new OffscreenCanvas(img.width, img.height);
      const ctx = offscreenCanvas.getContext("2d")!;

      ctx.drawImage(img, 0, 0);

      offscreenCanvas
        .convertToBlob({
          type: "image/webp",
          quality: quality,
        })
        .then((blob) => {
          resolve(blob);
        })
        .catch((err) => {
          reject(new Error("Failed to convert image to WebP: " + err.message));
        });
    } catch (error) {
      reject(error);
    }
  });
}
