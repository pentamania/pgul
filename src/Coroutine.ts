import { CoroutineAction } from "./interfaces";

export interface CoroutineTask<CTX = any> {
  action: CoroutineAction<CTX>;
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
  isAwake = true;

  // constructor(options) {
  // }

  /**
   * ルーチン処理を進める
   * ループが有効な場合はジェネレーターをリセットする
   */
  step() {
    if (!this.isAwake) return;
    if (!this._generator) return;

    // 進行
    const nextResult = this._generator.next();

    // // イベント発火
    // this.has('next') && this.flare('next',  {
    //   result: nextResult,
    // })

    // すべての処理が終わったら
    if (nextResult.done) {
      if (this._loop) {
        this.reset(); // 巻き戻す
      } else {
        this.clear();
      }
    }
  }

  /**
   * resetする？
   * @param taskObj func<*function>とarguments<any[]>をもったオブジェクト
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
    this.isAwake = true;
    this.reset();
    return this;
  }

  pause() {
    this.isAwake = false;
    return this;
  }

  resume() {
    this.isAwake = true;
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
