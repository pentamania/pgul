import { Coroutine } from "../Coroutine";
import { Vector2 } from "../Vector2";
import { CoroutineAction } from "../interfaces";
import { toDegree } from "../utils/radianConverter";

export interface RunnerTarget {
  x: number;
  y: number;
  rotation?: number; // Degree想定
  [key: string]: any; // その他プロパティ
}
export type RunnerAction = CoroutineAction<Runner>;

/**
 * Runner 対象物にCorutionの機能を使って徐々にアクションさせる
 * TODO： _baseVectorを用意？
 */
export class Runner extends Coroutine {
  protected _speed: number = 1;
  vector: Vector2 = new Vector2();
  target?: RunnerTarget;

  constructor(target?: RunnerTarget) {
    super();
    if (target) this.setTarget(target);
  }

  /**
   * @param target
   */
  setTarget(target: RunnerTarget) {
    this.target = target;
    return this;
  }

  /**
   * Coroutine.addTaskのラッパー
   *
   * @example
   * const runner = new Runner();
   *
   * // 指定durationかけて指定Xへ移動するアクション（thisはRunnerを指す）
   * const gotoAction = function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * };
   *
   * // 1. シンプルパターン：
   * runner.addAction(gotoAction, 200, 120);
   *
   * // 2. createActionパターン：引数埋め込みでアクションを設定したいときにおすすめ
   * function createGotoAction(x, duration) {
   *   return function() {
   *     return gotoAction.bind(this)(x, duration)
   *   }
   * }
   * // もしくは直接引数を埋め込んだRunnerActionを返す
   * function createGotoActionDirect(x, duration) {
   *   return function*() {
   *     let count = 0;
   *     const progressUnit = (x - this.target.x) / duration;
   *     while (count < duration) {
   *       this.target.x += progressUnit;
   *       yield count++;
   *     }
   *   }
   * }
   * runner.addAction(createGotoAction(200, 120));
   * runner.addAction(createGotoActionDirect(200, 120));
   *
   * // 3. iifeパターン：createActionパターンの変形、場合によっては有効
   * runner.addAction(
   *   (()=> {
   *     const x = 200;
   *     const duration = 120;
   *     return function*() {
   *       let count = 0;
   *       const progressUnit = (x - this.target.x) / duration;
   *       while (count < duration) {
   *         this.target.x += progressUnit;
   *         yield count++;
   *       }
   *     }
   *   })()
   * );
   *
   * // 4. アクション文字列＋引数指定パターン：引数が何なのか忘れるとつらい、正直イマイチかも
   * Runner.registerAction("goto", gotoAction);
   * runner.addAction("goto", 200, 120);
   *
   *
   * @param action GeneratorFunctionでthisをRunnerにしたもの、文字列指定で予め登録したAction実行可能？
   * @param args 可変長でRunnerAction実行時の引数パラメータを設定（文字列指定で有効、それ以外は使いずらいかも？）
   */
  addAction(action: string | RunnerAction, ...args: any): this {
    const genFunc =
      typeof action === "string" ? Runner.actionDictionary.get(action) : action;
    if (genFunc) {
      this.addTask({
        action: genFunc,
        args: args,
      });
    } else {
      // errror
      console.error(`"${action}"というアクションはありません`);
    }
    return this;
  }

  /**
   *
   * @param x
   * @param y
   */
  setVector(x: number | undefined, y: number | undefined) {
    this.vector.set(x, y);
    return this;
  }

  /**
   *
   */
  getDirection() {
    return this.vector.getAngleByDegree();
  }

  /**
   * vectorを回転して進行方向を変える
   * @param degree 度数単位
   * @param rotateTargetToo 本体の角度も変えるかどうか
   */
  setDirection(degree: number, rotateTargetToo = false) {
    this.vector.setFromDegree(degree, this._speed);
    if (rotateTargetToo && this.target && this.target.rotation != null)
      this.target.rotation = degree;
    return this;
  }

  /**
   *
   * @param radian
   * @param rotateTargetToo
   */
  setDirectionByRadian(radian: number, rotateTargetToo = false) {
    this.vector.setFromRadian(radian, this._speed);
    if (rotateTargetToo && this.target && this.target.rotation != null)
      this.target.rotation = toDegree(radian);
    return this;
  }

  /**
   * 値が極端に小さいときは0補正（でないと変な方向を向いていることにされる）
   * @param speed
   */
  setSpeed(speed: number) {
    this._speed = speed < 0.00000001 ? 0 : speed;
    this.vector.normalize().mul(this._speed);
    return this;
  }

  get speed() {
    return this._speed;
  }

  static registerAction(name: string, gen: CoroutineAction) {
    Runner.actionDictionary.set(name, gen);
  }

  static actionDictionary: Map<string, RunnerAction> = new Map();
}

export * from "./defaultActions";
