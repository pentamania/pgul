import { toRadian } from "../math/radianConverter";
import { Runner } from "./Runner";

export interface BasicRunnerTarget2D {
  x: number;
  y: number;
  rotation?: number; // Radian想定
  angle?: number; // Degree想定（仮）
  [key: string]: any; // その他プロパティ
}

/**
 * ひたすらvector方向に進む
 * @param duration
 */
export function* straight(this: Runner<BasicRunnerTarget2D>, duration: number) {
  let count = 0;
  while (count < duration) {
    if (this.target) {
      this.target.x += this.vx;
      this.target.y += this.vy;
    }
    yield count++;
  }
}
// 以下ではthis: Runnerを省けるが、代わりにインテリセンスによる引数表示がなくなって不便
// export const straight: RunnerAction = function* (duration: number) {
//   let count = 0;
//   while (count < duration) {
//     this.target!.x += this.vector.x;
//     this.target!.y += this.vector.y;
//     yield count++;
//   }
// };

/**
 * 指定フレームかけてその場でターゲットを回転
 * @param duration
 * @param degree
 */
export function* rotate(
  this: Runner<BasicRunnerTarget2D>,
  duration: number,
  degree: number
) {
  let count = 0;
  const turnDegUnit = degree / duration;
  while (count < duration) {
    if (this.target && this.target.rotation != null)
      this.target.rotation += turnDegUnit;
    // yield this.target!.rotation += count;
    // this.vector.rotate(turnUnitRad);
    yield count++;
  }
  this.vector.rotate(toRadian(degree));
}

/**
 * ちょっとずつ曲がる
 * @param duration
 * @param degree
 */
export function* turnAround(
  this: Runner<BasicRunnerTarget2D>,
  duration: number,
  degree: number
) {
  let count = 0;
  const turnUnit = toRadian(degree / duration);
  while (count < duration) {
    this.rotateVector(turnUnit);
    if (this.target) {
      this.target.x += this.vx;
      this.target.y += this.vy;
    }
    yield count++;
  }
}

/**
 * ちょっとずつ加減速
 * @param duration
 * @param magnitude
 */
export function* accelerate(
  this: Runner<BasicRunnerTarget2D>,
  duration: number,
  magnitude = 1.0
) {
  let count = 0;
  const svx = this.vx;
  const svy = this.vy;
  const dvx = this.vx * magnitude;
  const dvy = this.vy * magnitude;
  const vxUnit = (dvx - svx) / duration;
  const vyUnit = (dvy - svy) / duration;
  // const speedDelta = targetSpeed - this.vector.length();
  // const speedUnit = speedDelta/duration;
  while (count < duration) {
    this.setVector(this.vx + vxUnit, this.vy + vyUnit);
    if (this.target) {
      this.target.x += this.vx;
      this.target.y += this.vy;
    }
    yield count++;
  }
}

/**
 * 指定フレームをかけて特定プロパティ値に
 * @param duration
 * @param prop
 */
export function* to(
  this: Runner,
  duration: number,
  prop: { [k: string]: any }
) {
  // function* (this: Runner, duration: number, prop: ToPropObject) {
  let count = 0;
  // TODO: reduceで書き換え
  const unitDic = Object.create(null);
  Object.keys(prop).forEach((key) => {
    const val = prop[key];
    if (this.target![key] == null) return;
    unitDic[key] = (val - this.target![key]) / duration;
  });
  while (count < duration) {
    // const ratio = count / duration
    Object.keys(prop).forEach((key) => {
      // const goalVal = prop[key]
      if (this.target![key] != null) {
        this.target![key] += unitDic[key];
      }
    });
    yield count++;
  }
}

/**
 * 何もせず待つ
 * @param duration
 */
export function* wait(this: Runner, duration: number = Infinity) {
  let count = 0;
  while (count < duration) {
    yield count++;
  }
}

/**
 * 波打つように動く
 * 1. 元vectorに対して垂直方向を得る
 * 2. countを度数あつかい、frequencyで補正
 *
 * @param duration
 * @param radius
 * @param frequency
 * @param widening
 */
export function* sine(
  this: Runner<BasicRunnerTarget2D>,
  duration = Infinity,
  radius = 64,
  frequency = 6,
  wideningUnit?: number
) {
  if (!this.target) return;
  let _count = 0;
  const baseX = this.target!.x;
  const baseY = this.target!.y;
  const verticalVector = this.getVector()
    .rotate(-Math.PI / 2)
    .normalize();
  while (_count < duration) {
    const sine = Math.sin(toRadian(_count * frequency));
    // 徐々に広がるかどうか
    const baseVertRad = wideningUnit ? radius + wideningUnit * _count : radius;
    const correctedVertRad = baseVertRad * sine;
    var vvx = verticalVector.x * correctedVertRad;
    var vvy = verticalVector.y * correctedVertRad;

    this.target!.x = baseX + this.vx * _count + vvx;
    this.target!.y = baseY + this.vy * _count + vvy;
    yield _count++;
  }
}
