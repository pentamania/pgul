import { ContextBindableGeneratorFunction } from "./utilTypes";

export interface CoroutineTask<CTX = any> {
  action: ContextBindableGeneratorFunction<CTX>;
  args?: any[];
}

// args無指定のときに代わりに使われる仮の配列
const PLACEHOLDER_EMPTY_ARRAY: never[] = [];

/**
 * コルーチン
 */
export class Coroutine {
  protected _generator?: Generator;
  protected _taskList: CoroutineTask[] = [];
  protected _loop = false;
  protected _isAwake = true;

  // constructor(options) {
  // }

  /**
   * ルーチン処理を進める
   * ループが有効な場合はジェネレーターをリセットする
   * @returns 稼働状態であればnext結果を返す
   */
  step(): void | IteratorResult<any> {
    if (!this._isAwake) return;
    if (!this._generator) return;

    // 進行
    const result = this._generator.next();

    // // イベント発火
    // this.has('next') && this.flare('next',  {
    //   result: nextResult,
    // })

    // すべての処理が終わったら
    if (result.done) {
      if (this._loop) {
        this.reset(); // 巻き戻す
      } else {
        this.clear();
      }
    }

    // return this._generator != null;
    return result;
  }

  /**
   * @param taskObj func<*function>とarguments<any[]>をもったオブジェクト
   * @param resetAfterAdding
   */
  addTask(taskObj: CoroutineTask, resetAfterAdding = false) {
    this._taskList.push(taskObj);
    if (resetAfterAdding) this.reset();
    return this;
  }

  addTaskFromJSON(taskJson: CoroutineTask[]) {
    taskJson.forEach((tsk) => {
      this._taskList.push(tsk);
    });
    this.reset();
    return this;
  }

  /**
   * taskリストからジェネレーターをリセット
   */
  reset() {
    this._generator = Coroutine.convertTaskListToGenarator(
      this._taskList,
      this
    );
    return this;
  }

  /**
   * step可能にする
   * 内部ジェネレーターリセットも兼ねる
   */
  start() {
    this._isAwake = true;
    this.reset();
    return this;
  }

  pause() {
    this._isAwake = false;
    return this;
  }

  resume() {
    this._isAwake = true;
    return this;
  }

  clear() {
    this._generator = undefined;
    return this;
  }

  setLoop(flag = true) {
    this._loop = flag;
    return this;
  }

  /**
   * [jp]
   * 稼働中の内部ジェネレータがあるかどうかを返す
   *
   * [en]
   * Returns true when inner-generator doesn't exists
   */
  get dead(): boolean {
    return this._generator == null;
  }

  /**
   * @readonly
   * 稼働状態を返す。
   * falseの際はstepを実行しても進まない
   * pause/resumeなどで更新
   */
  get isAwake() {
    return this._isAwake;
  }

  /**
   * taskリストをジェネレーターオブジェクトに変換
   *
   * @param taskList
   * @param context task.actionのthisとして扱うオブジェクト
   */
  static convertTaskListToGenarator(
    taskList: CoroutineTask[],
    context: Coroutine
  ) {
    const genList = taskList.map((task, i) => {
      return task.action.apply(context, task.args || PLACEHOLDER_EMPTY_ARRAY);
    });
    return (function* () {
      for (let g of genList) yield* g;
    })();
  }
}
