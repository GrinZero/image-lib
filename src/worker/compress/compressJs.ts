import { postMessage2Main } from "../utils/message";

export async function compressJsInWorker(
  blob: Blob,
  type = "image/webp",
  quality = 0.8,
  size?: { width: number; height: number }
) {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const img = await createImageBitmap(blob);
      const offscreenCanvas = new OffscreenCanvas(
        size ? size.width : img.width,
        size ? size.height : img.height
      );
      const ctx = offscreenCanvas.getContext("2d")!;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        size ? size.width : img.width,
        size ? size.height : img.height
      );

      offscreenCanvas
        .convertToBlob({
          type,
          quality,
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

export interface CompressJsData {
  id: string;
  type: "compressJs";
  data: {
    url: string;
    quality: number;
    type: string;
  };
}

export async function compressJsHandler(message: CompressJsData) {
  const blob = await fetch(message.data.url).then((res) => res.blob());
  const webpBlob = await compressJsInWorker(
    blob,
    message.data.type,
    message.data.quality,
    { width: 400, height: 267 }
  );
  const buf = await webpBlob.arrayBuffer();
  postMessage2Main(message.id, { buf }, { transfer: [buf] });
}
