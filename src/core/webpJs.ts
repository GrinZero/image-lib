import { postMessage } from "../utils/worker";

export async function toWebpJs(
  file: File,
  options: {
    quality?: number;
    /**
     * @description If true, the compression will be biased towards smaller size。 So, if the compressed volume is larger, the original file will be used.
     * @default true
     */
    biasCompression?: boolean;
  } = {}
) {
  const url = URL.createObjectURL(file);
  const { quality = 80, biasCompression = true } = options;
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

  if (biasCompression && newFile.size > file.size) {
    return file;
  }

  return newFile;
}
