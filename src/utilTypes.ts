// export interface LooseObject {
//   [ke: string]: any;
// }
export type LooseObject = Record<string | number | symbol, any>;

/** @alias LooseObject */
export type KeyValuePairs = Record<string | number | symbol, any>;

export type LooseVector2 = { x: number; y: number; [key: string]: any };

export type LooseFunction = (...args: any) => any;

/**
 * コンテキストを設定可能なGeneratorFunctionもどきの型
 */
export type ContextBindableGeneratorFunction<CTX = any> = (
  this: CTX,
  ...args: any[]
) => Generator;

export type Bit = 0 | 1;

export interface EventListenable {
  on: (eventType: string, handler: LooseFunction) => any;
  off: (eventType: string, handler: LooseFunction) => any;
}
