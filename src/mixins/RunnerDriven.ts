import { List } from "../List";
import {
  Runner,
  RunnerAction,
  TargetDeclaredRunner,
  TargetDeclaredRunnerAction,
} from "../Runner/index";
import combineGeneratorFunctions from "../utils/combineGeneratorFunctions";
import { GConstructor } from "./common";

type ChildContainable = GConstructor<{
  children?: any[];
}>;

/**
 * RunnerAction配列
 * 直列あるいは並列アクションを表現
 *
 * Runnerのtargetは確定しているものとする
 */
export type RunnerActionList<T = any> = TargetDeclaredRunnerAction<T>[];

/**
 * 複合RunnerAction
 */
export type RunnerActionComplex<T = any> =
  | TargetDeclaredRunnerAction<T>
  | RunnerActionList<T>;

/**
 * - 複数のRunnerActionのバンドル
 * - RunnerActionList型を直列か並列処理とするかはメソッドによって異なる
 */
export type RunnerActionBundle<T = any> = RunnerActionComplex<T>[];

// enum ActorEvent {
//   _RunnerAllDead = "__runneralldead__",
// }

/**
 * Runnerによって駆動するためのメソッドを付与
 * @param Base
 */
export function RunnerDriven<TBase extends ChildContainable>(Base: TBase) {
  return class RunnerDriven extends Base {
    _runners: TargetDeclaredRunner[] = [];
    _actionBundleList?: List<RunnerActionBundle>;

    /**
     * updateRunnersにてrunnerが全removeした際に実行
     * setActionPattern用
     * 更新・解除を都度忘れないこと
     */
    _onRunnerAllDead?: () => void;

    /**
     * runnerの進行
     */
    updateRunners() {
      if (this._runners.length) {
        for (let i = this._runners.length - 1; i >= 0; i--) {
          const result = this._runners[i].step();
          if (result && result.done) {
            this._runners.splice(i, 1);
          }
        }
        if (!this._runners.length) {
          // 全てのrunnerがremove
          if (this._onRunnerAllDead) this._onRunnerAllDead();
          // this.emit(ActorEvent._RunnerAllDead);
        }
      }
    }

    /**
     * Runnerを（初期化した後に）追加
     *
     * @param runner
     */
    addRunner(runner: Runner) {
      // runnerはTargetDeclaredRunnerとして扱うため、このsetTargetは大事
      runner.setTarget(this);
      runner.start();
      this._runners.push(runner as TargetDeclaredRunner);
      return this;
    }

    /**
     * 指定したアクションを組み込んだrunnerを追加
     *
     * アクションは直列処理される。
     * ただし配列（RunnerActionList型）で渡すとそのアクション群は並列処理される
     *
     * @example
     * // 以下のアクションを直列処理
     * actor.setActionRunner(
     *   act1,
     *   [act2_1, act2_2], // act2_1とact2_2は同時（並列）処理,
     *   act3
     * )
     *
     * @param actions 可変長引数
     * @returns 生成したRunnerを返す
     */
    setActionRunner(
      ...actions: RunnerActionComplex<this>[]
    ): TargetDeclaredRunner<this> {
      const runner = new Runner<this>();
      actions.forEach((action) => {
        if (Array.isArray(action)) {
          // 並列処理アクションを結合
          runner.addAction(
            RunnerDriven.combineRunnerActionList(action, runner)
          );
        } else {
          runner.addAction(action as RunnerAction);
        }
      });
      this.addRunner(runner);
      return runner as TargetDeclaredRunner;
    }

    /**
     * 並列処理されるRunnerを設定する
     *
     * @example
     * // Each thread runs simultaniously
     * actor.setParallelActionRunner(
     *   [
     *     action1, // thread_1
     *     [action2_1, action2_2], // thread_2 (serial: 2_1 -> 2_2)
     *     [
     *        action3_1,
     *        [action3_2_1, action3_2_2] // combined to parallel action
     *     ], // thread_3
     *     action4, // thread_4
     *   ],
     *   {endType: "any"} // Kill action when any thread is over
     * )
     *
     * @param runnerActions
     * @param options action options
     * @returns {@link Runner} instance
     */
    setParallelActionRunner(
      // runnerActions: RunnerActionComplex<this>[],
      runnerActions: (
        | RunnerActionComplex<this>
        | RunnerActionComplex<this>[]
      )[],
      options: { endType: "any" | "all" } = { endType: "all" }
    ) {
      let allGens: Generator[] = [];
      const runner = new Runner<this>() as TargetDeclaredRunner;

      runnerActions.forEach((rnrAct) => {
        if (Array.isArray(rnrAct)) {
          // is serial action -> convert to serial Generator
          const genList = (rnrAct as RunnerActionComplex<this>[]).map(
            (actCpx) => {
              if (Array.isArray(actCpx)) {
                // is RunnerActionList type: Combine to single RunnerAction (is parallel)
                return RunnerDriven.combineRunnerActionList(
                  actCpx,
                  runner
                ).bind(runner)();
              } else {
                // is RunnerAction type
                return actCpx.bind(runner)();
              }
            }
          );

          const serialGen = (function* () {
            for (let g of genList) yield* g;
          })();
          allGens.push(serialGen);
        } else {
          // is parallel action
          allGens.push(rnrAct.bind(runner)());
        }
      });

      let integratedRunnerAction: RunnerAction;
      if (options.endType === "any") {
        // 一つでもジェネレータが死んだら終了
        integratedRunnerAction = function* () {
          let endFlg = false;
          while (!endFlg) {
            allGens.forEach((gen) => {
              if (gen.next().done) endFlg = true;
            });
            yield;
          }
        };
      } else {
        // 全てのジェネレータが死んだら終了
        integratedRunnerAction = function* () {
          while (allGens.length) {
            allGens = allGens.filter((gen) => !gen.next().done);
            yield;
          }
        };
      }

      runner.addAction(integratedRunnerAction);
      this.addRunner(runner);
      return runner;
    }

    /**
     * 並列処理される複数のRunnerを設定する
     * 設定分だけのRunner配列を返す
     * 本体がうろうろしながら＋画面中に弾をあちこち出す、みたいな複雑なパターンを一括設定する際に有効
     *
     * {@link setActionRunner}と似た引数を受けるが、直列・並列の扱いが逆
     *
     * @example
     * actor.setParallelActionRunners([
     *   action1,
     *   [action2_1, action2_2], // 2_1 -> 2_2で直列処理される
     *   action3
     * ])
     *
     * @param actionList 要素がRunnerActionList型の場合、直列処理として扱われる
     * @param reset 既存Runnerを一掃するかどうか。既定はtrue
     */
    setMultiActionRunners(actionList: RunnerActionBundle, reset = true) {
      if (reset) this.removeAllRunners();
      const runners = actionList.map((a) => {
        // 配列変換
        a = Array.isArray(a) ? a : [a];
        const runner = this.setActionRunner(...a);
        // runner.setLoop(true);
        return runner;
      });
      return runners;
    }

    /**
     * Actionバンドルを切り替えながら繰り返す
     * 中ボス・ボスの複雑な行動パターンの設定に使用
     *
     * @example
     * // TODO
     *
     * @param actionBundles 可変長引数でActionBundleを順番にセット
     */
    setActionPattern(...actionBundles: RunnerActionBundle<this>[]) {
      this._actionBundleList = new List(...actionBundles);

      // 最初のアクションセットを設定
      this.setActionRunner(...this._actionBundleList.current);

      // 全てのrunner処理が死んだら、都度アクションセットを切り替える処理
      this._onRunnerAllDead = () => {
        if (!this._actionBundleList) return;
        this.setActionRunner(...this._actionBundleList.increment());
      };
    }

    /**
     * 指定runnerを除去
     * @param removedRunner
     */
    removeRunner(removedRunner: Runner) {
      this._runners = this._runners.filter((runner) => {
        return runner !== removedRunner;
      });
      return this;
    }

    /**
     * 全Runnerを除去
     */
    removeAllRunners() {
      this._runners.length = 0;
      // actionPatternサイクルで不具合が発生するので_onRunnerAllDeadはクリアしない
      // this._onRunnerAllDead = undefined;
      return this;
    }

    /**
     * 全Runnerを一時停止
     * 子要素のrunnerも再帰的に停止する
     */
    pauseRunners() {
      this._runners.forEach((runner) => runner.pause());
      if (this.children && this.children.length) {
        this.children.forEach((ch) => {
          if (ch.pauseRunners) ch.pauseRunners();
        });
      }
    }

    /**
     * 全Runnerを再開
     * 子要素のrunnerも再帰的に再開する
     */
    resumeRunners() {
      this._runners.forEach((runner) => runner.resume());
      if (this.children && this.children.length) {
        this.children.forEach((ch) => {
          if (ch.resumeRunners) ch.resumeRunners();
        });
      }
    }

    /**
     * Combine RunnerActionList to one RunnerAction
     * @private
     *
     * @param actions
     * RunnerActions to combine.
     * These actions will run parallel
     * @param runnerRef
     * Runner instance to bind "this" of actions
     */
    static combineRunnerActionList(
      actions: RunnerActionList,
      runnerRef: Runner
    ): RunnerAction {
      return combineGeneratorFunctions.bind(runnerRef)(
        ...(actions as GeneratorFunction[])
      ) as RunnerAction;
    }
  };
}

/**
 * RunnerDriven化class型
 * 型定義用
 */
export class RunnerDrivenClass extends RunnerDriven(class {}) {}
