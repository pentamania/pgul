import timesMap from "./timesMap";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export const RAD360 = Math.PI * 2;

/** @alias RAD360 */
export const PI2 = RAD360;

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
 * const deg225Rad = Math.PI * 1.25
 * flipRadianVertical(deg225Rad) // => 1.75π  (deg225 -> deg315)
 * flipRadianVertical(deg225Rad, false) // => -0.25π (deg225 -> -deg45)
 *
 * @param rad
 * @param positize 負数だった場合、一周して正に修正 default: true
 * @returns 計算精度の問題上、厳密な値にはならないことに注意
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
 * flipRadianHorizontal(Math.PI/2) // => 1.5π (deg90 -> deg270)
 * flipRadianHorizontal(Math.PI/2, false) // => -0.5π (deg90 -> -deg90)
 *
 * @param rad
 * @param positize 負数だった場合、一周して正に修正
 * @returns 計算精度の問題上、厳密な値にはならないことに注意
 */
export function flipRadianHorizontal(rad: number, positize: boolean = true) {
  let flippedRad = Math.atan2(-Math.sin(rad), Math.cos(rad));

  if (positize && flippedRad < 0) flippedRad += RAD360;

  return flippedRad;
}

/**
 * Normalize radian value within -π ~ π
 *
 * @param rad
 * @returns
 */
export function normalizeRadian(rad: number) {
  return Math.atan2(Math.sin(rad), Math.cos(rad));
}

/**
 * Normalize degree value within -180 ~ 180
 *
 * @example
 * normalizeDegree(360) // => 0
 * normalizeDegree(270) // => -90
 * normalizeDegree(540) // => 180
 *
 * @param rad
 * @returns
 */
export function normalizeDegree(deg: number) {
  return toDegree(normalizeRadian(toRadian(deg)));
}
