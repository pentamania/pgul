import {
  ActionDictionary,
  QueueTaskCommon,
  SerialQueueTask,
} from "./interfaces";

/**
 * 名前は仮
 * Coroutineの上位互換？こちらはパラレル処理が可能
 *
 * ## 用語について(WIP)
 * - Action（アクション）：実際の処理。基本はGeneratorFunctionの形式で書く
 * - Task（タスク）：処理の概要。アクションに加えて「いつ」「どのように（引数で指定）」等の情報を持つ。オブジェクト型 T = { action: A }
 * - Queue（キュー）：タスクを実行順に並べた順列のイメージ -> Q = [ T1, T2, T3, ... ]
 *
 * Q > T > A の順で粒度が細かくなるイメージ
 * さらに複数のQueueを統括する上位概念も設定可能だが、それは別クラスで扱う？
 *
 * @example
 * const ActionDic = new Map([
 *   ["hoge", (()=> {
 *     const COUNT = 4
 *     return function*() {
 *     // todo
 *     }
 *   )()]
 * ])
 * const queueRunner  new TaskQueue(ActionDic, [])
 * }
 *
 * // step on!
 * queueRunner.step()
 */
export class TaskQueue {
  private _taskContext: any | null = null; // actionのthisとなる
  private _tasksInProgress: Generator[] = [];
  private _queueProgressGenerator: Generator<
    number,
    void,
    unknown
  > | null = null;
  private _currentTaskList?: SerialQueueTask[];
  protected active = true;

  /**
   * @param queueTaskList キュータスクリスト
   * @param actionContext action実行時のthis参照となるオブジェクト
   */
  constructor(actionContext?: any, queueTaskList?: SerialQueueTask[]) {
    if (actionContext) this._taskContext = actionContext;
    if (queueTaskList) this.setSerialTaskList(queueTaskList);
  }

  /**
   * Queue及び進行中タスクを進める
   * next? tick?にする？
   */
  step() {
    if (!this.active) return;

    // 大本のQueue進める
    if (this._queueProgressGenerator) {
      const queueResult = this._queueProgressGenerator.next();
      if (queueResult.done) {
        this._queueProgressGenerator = null;
      }
    }

    // 進行中タスクを進める
    // タスクが同時に終了する可能性（->spliceによる配列ズレ）も考慮
    if (this._tasksInProgress.length > 0) {
      this._tasksInProgress.slice(0).forEach((actionGen) => {
        const res = actionGen.next();
        if (res.done) this.dequeue(actionGen);
      });
    }
  }

  reset() {
    if (!this._currentTaskList) return;
    this.setSerialTaskList(this._currentTaskList);
  }

  /**
   * タスクを実行中配列に追加
   * @param queueTask
   */
  enqueue(queueTask: QueueTaskCommon) {
    const actionDictionary = TaskQueue.ActionDictionary;
    const actionfunc =
      typeof queueTask.action === "string"
        ? actionDictionary.get(queueTask.action)
        : queueTask.action;
    if (!actionfunc) {
      console.warn("アクションが存在しません");
      return;
    }
    this._tasksInProgress.push(
      actionfunc.apply(this._taskContext, queueTask.args || FAKE_EMPTY_ARRAY)
    );
  }

  dequeue(taskGen: Generator) {
    return this._tasksInProgress.splice(
      this._tasksInProgress.indexOf(taskGen),
      1
    );
  }

  /**
   * いらない？
   * @param index
   */
  dequeueByIndex(index: number) {
    return this._tasksInProgress.splice(index, 1);
  }

  /**
   * 進行中のタスクを全て除去
   */
  public clearQueue() {
    this._tasksInProgress.length = 0;
  }

  setSerialTaskList(queueTaskList: SerialQueueTask[]) {
    this._currentTaskList = queueTaskList;
    // IIFEジェネレーター
    this._queueProgressGenerator = function* (this: TaskQueue) {
      let currentQueueIndex = 0;
      const lastIndex = queueTaskList.length;
      let countdown = queueTaskList[0].interval;
      while (currentQueueIndex < lastIndex) {
        if (countdown <= 0) {
          const queueTask = queueTaskList[currentQueueIndex];
          this.enqueue(queueTask);

          // 次のタスクをみる: interval=0のときは即座に実行中タスクとして追加
          // nextQueueが存在し、かつintervalがゼロである限り、処理を続ける
          // -> intervalがゼロ以外のときはcountdownをリセットしてループ抜ける
          let nextQueueTask: SerialQueueTask;
          do {
            nextQueueTask = queueTaskList[++currentQueueIndex];
            if (nextQueueTask) {
              if (nextQueueTask.interval === 0) {
                this.enqueue(nextQueueTask);
              } else {
                countdown = nextQueueTask.interval;
              }
            }
          } while (nextQueueTask && nextQueueTask.interval === 0);
        }
        countdown--;
        yield currentQueueIndex;
      }
    }.bind(this)();
  }

  resume() {
    this.active = true;
  }

  pause() {
    this.active = false;
  }

  get isAlive() {
    return this._queueProgressGenerator != null;
  }

  // setParallelTaskList(queueTaskList: SerialQueueTask[]) {
  // }

  /**
   * アクション辞書
   */
  static ActionDictionary: ActionDictionary = new Map();
  static setStaticActionDictionary(dic: ActionDictionary) {
    this.ActionDictionary = dic;
  }
}

const FAKE_EMPTY_ARRAY: never[] = [];
