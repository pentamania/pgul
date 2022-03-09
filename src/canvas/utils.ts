/**
 * サイズコピー
 *
 * @param src
 * @param dest
 */
export function copyImageSize(
  src: HTMLImageElement | HTMLCanvasElement,
  dest: HTMLImageElement | HTMLCanvasElement
) {
  dest.width = src.width;
  dest.height = src.height;
  return dest;
}

/**
 * Canvas全体を消去
 * @param canvas
 */
export function clearCanvas(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
}
