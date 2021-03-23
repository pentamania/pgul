import { SharedContext } from "./common";

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
