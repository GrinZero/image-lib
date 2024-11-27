# Image WASM

## Description

I plan to implement most image operations using WASM, and the progress has just begun:

- [ ] webp:
  - [x] Implemented lossy and lossless webp encoder and decoder with the help of `squoosh`

## Install

```bash
pnpm add @sourcebug/image-wasm
```

## Usage

```typescript
import { toWebp } from "@sourcebug/image-wasm";

// ...
```

## Start Development

## Dev Mode

```bash
pnpm run private:install
pnpm run dev
```

## Build Production

```bash
pnpm run private:install
pnpm run build
```
