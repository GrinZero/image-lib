import { CompressJsData, compressJsHandler } from "./compress";
import { postMessage2Main } from "./utils/message";
import { webpHandler, webpJsHandler } from "./webp";
import type { ToWebpData, ToWebpJsData } from "./webp";

export type MessageData = ToWebpData | ToWebpJsData | CompressJsData;

self.addEventListener("message", async (e) => {
  const message = e.data as MessageData;
  try {
    switch (message.type) {
      case "toWebp": {
        await webpHandler(message);
        break;
      }
      case "toWebpJs": {
        await webpJsHandler(message);
        break;
      }
      case "compressJs":
        await compressJsHandler(message);
        break;
      default:
        break;
    }
  } catch (error) {
    postMessage2Main(message.id, { error, type: "error" });
  }
});
