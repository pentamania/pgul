import { GConstructor } from "../core/utilTypes";

export interface Vec2Like {
  /** X要素。 */
  x: number;
  /** Y要素。 */
  y: number;
}

/** Vec2Likeコンストラクタ型 */
export type Vec2LikeConstructor = GConstructor<Vec2Like>;

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
 * @alias Vec2LikeConstructor
 * プロパティとしてx, yを持ったオブジェクトのコンストラクタ型
 */
export type TwoDimensionalObjectConstructor = Vec2LikeConstructor;
