import { BlendMode, CanvasStyle } from "./common";

/**
 * 指定色のシルエット画像を生成して返す
 *
 * @param image
 * @param color
 * @returns Newly created canvas with Silhouette
 */
export function createSilhouetteImage(
  image: HTMLImageElement | HTMLCanvasElement,
  color: CanvasStyle = "black"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = image.width;
  canvas.height = image.height;

  // 指定した色の矩形塗りつぶし
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, image.width, image.height);

  // destination-in再転写で余分な部分を省く
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0, image.width, image.height);

  return canvas;
}

/**
 * 指定色をブレンドした画像を生成して返す
 *
 * @param image
 * @param blendMode ブレンドタイプ（globalCompositeOperation）で指定
 * @param color ブレンド色指定
 * @returns Newly created canvas with Image with color blended
 */
export function createColorBlendedImage(
  image: HTMLImageElement | HTMLCanvasElement,
  blendMode: BlendMode = "color-burn",
  color: CanvasStyle = "red"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = image.width;
  canvas.height = image.height;

  // 一旦元画像を転写
  ctx.drawImage(image, 0, 0, image.width, image.height);

  // ブレンドを指定、その後指定色の矩形で塗りつぶし
  ctx.globalCompositeOperation = blendMode;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, image.width, image.height);

  // destination-in再転写で余分な部分を省く
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0, image.width, image.height);

  return canvas;
}
