import { compressJsInWorker } from "../compress/compressJs";
import { postMessage2Main } from "../utils/message";

export interface ToWebpJsData {
  id: string;
  type: "toWebpJs";
  data: {
    url: string;
    quality: number;
  };
}

export async function webpJsHandler(message: ToWebpJsData) {
  const blob = await fetch(message.data.url).then((res) => res.blob());
  const webpBlob = await compressJsInWorker(
    blob,
    "image/webp",
    message.data.quality
  );
  const buf = await webpBlob.arrayBuffer();
  postMessage2Main(message.id, { buf }, { transfer: [buf] });
}
