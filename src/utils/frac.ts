/**
 * 小数点以下を返す（誤差注意）
 *
 * @example
 * frac(23.332) // == 0.33200000000000074
 *
 * */
export default function getFraction(f: number): number {
  return f % 1;
}
