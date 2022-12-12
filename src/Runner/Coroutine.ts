/**
 * コルーチン
 *
 * @example
 * const foo = {x: 1}
 *
 * // Set up
 * const coroutine = new Coroutine();
 * coroutine.addTask({
 *   action: function*() { foo.x++; }
 * });
 * coroutine.start();
 *
 * // Run
 * coroutine.step();
 * console.log(foo); // 2
 */
export class Coroutine {
  protected _generator?: Generator;
  protected _taskList: CoroutineTask[] = [];
  protected _loop = false;
  protected _isAwake = true;

  /**
   * [jp]
   * ルーチン処理を進める
   * ループが有効な場合はジェネレーターをリセットする
   *
   * [en]
   * Step inner Generator
   *
   * @returns
   * 稼働状態であればnext結果を返す
   */
  step(): void | IteratorResult<any> {
    if (!this._isAwake) return;
    if (!this._generator) return;

    // 進行
    const result = this._generator.next();

    // すべての処理が終わってたら
    if (result.done) {
      if (this._loop) {
        this.reset(); // 巻き戻す
      } else {
        this.clear();
      }
    }

    return result;
  }

  /**
   * [jp]
   * タスクを追加
   *
   * [en]
   * Add coroutine task
   *
   * @param taskObj func<*function>とarguments<any[]>をもったオブジェクト
   * @param resetAfterAdding 追加後に内部Generatorをリセットするかどうか
   * @returns this
   */
  addTask(taskObj: CoroutineTask, resetAfterAdding = false) {
    this._taskList.push(taskObj);
    if (resetAfterAdding) this.reset();
    return this;
  }

  /**
   * [jp]
   * JSONでタスク設定
   *
   * [en]
   * addTaskFromJSON
   *
   * @param taskJson
   * @returns this
   */
  addTaskFromJSON(taskJson: CoroutineTask[]) {
    taskJson.forEach((tsk) => {
      this._taskList.push(tsk);
    });
    this.reset();
    return this;
  }

  /**
   * [jp]
   * taskリストからジェネレーターをリセット
   *
   * [en]
   * Reset
   *
   * @returns this
   */
  reset() {
    this._generator = Coroutine.convertTaskListToGenarator(
      this._taskList,
      this
    );
    return this;
  }

  /**
   * [jp]
   * step可能にする
   * 内部ジェネレーターリセットも兼ねる
   *
   * [en]
   * Reset and enable coroutine stepping
   *
   * @returns this
   */
  start() {
    this._isAwake = true;
    this.reset();
    return this;
  }

  /**
   * [jp]
   * 処理をポーズする（step処理をスキップするようにする）
   *
   * [en]
   * Pause coroutine stepping.
   *
   * @returns this
   */
  pause() {
    this._isAwake = false;
    return this;
  }

  /**
   * [jp]
   * ポーズ中の処理を再開
   *
   * [en]
   * Resume coroutine stepping.
   *
   * @returns this
   */
  resume() {
    this._isAwake = true;
    return this;
  }

  /**
   * [jp]
   * 内部Generatorをクリア（コルーチン処理消去）
   *
   * [en]
   * Clear current running generator.
   *
   * @returns this
   */
  clear() {
    this._generator = undefined;
    return this;
  }

  /**
   * [jp]
   * ループを設定
   *
   * [en]
   * Whether to reset generator after it is "done".
   *
   * @returns this
   */
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
   * [jp]
   * 稼働状態を返す。
   * falseの際はstepを実行しても進まない
   * pause/resumeなどで更新
   *
   * [en]
   * Return isAwake
   *
   */
  get isAwake() {
    return this._isAwake;
  }

  /**
   * [jp]
   * taskリストをジェネレーターオブジェクトに変換
   *
   * [en]
   * convertTaskListToGenarator
   *
   * @param taskList
   * @param context task.actionのthisとして扱うオブジェクト
   * @returns Converted Generator
   */
  static convertTaskListToGenarator(
    taskList: CoroutineTask[],
    context: Coroutine
  ) {
    const genList = taskList.map((task) => {
      return task.action.apply(context, task.args || PLACEHOLDER_EMPTY_ARRAY);
    });
    return (function* () {
      for (let g of genList) yield* g;
    })();
  }
}

/** Coroutine.addTask用パラメータ型 */
export interface CoroutineTask {
  action: (...args: any[]) => Generator;
  args?: any[];
}

// args無指定のときに代わりに使われる仮の配列
const PLACEHOLDER_EMPTY_ARRAY: never[] = [];
