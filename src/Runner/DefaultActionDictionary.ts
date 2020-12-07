import { Runner } from "./index";
import { toRadian } from "../utils/radianConverter";
import { CoroutineAction } from "../interfaces";
import { stringToEnum } from "../utils/index";
import { accelerate, rotate, straight, to, turnAround } from "./defaultActions";

export const DefaultActionType = stringToEnum([
  "straight",
  "turnAround",
  "accelerate",
  "wait",
  // "accelerate",
]);
export type DefaultActionName = keyof typeof DefaultActionType;

type ActionMap = Map<
  DefaultActionName | string,
  // GeneratorFunction
  CoroutineAction
>;

const dictionary: ActionMap = new Map([
  [DefaultActionType.straight, straight],
  ["rotate", rotate],
  ["turnAround", turnAround],
  ["accelerate", accelerate],

  // 指定フレームをかけて特定プロパティ値に
  ["to", to],

  // 待つ
  [
    "wait",
    function* (this: Runner, duration: number = Infinity) {
      let count = 0;
      while (count < duration) {
        yield count++;
      }
    },
  ],

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
  [
    "sine",
    function* (
      this: Runner,
      duration = Infinity,
      radius = 64,
      frequency = 6,
      widening?: number
    ) {
      let count = 0;
      const baseX = this.target.x;
      const baseY = this.target.y;
      // console.log(radius, frequency, widening)
      const verticalVector = this.vector
        .clone()
        .rotate(-Math.PI / 2)
        .normalize();
      while (count < duration) {
        const sine = Math.sin(toRadian(count * frequency));
        // 徐々に広がるかどうか
        const baseVertRad = widening ? radius + widening * count : radius;
        const correctedVertRad = baseVertRad * sine;
        var vvx = verticalVector.x * correctedVertRad;
        var vvy = verticalVector.y * correctedVertRad;
        this.target.x = baseX + this.vector.x * count + vvx;
        this.target.y = baseY + this.vector.y * count + vvy;
        yield count++;
      }
    },
  ],

  // *chase(duration = Infinity, chasingTarget) {},

  [
    "call",
    function* (this: Runner, cb: any) {
      // function* (this: Runner, cb: (tgt: any)=> any) {
      yield cb(this.target, this);
    },
  ],
]);

// export { dicMap as actionDictionary };
export default dictionary;
