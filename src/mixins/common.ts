/**
 * ミックスイン後のクラス型を定義
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html#constrained-mixins
 *
 * @example
 * type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
 */
export type GConstructor<T = {}> = new (...args: any[]) => T;

export type TwoDimensionalObjectConstructor = GConstructor<{
  x: number;
  y: number;
}>;

export interface TwoDimensionalObject {
  x: number;
  y: number;
  [k: string]: any;
}
