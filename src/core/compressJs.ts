import { postMessage } from "../utils/worker";

export async function compressImageJs(
  file: File,
  options: {
    quality?: number;
    /**
     * @description The type of the file. If not provided, the type of the file will be used.
     * @mark MIME type
     */
    type?: string;
  } = {}
) {
  const url = URL.createObjectURL(file);
  const { quality = 80, type = file.type } = options;
  const result = await postMessage<{ buf: ArrayBuffer }>("compressJs", {
    url,
    quality: quality / 100,
    type,
  });
  URL.revokeObjectURL(url);

  if (!result) {
    throw new Error("Failed to compress image");
  }

  const newFile = new File([result.buf], file.name, {
    ...file,
    type,
  });

  if (newFile.size > file.size) {
    return file;
  }

  return newFile;
}