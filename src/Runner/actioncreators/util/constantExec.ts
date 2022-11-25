import { BaseRunner, BaseRunnerAction } from "../../BaseRunner";

/**
 * 毎フレーム、指定コールバック関数を実行するRunnerAction生成
 *
 * @param cb
 * @param duration
 * @returns
 */
export function createEachFrameAction<RT = any>(
  cb: (cnt: number, runner: BaseRunner<RT>) => any,
  duration: number = Infinity
): BaseRunnerAction<RT> {
  return function* () {
    let _currentCount = 0;
    while (_currentCount < duration) {
      cb(_currentCount, this);
      yield _currentCount++;
    }
  };
}

/**
 * @alias {@link createEachFrameAction}
 */
export function createEachStepAction<RT = any>(
  cb: (cnt: number, runner: BaseRunner<RT>) => any,
  duration?: number
): BaseRunnerAction<RT> {
  return createEachFrameAction(cb, duration);
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
  executeFunc: (runner: BaseRunner<RT>, i: number, frameCount: number) => any,
  execInterval: number
): BaseRunnerAction<RT> {
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
 * 定期的に指定RunnerActionを生成・内部実行するRunnerActionを生成
 *
 * @example
 * // 16step毎に指定アクション（寿命24step）を発生を試みる処理を100step持続する
 * // 0 -> 24+16 -> 24+16 + 24+16 -> ....の間隔で指定アクション生成
 * // つまり: 0~24 -> 40~64 -> 80~100(途中まで) のタイミングでGen実行
 * createConstantActionRunningAction(16, function*() {
 *   let _cnt = 0;
 *   while(_cnt < 24) {
 *     // Do something
 *     yield _cnt++;
 *   }
 * }, 100)
 *
 * @param actionRunningInterval
 * @param runnerAction
 * @param duration
 */
export function createConstantActionRunningAction(
  actionRunningInterval: number,
  runnerAction: (...args: any[]) => Generator,
  duration: number
): BaseRunnerAction {
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
