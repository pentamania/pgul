import { BaseRunner, BaseRunnerAction } from "../../BaseRunner";

/**
 * 何もしない
 * @param duration 待機時間
 */
export function createWaitingAction(
  duration: number = Infinity
): BaseRunnerAction {
  return function* () {
    let _currentCount = 0;
    while (_currentCount < duration) {
      yield _currentCount++;
    }
  };
}

/**
 * 指定したRunnerの活動停止を待つ
 * @param runner
 */
export function createRunnerEndWaitingAction(
  runner: BaseRunner
): BaseRunnerAction {
  return function* () {
    while (!runner.dead) yield;
  };
}
