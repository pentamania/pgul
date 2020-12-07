/**
 * コンテキストを設定可能なGeneratorFunctionもどきの型
 */
export type CoroutineAction<CTX = any> = (
  this: CTX,
  ...args: any[]
) => Generator;

export type LooseVector2 = { x: number; y: number; [key: string]: any };
