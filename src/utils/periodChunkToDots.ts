const PERIOD_CHUNK = "\\.\\.\\.";
const DOT = "…";

const regex = new RegExp(PERIOD_CHUNK, "g");

/**
 * ピリオド（半角）を三点リーダに変換
 *
 * Converts "..." (Three period chunk) to "…" (Dotted-line/Ellipses-mark)
 *
 * @param str
 * @returns Converted string
 */
export default function (str: string): string {
  return str.replace(regex, DOT);
}
