// export interface LooseObject {
//   [ke: string]: any;
// }
export type LooseObject = Record<string | number, any>;

export type LooseVector2 = { x: number; y: number; [key: string]: any };

/**
 * コンテキストを設定可能なGeneratorFunctionもどきの型
 */
export type ContextBindableGeneratorFunction<CTX = any> = (
  this: CTX,
  ...args: any[]
) => Generator;
