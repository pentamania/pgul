import { Runner, RunnerAction, TargetDeclaredRunnerAction } from "../../Runner";

/**
 * 毎フレーム、指定コールバック関数を実行するRunnerAction生成
 *
 * @param cb
 * @param duration
 * @returns
 */
export function createEachFrameAction<RT = any>(
  // @prettier-ignore
  cb: (cnt: number, runner: Runner<RT>) => any,
  duration: number = Infinity
): RunnerAction<RT> {
  return function* () {
    let _currentCount = 0;
    while (_currentCount < duration) {
      cb(_currentCount, this);
      yield _currentCount++;
    }
  };
}

/**
 * [en]
 * Creates action which executes specified function constantly.
 * Action ends when running count reaches all
 *
 * [jp]
 * 指定処理を定期的なタイミングで実行するRunnerAction生成。
 * アクションは指定回数行ったら終了
 *
 * @example
 * createConstantRunningAction<EnemyAbstract>(
 *   firingNum,
 *   (runner) => {
 *     const en = runner.target!;
 *     const b = pickBullet(bulletType);
 *     b.setActionRunner(...createDroppingActionThread());
 *     b.copyPosition(en);
 *     en.sceneRef.addBullet(b);
 *   },
 *   firingInterval,
 * );
 *
 * @param executeNum
 * @param executeFunc
 * @param execInterval
 */
export function createConstantFuncRunningAction<RT = any>(
  executeNum: number,
  executeFunc: (runner: Runner<RT>, i: number, frameCount: number) => any,
  execInterval: number
): RunnerAction<RT> {
  return function* () {
    let _frameCount = 0;
    let _currentRunningCount = 0;
    while (_currentRunningCount < executeNum) {
      if (_frameCount % execInterval === 0) {
        executeFunc(this, _currentRunningCount, _frameCount);
        _currentRunningCount++;
      }
      yield _frameCount++;
    }
  };
}

/**
 * 定期的に指定アクションを実行する処理
 *
 * @example
 * // TODO
 *
 * @param duration
 */
export function createConstantActionRunningAction<RT = any>(
  actionRunningInterval: number,
  runnerAction: RunnerAction<RT> | TargetDeclaredRunnerAction<RT>,
  duration: number
): RunnerAction | TargetDeclaredRunnerAction {
  return function* () {
    let _cnt = 0;
    let _inActionGen: Generator | undefined = runnerAction.bind(this)();
    let _inActionSetupWait = 0;
    while (_cnt < duration) {
      // Set up action-generator constantly
      if (!_inActionGen && actionRunningInterval <= _inActionSetupWait) {
        _inActionGen = runnerAction.bind(this)();
        _inActionSetupWait = 0;
      }

      if (_inActionGen) {
        // step run in-action-gen
        // clear gen if done
        if (_inActionGen.next().done) _inActionGen = undefined;
      } else {
        _inActionSetupWait++;
      }

      yield _cnt++;
    }
  };
}
