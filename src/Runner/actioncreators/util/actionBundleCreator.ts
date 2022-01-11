import {
  RunnerActionBundle,
  RunnerActionComplex,
} from "../../../mixins/RunnerDriven";

type ActionCreatorWithDurationArg = (duration: number) => RunnerActionComplex;

/**
 * 共通のduration値を引数としたactionCreator群を実行、
 * 結果得られるactionをまとめて返す
 *
 * -> 同時に終わるアクションのバンドルを作成可能
 *
 * @param duration
 * @param actionCreators 第一引数がdurationのActionCreator型
 */
export function createActionBundleWithDuration(
  duration: number,
  ...actionCreators: ActionCreatorWithDurationArg[]
): RunnerActionBundle {
  return actionCreators.map((ac) => {
    return ac.call(null, duration);
  });
}
