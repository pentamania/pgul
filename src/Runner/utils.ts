import { Runner, RunnerAction } from "./Runner";

/**
 *
 * @param cb
 * @param duration
 * @returns
 */
export function createRunnerStepAction(
  cb: (this: Runner, count: number) => any,
  duration: number = Infinity,
): RunnerAction {
  return function* () {
    let _count = 0;
    while (_count < duration) {
      cb.call(this, _count);
      yield _count++;
    }
  };
}
