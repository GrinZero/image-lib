import initWebpEncoder from "../../wasm/webp_enc";
import type { EncodeOptions, WebPModule } from "../../wasm/webp_enc";
import { toWebpJsInWorker } from "./toWebpJs";

const webpEncoder = initWebpEncoder();

const encoderInstance = webpEncoder.then(async (res: WebPModule) => {
  const moduleWithReady = res as WebPModule & { ready: Promise<unknown> };
  await moduleWithReady.ready;
  return moduleWithReady;
}) as Promise<WebPModule>;

const DEFAULT_ENCODE_OPTS = {
  quality: 100,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0,
};

export interface ToWebpData {
  id: string;
  type: "toWebp";
  data: {
    buffer: ArrayBuffer;
    width: number;
    height: number;
    options?: EncodeOptions;
  };
}

export interface ToWebpJsData {
  id: string;
  type: "toWebpJs";
  data: {
    url: string;
    quality: number;
  };
}
export type MessageData = ToWebpData | ToWebpJsData;

const postMessage = (
  id: string,
  data?: unknown,
  options?: WindowPostMessageOptions
) => {
  try {
    self.postMessage(
      {
        id,
        data,
      },
      options
    );
  } catch (error) {
    self.postMessage(
      {
        id,
        data: { error, type: "error" },
      },
      options
    );
  }
};

self.addEventListener("message", async (e) => {
  const message = e.data as MessageData;
  try {
    const encoder = await encoderInstance;

    switch (message.type) {
      case "toWebp": {
        const encodedData = encoder.encode(
          message.data.buffer,
          message.data.width,
          message.data.height,
          {
            ...DEFAULT_ENCODE_OPTS,
            ...(message.data.options || {}),
          }
        );
        const arrayBuffer = encodedData ? encodedData.buffer : null;
        postMessage(
          message.id,
          {
            encodedData: arrayBuffer,
          },
          arrayBuffer
            ? {
                transfer: [arrayBuffer],
              }
            : void 0
        );
        break;
      }
      case "toWebpJs": {
        const blob = await fetch(message.data.url).then((res) => res.blob());
        const webpBlob = await toWebpJsInWorker(blob, message.data.quality);
        const buf = await webpBlob.arrayBuffer();
        postMessage(message.id, { buf }, { transfer: [buf] });
      }
    }
  } catch (error) {
    postMessage(message.id, { error, type: "error" });
  }
});
