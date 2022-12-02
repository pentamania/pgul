import { List } from "../core/List";
import { Vec2LikeConstructor, Vec2Like } from "./Vec2Like";
import { Vector2 } from "./Vector2";

const DEFAULT_TRACE_LIST_SIZE = 8;

/**
 * STGのビットのように追跡対象を距離をとって追いかける機能を付与するMixin.
 * グラディウスのオプションのように指定したターゲットを時間差で追いかけさせることもできる
 *
 * @example
 * class Bit extends Traceable(Vector2) {}
 *
 * const player = new Vector2();
 * const bit = new Bit();
 * bit.setTracingTarget(player);
 *
 * // Runs every frame
 * ticker.add(()=> {
 *   if (playerGoesLeft) {
 *     bit.pushTracePosition(player.x, player.y)
 *     player.x -= 4;
 *   }
 *   // Always reflect tracing
 *   bit.applyTracePosition();
 * })
 *
 * @param Base
 */
export function Traceable<TBase extends Vec2LikeConstructor>(Base: TBase) {
  return class extends Base {
    _tracingTarget?: Vec2Like;
    readonly _tracePositionList: List<Vector2> = new List();
    _currentTracingPosition?: Vector2;

    /** 追跡するかどうか */
    tracingEnabled: boolean = true;

    /** 固定追跡を有効化 */
    fixedTracingEnabled: boolean = false;

    /** 固定追跡時の距離 */
    readonly fixedDistanceVector: Vector2 = new Vector2(0, 0);

    /**
     * 初期化でデフォルトリストサイズをセット
     */
    constructor(...params: any[]) {
      super(...params);
      this.setTraceListSize(DEFAULT_TRACE_LIST_SIZE);
    }

    /**
     * 追跡対象を設定
     * @param target
     */
    setTracingTarget(target: Vec2Like) {
      this._tracingTarget = target;
      return this;
    }

    /**
     * 追跡位置リストのサイズを設定。
     * 大きいほど追跡対象とのディレイが大きくなる
     *
     * 設定されていないと本ミックスインの効果が無いことに注意
     *
     * @param size
     */
    setTraceListSize(size: number) {
      this._tracePositionList.setSize(size);
    }

    /**
     * トレース位置を追加。
     * VectorがListから押し出された場合、それが適用される位置になる
     * TODO: 即座に位置反映するオプションを用意？
     *
     * @param x
     * @param y
     * @returns
     * [jp] pushの結果、押し出されたvec2（適用位置）があったらそれを返す
     */
    pushTracePosition(x: number, y: number) {
      // TODO: Vectorオブジェクトはプーリングして使いまわす？
      const popped = this._tracePositionList.push(new Vector2(x, y));
      if (popped instanceof Vector2) {
        this._currentTracingPosition = popped;
        return popped;
      }
      return;
    }

    /**
     * 追跡対象との間を補間するよう、トレース位置を設定
     * （過去の位置は結果的にすべてクリアされる）
     */
    pushInterpolatedPositions() {
      if (!this._tracingTarget) return;

      const traceListSize = this._tracePositionList.getSize();
      if (!traceListSize) return;

      const deltaUnitX = (this.x - this._tracingTarget.x) / traceListSize;
      const deltaUnitY = (this.y - this._tracingTarget.y) / traceListSize;
      for (let i = 0; i <= traceListSize; i++) {
        this.pushTracePosition(
          this.x - deltaUnitX * i,
          this.y - deltaUnitY * i
        );
      }
    }

    /**
     * 過去トレース位置をすべてクリア
     */
    clearTracingPositions() {
      this._tracePositionList.clear();
    }

    /**
     * 固定距離を設定 ＋ 固定トレース有効化
     * @param x
     * @param y
     */
    setFixedDistance(x: number, y: number) {
      this.fixedTracingEnabled = true;
      this.fixedDistanceVector.set(x, y);
    }

    /**
     * 追跡対象との距離を記憶 ＋ 固定トレース有効化
     */
    preserveDistance() {
      if (!this._tracingTarget) return;
      this.setFixedDistance(
        this.x - this._tracingTarget.x,
        this.y - this._tracingTarget.y
      );
    }

    /**
     * 位置を反映する
     * 基本毎フレーム実行
     */
    applyTracePosition() {
      if (!this.tracingEnabled) return;

      if (this.fixedTracingEnabled) {
        // 固定追跡モード
        if (!this._tracingTarget) return;
        this.x = this._tracingTarget.x + this.fixedDistanceVector.x;
        this.y = this._tracingTarget.y + this.fixedDistanceVector.y;
      } else {
        // スネークモード
        if (!this._currentTracingPosition) return;
        this.x = this._currentTracingPosition.x;
        this.y = this._currentTracingPosition.y;
      }
    }
  };
}
