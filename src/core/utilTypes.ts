// export interface LooseObject {
//   [ke: string]: any;
// }
export type LooseObject = Record<string | number | symbol, any>;

/** @alias LooseObject */
export type KeyValuePairs = Record<string | number | symbol, any>;

export type LooseVector2 = { x: number; y: number; [key: string]: any };

/** @alias LooseVector2 */
export interface TwoDimensionalObject {
  x: number;
  y: number;
  [k: string]: any;
}

export type LooseFunction = (...args: any) => any;

/**
 * コンテキストを設定可能なGeneratorFunctionもどきの型
 */
export type ContextBindableGeneratorFunction<CTX = any> = (
  this: CTX,
  ...args: any[]
) => Generator;

export type Bit = 0 | 1;

export type DecimalNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EventListenable {
  on: (eventType: string, handler: LooseFunction) => any;
  off: (eventType: string, handler: LooseFunction) => any;
}

/**
 * 汎用コンストラクタ定義
 *
 * ミックスイン後のクラス型を定義
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html#constrained-mixins
 *
 * @example
 * type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
 */
export type GConstructor<T = {}> = new (...args: any[]) => T;

/**
 * プロパティとしてx, yを持った2Dコンストラクタ型
 */
export type TwoDimensionalObjectConstructor = GConstructor<{
  x: number;
  y: number;
}>;
