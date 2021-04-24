/**
 * Create trapezoid path
 *
 * @param x
 * @param y
 * @param topWidth
 * @param bottomWidth
 * @param height
 */
export function trapezoid(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  topWidth: number,
  bottomWidth: number,
  height: number
): void {
  const ctx = this;
  const bottomY = y + height;

  ctx.moveTo(x, y);
  ctx.lineTo(x + topWidth, y);
  ctx.lineTo(x + bottomWidth, bottomY);
  ctx.lineTo(x, bottomY);
  ctx.closePath();
}
