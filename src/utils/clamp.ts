/**
 * 数字を指定した範囲にクランプする
 * @param n
 * @param min
 * @param max
 * @returns
 */
export default function clamp(
  n: number,
  min: number = -Infinity,
  max: number = Infinity
): number {
  return Math.max(Math.min(n, max), min);
}
