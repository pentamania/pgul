import { List } from "../List";
import { Runner, RunnerAction } from "../Runner/index";
import combineGeneratorFunctions from "../utils/combineGeneratorFunctions";
import { GConstructor, TwoDimensionalObjectConstructor } from "./common";

type ChildContainable = GConstructor<{
  children?: any[];
}>;

/**
 * RunnerAction配列
 * 直列あるいは並列アクションを表現
 */
export type RunnerActionList = RunnerAction[];

/**
 * 複合RunnerAction
 */
export type RunnerActionComplex = RunnerAction | RunnerActionList;

/**
 * - 複数のRunnerActionのバンドル
 * - RunnerActionList型を直列か並列処理とするかはメソッドによって異なる
 */
export type RunnerActionBundle = RunnerActionComplex[];

// enum ActorEvent {
//   _RunnerAllDead = "__runneralldead__",
// }

/**
 * Runnerによって駆動するためのメソッドを付与
 * @param Base
 */
export function RunnerDriven<
  TBase extends TwoDimensionalObjectConstructor & ChildContainable
>(Base: TBase) {
  return class extends Base {
    _runners: Runner[] = [];
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
     * ランナーを（初期化した後）追加
     * @param runner
     */
    addRunner(runner: Runner) {
      runner.setTarget(this);
      runner.start();
      this._runners.push(runner);
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
    setActionRunner(...actions: RunnerActionComplex[]): Runner {
      const runner = new Runner();
      actions.forEach((action) => {
        if (Array.isArray(action)) {
          // 並列処理化
          const combined = combineGeneratorFunctions.bind(runner)(
            ...(action as GeneratorFunction[])
          ) as RunnerAction;
          runner.addAction(combined);
        } else {
          runner.addAction(action);
        }
      });
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
    setParallelActionRunners(
      actionList: RunnerActionBundle,
      reset = true
    ): Runner[] {
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
    setActionPattern(...actionBundles: RunnerActionBundle[]) {
      this._actionBundleList = new List(...actionBundles);

      // 最初のアクションセットを設定
      this.setParallelActionRunners(this._actionBundleList.current, true);

      // 全てのrunner処理が死んだら、都度アクションセットを切り替える処理
      this._onRunnerAllDead = () => {
        if (!this._actionBundleList) return;
        this.setParallelActionRunners(this._actionBundleList.increment());
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
  };
}
