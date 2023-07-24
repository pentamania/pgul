/**
 * 平均値を返す
 *
 * @example
 * getMean([10, 5]) // == 7.5
 *
 */
export default function mean(numArr: number[]): number {
  return numArr.reduce((pre, cur) => pre + cur) / numArr.length;
}
