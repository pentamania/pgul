/**
 * 指定桁数までゼロ詰めした数字文字列を返す
 *
 * @example
 * zeroFillNum(31, 4) -> "0031"
 *
 * @param num
 * @param figures
 */
export default function zeroFillNum(
  num: number | string,
  figures: number
): string {
  let str = String(num);
  while (str.length < figures) {
    str = "0" + str;
  }
  return str;
}
