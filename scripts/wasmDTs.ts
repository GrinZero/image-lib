import * as fs from "fs";
import * as path from "path";

// 定义文件名和路径
const files = [
  "../src/wasm/webp_dec.d.ts",
  "../src/wasm/webp_enc.d.ts",
  "../src/wasm/emscripten-types.d.ts",
];
const targetFiles = [
  "../dist/src/wasm/webp_dec.d.ts",
  "../dist/src/wasm/webp_enc.d.ts",
  "../dist/src/wasm/emscripten-types.d.ts",
];

// create wasm dir
fs.mkdirSync(path.join(__dirname, "../dist/src/wasm"), { recursive: true });

files.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(path.join(__dirname, targetFiles[index]), content);
});
