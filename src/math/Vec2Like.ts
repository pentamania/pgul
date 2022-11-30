import { GConstructor } from "../core/utilTypes";

export interface Vec2Like {
  /** X要素。 */
  x: number;
  /** Y要素。 */
  y: number;
}

/**
 * Vec2Likeにプロパティ設定
 */
export interface LooseVector2 {
  /** X要素。 */
  x: number;
  /** Y要素。 */
  y: number;
  /** Other props */
  [key: string]: any;
}

/** @alias LooseVector2 */
export type TwoDimensionalObject = LooseVector2;

/**
 * プロパティとしてx, yを持ったオブジェクトのコンストラクタ型
 */
export type TwoDimensionalObjectConstructor = GConstructor<Vec2Like>;
