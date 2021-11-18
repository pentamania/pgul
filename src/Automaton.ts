/**
 * 各状態の振る舞いを関数で指定
 */
export interface StateBehaviour<T, SL> {
  /**
   * 状態遷移した際に一度だけ行う処理
   * - thisの参照は設定したターゲット
   * - {@link Automaton#update}経由で引数を渡すことも可能
   */
  enter: (this: T, ...arg: any) => any;

  /**
   * その状態中、毎フレーム行う処理
   * - thisの参照は設定したターゲット
   * - {@link Automaton#update}経由で引数を渡すことも可能
   * - 状態ラベルをreturnするとその状態に移行（ただし同じ状態ラベルの時はそのまま）
   */
  update?: (this: T, ...arg: any) => SL | void;

  // Thinking....
  // exit?: (this: T, ...arg: any) => any;
}

/**
 * FSMの概念を実装したクラス。
 * @see http://www.lancarse.co.jp/blog/?p=1039
 *
 * あらかじめセットしたstateオブジェクトに応じてtargetに特定の振る舞いをさせる
 *
 * @example
 * TODO
 *
 */
export class Automaton<TT = any, SL = any> {
  protected _stateBehaviorMap: Map<SL, StateBehaviour<TT, SL>>;
  protected _currentStateLabel?: SL;
  target: TT;

  /**
   * @param target
   */
  constructor(target: TT) {
    this._stateBehaviorMap = new Map();
    this.target = target;
  }

  /**
   * 更新処理、基本的に毎フレーム呼び出す
   */
  update(...nextStateEnterArgs: any) {
    if (this._currentStateLabel == null) return;

    const currentState = this.getStateBehavior(this._currentStateLabel);
    if (!currentState) {
      // warnする？
      return;
    }

    if (currentState.update) {
      // 現stateのupdate関数の実行
      // もしupdateが新しい状態ラベルを返した場合はその状態に移行（null|undefinedでないこと）
      // ただし、同じステートの場合は何もしない
      const nextStateLabel = currentState.update.call(
        this.target,
        ...nextStateEnterArgs
      );
      if (
        nextStateLabel != null &&
        nextStateLabel !== this._currentStateLabel
      ) {
        this.setState(nextStateLabel, ...nextStateEnterArgs);
      }
    }
  }

  /**
   *
   * @param stateLabel
   */
  getStateBehavior(stateLabel: SL) {
    return this._stateBehaviorMap.get(stateLabel);
  }

  /**
   * 指定ステートをセット
   * その際にenterメソッドを実行
   * @param stateLabel ステートを示すラベル
   * @param enterFuncArgs 可変長引数でenter実行時に引数を渡せる
   */
  setState(stateLabel: SL, ...enterFuncArgs: any[]): this {
    const nextState = this.getStateBehavior(stateLabel);
    if (!nextState) {
      // if (process.env) console.warn("No State");
      return this;
    }
    nextState.enter.call(this.target, ...enterFuncArgs);
    this._currentStateLabel = stateLabel;
    return this;
  }

  /**
   * 状態を登録
   * @param stateLabel ステートを示すラベル
   * @param stateBehaviorObject ステート振る舞いオブジェクト
   */
  registerState(
    stateLabel: SL,
    stateBehaviorObject: StateBehaviour<TT, SL>
  ): this {
    this._stateBehaviorMap.set(stateLabel, stateBehaviorObject);
    return this;
  }

  /**
   * 現在の状態ラベル
   */
  get currentState() {
    return this._currentStateLabel;
  }
}
