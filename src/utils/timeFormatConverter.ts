import frac from "../math/frac";
import zeroFillNum from "./zeroFillNum";
const trunc = Math.trunc;

/**
 * `hh:mm:ss`フォーマットの時間文字列をミリ秒に変換
 *
 * @param timeString
 */
export function convertFormattedTimeToMiliSec(timeString: string): number {
  const rawNums = timeString.split(":");

  if (!rawNums.length) {
    console.warn(`[pgul] timeString should be "hh:mm:ss" or "hh:mm" format`);
    return Number(timeString);
  }

  const d = rawNums.map((v) => Number(v));
  if (d.length < 3) {
    // ss部分の補完
    d[2] = 0;
  }

  return (d[0] * 60 * 60 + d[1] * 60 + d[2]) * 1000;
}

/**
 * ミリ秒を hh:MM:ss形式等にフォーマット
 *
 * @param msec
 * @param format "hh:mm:ss" format etc.
 */
export function formatMiliSec(
  msec: number,
  format: "hh:mm:ss" | "mm:ss:ff"
): string {
  const hour = msec / 1000 / 3600;
  const min = frac(hour) * 60;
  const sec = frac(min) * 60;

  switch (format) {
    case "hh:mm:ss":
      return `${zeroFillNum(trunc(hour), 2)}:${zeroFillNum(
        trunc(min),
        2
      )}:${zeroFillNum(trunc(sec), 2)}`;

    case "mm:ss:ff":
      const ssff = sec.toFixed(2).split(".") as [string, string];
      return `${zeroFillNum(trunc(min), 2)}:${zeroFillNum(
        ssff[0],
        2
      )}:${zeroFillNum(ssff[1], 2)}`;
  }
}
