import * as fs from "fs";
import * as path from "path";

const emscriptenDTs = `https://raw.githubusercontent.com/GoogleChromeLabs/squoosh/dev/emscripten-types.d.ts`;

// 定义文件名和路径
const files = ["webp_dec", "webp_enc"];
const baseUrl =
  "https://raw.githubusercontent.com/GoogleChromeLabs/squoosh/dev/codecs";

// 下载文件的函数
async function downloadFile(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    return nodeBuffer;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return null;
  }
}

// 循环下载每个文件
files.forEach(async (file) => {
  const filePath = file.replace("_", "/");
  const wasmUrl = `${baseUrl}/${filePath}/${file}.wasm`;
  const dtsUrl = `${baseUrl}/${filePath}/${file}.d.ts`;
  const jsUrl = `${baseUrl}/${filePath}/${file}.js`;

  const wasmFileName = `${file}.wasm`;
  // const wasmPath = path.join("src", "wasm", wasmFileName);
  const dtsPath = path.join("src", "wasm", `${file}.d.ts`);
  const jsPath = path.join("src", "wasm", `${file}.js`);

  const wasmBuffer = await downloadFile(wasmUrl);
  const dtsBuffer = await downloadFile(dtsUrl);
  const jsBuffer = await downloadFile(jsUrl);

  if (!wasmBuffer || !dtsBuffer || !jsBuffer) return;

  const wasmBase64 = `${wasmBuffer.toString("base64")}`;
  let jsStrContent = jsBuffer.toString("utf-8");

  jsStrContent =
    `var base64WasmBinary="${wasmBase64}";
    function base64ToUint8Array(base64) {
      var binaryString = atob(base64);
      var len = binaryString.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };` +
    jsStrContent
      .replace(
        "var wasmBinary;",
        "var wasmBinary=base64ToUint8Array(base64WasmBinary);"
      )
      .replace(
        `var wasmBinaryFile=new URL("${wasmFileName}",import.meta.url).toString()`,
        ``
      );

  const dtsContent = `/// <reference types="./emscripten-types.d.ts" />\n${dtsBuffer.toString("utf-8")}`;

  fs.writeFileSync(dtsPath, dtsContent);
  fs.writeFileSync(jsPath, jsStrContent);
});

async function downloadEmscriptenDTs() {
  const emscriptenDTsBuffer = await downloadFile(emscriptenDTs);
  if (!emscriptenDTsBuffer) return;
  fs.writeFileSync(
    path.resolve(__dirname, "../src/wasm/emscripten-types.d.ts"),
    emscriptenDTsBuffer
  );
}

downloadEmscriptenDTs();
