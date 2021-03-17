import { toRadian } from "../utils/radianConverter";
import { SharedContext } from "./common";

const DEFAULT_PATTERN_SIZE = 16;

/** 正方形の対角線単位長 */
const squareDiagnolLengthUnit = Math.sqrt(2);

/** 正方形の対角線長を1としたときの一辺の長さ */
const squareSideRatioByDiagnol = 1 / squareDiagnolLengthUnit; // ≒ 0.707

/**
 * Canvas patternを簡易生成するヘルパー関数
 * @param sourceImage
 */
export function createPattern(sourceImage: CanvasImageSource) {
  return SharedContext.createPattern(sourceImage, "repeat");
}

/**
 * チェック柄のCanvasPatternを生成して返す
 * @param patternSize
 * @param backgroundColor
 * @param mainColor
 * @param canvas
 */
export function createCheckPattern(
  patternSize = DEFAULT_PATTERN_SIZE,
  backgroundColor = "#22b578",
  mainColor = "#5D63E7",
  canvas?: HTMLCanvasElement
) {
  if (!canvas) canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = patternSize;
  canvas.height = patternSize;

  // 背景色で塗りつぶし
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, patternSize, patternSize);

  // チェックパターンを描画
  {
    const sizeHalf = patternSize / 2;
    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, sizeHalf, sizeHalf);
    ctx.fillRect(sizeHalf, sizeHalf, sizeHalf, sizeHalf);
  }

  return ctx.createPattern(canvas, "repeat");
}

/**
 * ダイヤパターン柄のCanvasPatternを生成して返す
 * @param patternSize
 * @param backgroundColor
 * @param mainColor
 * @param canvas
 * @returns
 */
export function createDiamondPattern(
  patternSize = DEFAULT_PATTERN_SIZE,
  backgroundColor = "#22b578",
  mainColor = "#5D63E7",
  canvas?: HTMLCanvasElement
) {
  if (!canvas) canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const diamondSize = patternSize * squareSideRatioByDiagnol;

  canvas.width = patternSize;
  canvas.height = patternSize;

  // 背景色で塗りつぶし
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, patternSize, patternSize);

  // ダイヤパターンを描画
  ctx.fillStyle = mainColor;
  ctx.setTransform(1, 0, 0, 1, patternSize / 2, patternSize / 2);
  // .transformCenter()
  ctx.rotate(toRadian(45));
  ctx.fillRect(
    -diamondSize * 0.5,
    -diamondSize * 0.5,
    diamondSize,
    diamondSize
  );

  return ctx.createPattern(canvas, "repeat");
}
