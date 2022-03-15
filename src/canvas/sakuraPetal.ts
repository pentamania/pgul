/**
 * Path drawing typical petal of sakura with notch
 *
 * @param x Center x of petal
 * @param y Center x of petal
 * @param radius Radius of petal
 */
export function sakuraPetal(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  const ctx = this;
  const cpAbsX = radius * 0.7;
  const xOffset = radius * 0.3;

  const p0 = { x: 0, y: radius * 0.5 },
    cp1 = { x: -cpAbsX, y: 0 },
    p1 = { x: -xOffset, y: -radius },
    p2 = { x: 0, y: -radius * 0.55 },
    p3 = { x: xOffset, y: -radius },
    cp2 = { x: cpAbsX, y: 0 };

  // Set path with base x/y
  // to start
  ctx.moveTo(x + p0.x, y + p0.y);

  // to notch left-end
  ctx.quadraticCurveTo(x + cp1.x, y + cp1.y, x + p1.x, y + p1.y);

  // to notch middle
  ctx.lineTo(x + p2.x, y + p2.y);

  // to notch right-end
  ctx.lineTo(x + p3.x, y + p3.y);

  // back to start
  ctx.quadraticCurveTo(x + cp2.x, y + cp2.y, x + p0.x, y + p0.y);
}
