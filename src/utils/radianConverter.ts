import timesMap from "./timesMap";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const RAD360 = Math.PI * 2;

export function toRadian(deg: number) {
  return deg * DEG_TO_RAD;
}

export function toDegree(rad: number) {
  return rad * RAD_TO_DEG;
}

export const DEG_TO_RAD_TABLE = timesMap(360, (i) => {
  return toRadian(i);
});
export const RAD_LEFT = DEG_TO_RAD_TABLE[0];
export const RAD_DOWN = DEG_TO_RAD_TABLE[90];
export const RAD_RIGHT = DEG_TO_RAD_TABLE[180];
export const RAD_UP = DEG_TO_RAD_TABLE[270];

/**
 * 整数値テーブルを使ってラジアン変換する
 *
 * @param deg 整数
 * @returns 整数以外はundefinedを返す
 */
export function toRadianFromIntTable(deg: number): number | undefined {
  if (360 < deg) deg %= 360;
  if (deg < 0) deg += 360;
  return DEG_TO_RAD_TABLE[deg];
}

/**
 * ラジアン値をY軸反転する
 *
 * @example
 * flipRadianVertical(0) // => 3.14..
 *
 * @param rad
 * @param positize 負数だった場合、一周して正に修正 default: true
 * @returns
 */
export function flipRadianVertical(rad: number, positize: boolean = true) {
  let flippedRad = Math.atan2(Math.sin(rad), -Math.cos(rad));

  if (positize && flippedRad < 0) flippedRad += RAD360;

  return flippedRad;
}

/**
 * ラジアン値をX軸反転する
 *
 * @example
 * flipRadianVertical(90) // => 0
 *
 * @param rad
 * @param positize 負数だった場合、一周して正に修正 default: true
 * @returns
 */
export function flipRadianHorizontal(rad: number, positize: boolean = true) {
  let flippedRad = Math.atan2(-Math.sin(rad), Math.cos(rad));

  if (positize && flippedRad < 0) flippedRad += RAD360;

  return flippedRad;
}
