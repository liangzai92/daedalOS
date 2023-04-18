import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { loadFiles } from "utils/functions";
import type { StableDiffusionConfig } from "./types";

export const libs = [
  "/System/StableDiffusion/tvmjs_runtime.wasi.js",
  "/System/StableDiffusion/tvmjs.bundle.js",
  "/System/StableDiffusion/tokenizers-wasm/tokenizers_wasm.js",
  "/System/StableDiffusion/stable_diffusion.js",
];

export const initStableDiffusion = (
  config: StableDiffusionConfig,
  canvas: HTMLCanvasElement
): void => {
  globalThis.tvmjsGlobalEnv.getTokenizer = async () => {
    if (!globalThis.tvmjsGlobalEnv.initialized) {
      await globalThis.Tokenizer.init();
    }

    globalThis.tvmjsGlobalEnv.initialized = true;

    return new globalThis.Tokenizer.TokenizerWasm(
      await (
        await fetch("/System/StableDiffusion/tokenizers-wasm/tokenizer.json")
      ).text()
    );
  };

  globalThis.tvmjsGlobalEnv.canvas = canvas;

  const { prompts } = config;

  globalThis.tvmjsGlobalEnv.prompts = prompts?.length
    ? prompts
    : [["A photo of an astronaut riding a horse on mars", ""]];

  globalThis.tvmjsGlobalEnv.asyncOnGenerate();
};

const StableDiffusion = async (
  el?: HTMLElement | null,
  config: WallpaperConfig = {} as WallpaperConfig
): Promise<void> => {
  if (!el) return;

  const canvas = document.createElement("canvas");

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  el.append(canvas);

  window.tvmjsGlobalEnv = window.tvmjsGlobalEnv || {};

  await loadFiles(libs);

  initStableDiffusion(config as StableDiffusionConfig, canvas);
};

export default StableDiffusion;
