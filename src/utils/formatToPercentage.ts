/**
 * 数値をパーセント表記の文字列に変換
 *
 * @param n Value
 * @param digit Number of digits after the decimal point
 * @returns "n%"
 */
export default function formatToPercentage(n: number, digit = 0) {
  return `${(n * 100).toFixed(digit)}%`;
}
