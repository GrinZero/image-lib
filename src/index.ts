import { postMessage } from "./utils/worker";
import { EncodeOptions } from "./wasm/webp_enc";

/**
 * Compress image to webp
 * @param file - The image file to compress
 * @param options - The options of the compressed image
 * @returns The compressed image file
 */
export const toWebp = async (file: File, options?: EncodeOptions) => {
  const url = URL.createObjectURL(file);

  const result = await postMessage<{ encodedData: ArrayBuffer }>("toWebp", {
    url,
    options,
  });

  URL.revokeObjectURL(url);

  if (!result?.encodedData) {
    throw new Error("Failed to compress image");
  }

  // change name and type to webp
  const newFile = new File([result.encodedData], `${file.name}.webp`, {
    ...file,
    type: "image/webp",
  });

  if (newFile.size > file.size) {
    return file;
  }

  return newFile;
};

export async function toWebpJs(
  file: File,
  options: {
    quality?: number;
  } = {}
) {
  const url = URL.createObjectURL(file);
  const { quality = 80 } = options;
  const result = await postMessage<{ buf: ArrayBuffer }>("toWebpJs", {
    url,
    quality: quality / 100,
  });
  URL.revokeObjectURL(url);

  if (!result) {
    throw new Error("Failed to compress image");
  }

  const newFile = new File([result.buf], `${file.name}.webp`, {
    ...file,
    type: "image/webp",
  });

  return newFile;
}

export type { EncodeOptions };
