/**
 * ヘックス文字列を16進数に変換
 *
 * - 「#」つきでもOK
 * - すでにnumberの場合はそのまま引数を返す
 *
 * @example
 * toHexNumber("ff00ff") // => 16711935 (0xff00ff)
 * toHexNumber("#ff00ff") // => 16711935 (0xff00ff)
 * toHexNumber(0xff00ff) // => 16711935 (0xff00ff)
 *
 * @param str
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
 * 16進数numberをヘックス文字列に変換
 *
 * @example
 * numToHexString(255) -> "0000ff"
 * numToHexString(255, true) -> "#0000ff"
 *
 * @param num
 * @param isHashed Add "#" on head
 * @returns
 */
export function numToHexString(num: number, isHashed: boolean = false) {
  let s = num.toString(16);
  while (s.length < 6) {
    s = "0" + s;
  }
  return isHashed ? "#" + s : s;
}
