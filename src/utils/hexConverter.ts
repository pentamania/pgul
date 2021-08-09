/**
 * [en]
 * Convert hex-string to number
 *
 * [jp]
 * ヘックス文字列を16進数に変換
 *
 * @example
 * // All returns same value: 16711935 (0xff00ff)
 * toHexNumber("ff00ff")
 * toHexNumber("#ff00ff")
 * toHexNumber(0xff00ff)
 *
 * @param strOrNum
 * - string, hashed string -> to hex number,
 * - number -> Do nothing
 */
export function toHexNumber(strOrNum: string | number): number {
  if (typeof strOrNum === "string") {
    if (strOrNum[0] === "#") strOrNum = strOrNum.slice(1);
    return parseInt(strOrNum, 16);
  } else {
    // is already num
    return strOrNum;
  }
}

/**
 * [en]
 * Convert number to 6 char hex string
 *
 * [jp]
 * 16進数numberを6文字ヘックス文字列に変換
 *
 * @example
 * numToHexString(255) -> "0000ff"
 * numToHexString(255, true) -> "#0000ff"
 *
 * @param num
 * @param isHashed Add "#" on head (default: false)
 * @returns Hex string
 */
export function numToHexString(num: number, isHashed: boolean = false) {
  let s = num.toString(16);
  while (s.length < 6) {
    s = "0" + s;
  }
  return isHashed ? "#" + s : s;
}
