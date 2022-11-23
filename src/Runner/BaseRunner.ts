import { ContextBindableGeneratorFunction } from "../utilTypes";
import { ActionDictionary } from "./ActionDictionary";
import { Coroutine } from "./Coroutine";

/**
 * BaseRunner
 * Corutionの機能を使って対象物のパラメータを変化させるためのクラス
 */
export class BaseRunner<
  TT = any,
  NA extends string = string
> extends Coroutine {
  /**
   * Runner対象オブジェクト
   */
  public target?: TT;

  /**
   * @param target
   */
  constructor(target?: TT) {
    super();
    if (target) this.setTarget(target);
  }

  /**
   * @param target
   */
  setTarget(target: TT): this {
    this.target = target;
    return this;
  }

  /**
   * Adds RunnerAction
   *
   * @example
   * const runner = new Runner();
   *
   * // Sample action (this: Runner)
   * const gotoAction = function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * };
   *
   * // 1. simple pattern
   * runner.addAction(gotoAction, 200, 120);
   *
   * // 2. createAction pattern
   * function createGotoAction(x, duration) {
   *   return function() {
   *     return gotoAction.bind(this)(x, duration)
   *   }
   * }
   * // alternative: 直接引数を埋め込んだRunnerActionを返す
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
   * // 3. Set with iife
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
   * @param action GeneratorFunctionでthisをRunnerにしたもの、文字列指定で予め登録したAction実行可能？
   * @param args 可変長でRunnerAction実行時の引数パラメータを設定（文字列指定で有効、それ以外は使いずらいかも？）
   */
  addAction(
    action: ContextBindableGeneratorFunction<BaseRunner<TT>>,
    ...args: any
  ): this {
    return this.addTask({
      action,
      args: args,
    });
  }

  /**
   * (WIP, maybe removed)
   *
   * [en]
   * Add action with pre-registered action name
   *
   * [jp]
   * 予め登録したアクション名でアクションを追加
   *
   * @example
   * import {ActionDictionary,BaseRunner} from "pgul"
   *
   * ActionDictionary.register("goto", function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * });
   *
   * // Load action
   * const runner = new BaseRunner<any, "goto">();
   * runner.addActionByName("goto", 200, 120);
   *
   * @param actionName
   * @param args args for runnerAction
   * @returns
   */
  addActionByName(actionName: NA, ...args: any): this {
    const actGenfunc = ActionDictionary.get(actionName);
    if (actGenfunc) {
      this.addAction(actGenfunc, ...args);
    } else {
      // Not found
      console.error(`"${actionName}"というアクションはありません`);
    }
    return this;
  }
}
