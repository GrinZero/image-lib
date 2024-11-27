import WebpWorker from "../worker/webp?worker&inline";

const worker = new WebpWorker();

export interface Options {
  /**
   * 是否需要回复
   * @default true
   */
  hasCallback?: boolean;

  /**
   * 超时时间
   * @default 10000
   */
  timeout?: number;

  postMessageOptions?: StructuredSerializeOptions;
}
export const postMessage = <T = unknown>(
  type: string,
  data: unknown,
  options?: Options
) => {
  const id = Math.random().toString(36).substring(2, 15);
  const opts = {
    hasCallback: true,
    timeout: 10000,
    ...(options || {}),
  };

  worker.postMessage(
    {
      id,
      type,
      data,
    },
    opts.postMessageOptions
  );

  if (opts.hasCallback) {
    return new Promise<T>((resolve, reject) => {
      const timeout = opts.timeout;
      const timeId = setTimeout(() => {
        worker.removeEventListener("message", listener);
        reject(new Error("timeout"));
      }, timeout);
      const listener = (e: MessageEvent) => {
        if (e.data.id === id) {
          clearTimeout(timeId);
          worker.removeEventListener("message", listener);
          resolve(e.data.data);
        }
      };
      worker.addEventListener("message", listener);
    });
  }
  return Promise.resolve<null>(null);
};