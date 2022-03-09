import { Random } from "../Random";
import { clearCanvas, copyImageSize } from "./utils";

const sharedRng = new Random();

/**
 * テクスチャをぐちゃぐちゃにする
 *
 * @param srcImage
 * @param chipSize chip粒度ピクセル数 0は無効
 * @param seed int ランダムシード：結果を固定したい場合に指定
 * @param discreteFreq int 歯抜けの頻度、高いほど頻度低
 * @param destCanvas
 * @returns destCanvas
 */
export function glitchImage(
  srcImage: HTMLImageElement | HTMLCanvasElement,
  chipSize: number = 16,
  seed: number = Date.now(),
  discreteFreq?: number,
  destCanvas: HTMLCanvasElement = document.createElement("canvas")
): HTMLCanvasElement {
  // canvas & ctx setup
  const ctx = destCanvas.getContext("2d");
  if (!ctx) return destCanvas;
  copyImageSize(srcImage, destCanvas);

  // Param
  sharedRng.resetSeed(seed);
  const row = Math.floor(srcImage.height / chipSize);
  const col = Math.floor(srcImage.width / chipSize);

  // Draw
  clearCanvas(destCanvas);
  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      // たまに歯抜け
      if (discreteFreq && sharedRng.randInt(0, discreteFreq) === 0) continue;

      const sx = sharedRng.randInt(0, col - 1) * chipSize;
      const sy = sharedRng.randInt(0, row - 1) * chipSize;
      const left = x * chipSize;
      const top = y * chipSize;
      ctx.drawImage(
        srcImage,
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

  return destCanvas;
}
