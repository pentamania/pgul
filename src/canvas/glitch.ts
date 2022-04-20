import { Random } from "../Random";
import { clearCanvas, copyImageSize, copyImageToCanvas } from "./utils";

const sharedRng = new Random();
const bufferCanvas = document.createElement("canvas");

/**
 * Glitch canvas image
 *
 * @example
 * const ctx = canvasWithSomethingRendered.getContext("2d")
 * pgul.canvasHelper.glitch.call(ctx, 16, 1, 4)
 *
 * @example Context2D prototype extension
 * // TODO
 *
 * @param chipSize
 * @param seed Random seed
 * @param discreteFreq
 * @param srcImage Use itself if undefined
 * @param overrideDraw
 */
export function glitch(
  this: CanvasRenderingContext2D,
  chipSize: number,
  seed: number = Date.now(),
  discreteFreq?: number,
  srcImage: HTMLImageElement | HTMLCanvasElement = this.canvas,
  overrideDraw: boolean = true
) {
  // Copy image to buffer
  copyImageToCanvas(bufferCanvas, srcImage, true);

  // 元の画像を上書きする
  if (!overrideDraw) clearCanvas(this.canvas);

  // Param
  sharedRng.resetSeed(seed);
  const row = Math.floor(srcImage.height / chipSize);
  const col = Math.floor(srcImage.width / chipSize);

  // Draw
  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      // たまに歯抜け
      if (discreteFreq && sharedRng.randInt(0, discreteFreq) === 0) continue;

      const sx = sharedRng.randInt(0, col - 1) * chipSize;
      const sy = sharedRng.randInt(0, row - 1) * chipSize;
      const left = x * chipSize;
      const top = y * chipSize;
      this.drawImage(
        bufferCanvas,
        sx,
        sy,
        chipSize,
        chipSize,
        left,
        top,
        chipSize,
        chipSize
      );
    }
  }
}

/**
 * テクスチャをぐちゃぐちゃにする
 *
 * @example
 * pgul.canvasHelper.glitchImage(srcImage, 8, glitchSeed)
 *
 * @param srcImage Source image, won't be modified
 * @param chipSize Int chip粒度ピクセル数 0は無効
 * @param seed Int ランダムシード：結果を固定したい場合に指定
 * @param discreteFreq Int 歯抜けの頻度、高いほど頻度低
 * @param destCanvas Newly created if undefined
 * @returns Canvas with glitched image
 */
export function glitchImage(
  srcImage: HTMLImageElement | HTMLCanvasElement,
  chipSize: number = 16,
  seed?: number,
  discreteFreq?: number,
  destCanvas: HTMLCanvasElement = document.createElement("canvas")
): HTMLCanvasElement {
  const ctx = destCanvas.getContext("2d");
  if (!ctx) return destCanvas;

  // destCanvas resize
  copyImageSize(srcImage, destCanvas);

  // Draw
  clearCanvas(destCanvas);
  glitch.call(ctx, chipSize, seed, discreteFreq, srcImage);

  return destCanvas;
}
