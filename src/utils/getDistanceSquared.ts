/**
 * 距離を自乗した状態で返す
 * @param lhs
 * @param rhs
 */
export default function getDistanceSquared(
  lhs: { x: number; y: number },
  rhs: { x: number; y: number }
): number {
  return Math.pow(lhs.x - rhs.x, 2) + Math.pow(lhs.y - rhs.y, 2);
}
