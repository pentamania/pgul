import { SharedContext } from "./common";

/**
 * @param range
 * @param color
 */
export function createHorizontalMonoGradation(
  width: number,
  height: number,
  color: string,
  fromLeft: boolean = true
) {
  const ctx = SharedContext;
  const y = height / 2;
  const grad = ctx.createLinearGradient(0, y, width, y);
  const c0 = fromLeft ? color : "transparent";
  const c1 = c0 === "transparent" ? color : "transparent";
  grad.addColorStop(0, c0);
  grad.addColorStop(1, c1);
  return grad;
}

/**
 * 単色のシンプルな円形グラデーションを作成
 * @param radius 半径
 * @param color 色
 */
export function createSingleRadialGradation(
  radius: number,
  color: string
): CanvasGradient {
  const ctx = SharedContext;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  return grad;
}
