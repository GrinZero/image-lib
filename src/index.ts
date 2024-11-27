import { postMessage } from "./utils/worker";
import { EncodeOptions } from "./wasm/webp_enc";

async function loadImage(src: string) {
  const img = document.createElement("img");
  img.src = src;
  await new Promise((resolve) => (img.onload = resolve));
  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [img.width, img.height];
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

/**
 * Compress image to webp
 * @param file - The image file to compress
 * @param options - The options of the compressed image
 * @returns The compressed image file
 */
export const toWebp = async (file: File, options?: EncodeOptions) => {
  const url = URL.createObjectURL(file);
  const imageData = await loadImage(url);
  URL.revokeObjectURL(url);

  const buffer = imageData.data.buffer;

  const result = await postMessage<{ encodedData: ArrayBuffer }>(
    "toWebp",
    {
      buffer,
      width: imageData.width,
      height: imageData.height,
      options,
    },
    { postMessageOptions: { transfer: [buffer] } }
  );

  if (!result?.encodedData) {
    throw new Error("Failed to compress image");
  }

  const newFile = new File([result.encodedData], file.name, {
    ...file,
  });

  if (newFile.size > file.size) {
    return file;
  }

  return newFile;
};

export type { EncodeOptions };