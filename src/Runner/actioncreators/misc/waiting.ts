import { RunnerAction } from "../../Runner";

/**
 * 何もしない
 * @param duration 待機時間
 */
export function createWaitingAction(duration: number = Infinity): RunnerAction {
  return function* () {
    let _currentCount = 0;
    while (_currentCount < duration) {
      yield _currentCount++;
    }
  };
}
