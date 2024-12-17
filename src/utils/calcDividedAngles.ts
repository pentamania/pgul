const PI2 = 2 * Math.PI;

/**
 * Calculate [bulletCount]-way angles
 *
 * @example
 * // centerDeg:90, div:3, rangeDeg:60
 * const PI = Math.PI;
 * const angles = calcDividedAnglesFromRange(PI/2, 3, PI/3)
 * console.log(angles) // [PI/3, PI/2, PI*2/3] (= [60, 90, 120] in degree)
 *
 * @param centerAngleRadian 基準角度
 * @param dividedCount 分割数
 * @param angleRangeRadian 範囲角
 * @param holderArrayRef 配列参照：length=0による空化処理を行う
 */
export default function calcDividedAngles(
  centerAngleRadian: number,
  dividedCount: number,
  angleRangeRadian: number,
  holderArrayRef: any[] = []
): number[] {
  holderArrayRef.length = 0;

  /**
   * 角度シフト単位（ラジアン）。
   * 射角を分割するため、angleRange扇を（発射数-1）で割る
   * ただし
   * - 発射数1発の場合はangleRange関係なく0度
   * - 360度（以上）は一周してしまうので-1しない
   *
   * ### Examples
   * - angleRange180度、1発なら 0
   * - angleRange180度、4発なら 60 (= 180 / (4-1))度相当のラジアン
   * - angleRange360度、6発なら 60 (= 360 / 6)度相当のラジアン
   */
  let angleShiftUnit = 0;
  if (dividedCount > 1) {
    if (angleRangeRadian >= PI2) {
      angleShiftUnit = angleRangeRadian / dividedCount;
    } else {
      angleShiftUnit = angleRangeRadian / (dividedCount - 1);
    }
  }

  /**
   * 開始角度
   * angleRange扇を基準Angleを中央として２分割したときの左端の角度
   * 範囲120度で基準角度が90度なら165度
   */
  const startAngle = centerAngleRadian + angleRangeRadian / 2;

  for (let i = 0; i < dividedCount; i++) {
    const angle = startAngle - angleShiftUnit * i;
    holderArrayRef.push(angle);
  }

  return holderArrayRef;
}
