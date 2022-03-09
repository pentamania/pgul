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

/**
 * {DESC}
 *
 * @param srcImage
 * @param destCanvas
 * @param fitSize
 */
export function copyImageToCanvas(
  destCanvas: HTMLCanvasElement,
  srcImage: HTMLImageElement | HTMLCanvasElement,
  fitSize?: boolean
) {
  if (fitSize) copyImageSize(srcImage, destCanvas);

  clearCanvas(destCanvas);
  destCanvas
    .getContext("2d")
    ?.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height);

  return destCanvas;
}
