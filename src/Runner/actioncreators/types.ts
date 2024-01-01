import { TargetDeclaredRunnerAction } from "../Runner2D";

/**
 * RunnerAction型を返す関数型
 *
 * @example
 * const myActionCreator: ActionCreator<GameActor> = ()=> {
 *   return function*() {
 *      // Do something
 *   }
 * };
 */
export type ActionCreator<TT = any, PT = any> = (
  params?: PT
) => TargetDeclaredRunnerAction<TT>;
