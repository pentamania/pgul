// GeneratorFunction-like TaskAction type
type TaskAction<CTX = any> = (this: CTX, ...args: any[]) => Generator;

export interface QueueTaskCommon<CTX = any> {
  /** String for registered action-func, or action-func itself */
  action: string | TaskAction<CTX>;

  /** Arguments for action-func */
  args?: any[];
}

export interface SerialQueueTask<CTX = any> extends QueueTaskCommon<CTX> {
  /** 前回タスクからの(フレーム/時間)インターバル */
  interval: number;
}

export type ActionDictionary<T = string> = Map<T, TaskAction>;
