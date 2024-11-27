/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";
import { wasm } from "@rollup/plugin-wasm";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      build: {
        outDir: "build",
      },
      plugins: [dts()],
      worker: {
        plugins: () => [
          wasm({
            targetEnv: "auto-inline",
          }),
        ],
      },
    };
  }

  return {
    build: {
      target: "es2020",
      outDir: "dist",
      lib: {
        entry: [resolve(__dirname, "src/index.ts")],
        name: "webpWasm",
        formats: ["es", "umd"],
      },
      rollupOptions: {
        external: [],
      },
    },
    worker: {
      plugins: () => [
        wasm({
          targetEnv: "auto-inline",
        }),
      ],
    },
  };;
});
