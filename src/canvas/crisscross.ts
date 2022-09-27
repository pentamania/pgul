import { DEG_TO_RAD_TABLE } from "../utils/radianConverter";

const DEFAULT_SIDE_INDENT = 0.2;
const SIDES = 4;
const startRad = -DEG_TO_RAD_TABLE[180];
const radDiv = DEG_TO_RAD_TABLE[45];

/**
 * [jp]
 * ✛クロスパスを作成
 *
 * @param x
 * @param y
 * @param radius
 * @param sideIndentRatio 太さ比率 半径が基準
 */
export function crisscross(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sideIndentRatio: number = DEFAULT_SIDE_INDENT
) {
  const ctx = this;
  const sideIndentRadius = radius * sideIndentRatio;

  ctx.moveTo(x + Math.cos(startRad) * radius, y + Math.sin(startRad) * radius);
  for (let i = 1; i < SIDES * 2; ++i) {
    const rad = radDiv * i + startRad;
    const len = i % 2 ? sideIndentRadius : radius;
    ctx.lineTo(x + Math.cos(rad) * len, y + Math.sin(rad) * len);
  }
  ctx.closePath();
}
