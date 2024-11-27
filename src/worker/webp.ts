import initWebpEncoder from "../wasm/webp_enc";
import type { WebPModule } from "../wasm/webp_enc";

const webpEncoder = initWebpEncoder();

const encoderInstance = webpEncoder.then(
  async (
    res: WebPModule & {
      ready: Promise<unknown>;
    }
  ) => {
    await res.ready;
    return res;
  }
) as Promise<WebPModule>;

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
    quality: number;
  };
}

export type MessageData = ToWebpData;

const postMessage = (
  id: string,
  data?: unknown,
  options?: WindowPostMessageOptions
) => {
  self.postMessage(
    {
      id,
      data,
    },
    options
  );
};

self.addEventListener("message", async (e) => {
  const message = e.data as MessageData;
  const encoder = await encoderInstance;

  switch (message.type) {
    case "toWebp": {
      const encodedData = encoder.encode(
        new Uint8Array(message.data.buffer),
        message.data.width,
        message.data.height,
        {
          ...DEFAULT_ENCODE_OPTS,
          quality: message.data.quality,
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
    }
  }
});
