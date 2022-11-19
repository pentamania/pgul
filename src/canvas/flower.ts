import { RAD360, toRadian } from "../math/radianConverter";

/**
 * 円状に広がる花弁のパスを作成
 *
 * @param x
 * @param y
 * @param radius
 * @param petalNum
 * @param petalWidth
 */
export function radialPetals(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  petalNum: number,
  petalWidth: number
) {
  const ctx = this;
  const degUnit = 360 / petalNum;
  const spr = radius * 0.2;
  const cpr = radius * 0.5;
  const tpr = radius;

  for (let i = 0; i < petalNum; i++) {
    // 角度
    const degree = degUnit * i;
    const baseAngle = toRadian(degree);
    const c1Angle = toRadian(degree - petalWidth);
    const c2Angle = toRadian(degree + petalWidth);

    // 方角
    const vx = Math.cos(baseAngle);
    const vy = Math.sin(baseAngle);

    // 開始点
    const sx = x + vx * spr;
    const sy = y + vy * spr;

    // 二次曲線 制御点その1（往路）
    const cp1x = x + Math.cos(c1Angle) * cpr;
    const cp1y = y + Math.sin(c1Angle) * cpr;

    // 先端
    const tx = x + vx * tpr;
    const ty = y + vy * tpr;

    // 二次曲線 制御点その2（復路）
    const cp2x = x + Math.cos(c2Angle) * cpr;
    const cp2y = y + Math.sin(c2Angle) * cpr;

    // 描画
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cp1x, cp1y, tx, ty);
    ctx.quadraticCurveTo(cp2x, cp2y, sx, sy);
    ctx.closePath();
  }
}

/**
 * 花🌸を描くパスを作成
 *
 * @example
 * const ctx = canvas.getContext("2d")
 * ctx.fillStyle = "green";
 * pgul.canvasHelper.flower.call(ctx, 128, 128, 128)
 * ctx.fill();
 *
 * @param x
 * @param y
 * @param radius
 * @param petalNum default=12
 * @param petalWidth default=32
 * @param centerCircleRatio default=0.12
 */
export function flower(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  petalNum: number = 12,
  petalWidth: number = 32,
  centerCircleRatio: number = 0.12
) {
  const ctx = this;

  // 中心円
  ctx.arc(x, y, radius * centerCircleRatio, 0, RAD360);
  ctx.closePath();

  // 花弁
  radialPetals.call(ctx, x, y, radius, petalNum, petalWidth);
}
