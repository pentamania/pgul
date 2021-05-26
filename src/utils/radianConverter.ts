import timesMap from "./timesMap";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function toRadian(deg: number) {
  return deg * DEG_TO_RAD;
}

export function toDegree(rad: number) {
  return rad * RAD_TO_DEG;
}

export const DEG_TO_RAD_TABLE = (() => {
  return timesMap(360, (i) => {
    return toRadian(i);
  });
})();

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
