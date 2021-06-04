import { GConstructor } from "./common";

export function Chargable<TBase extends GConstructor>(Base: TBase) {
  return class Chargable extends Base {
    _currentChargeCount: number = 0;
    maxChargeCount: number = Infinity;

    chargeIncrement(count = 1) {
      this._currentChargeCount = Math.min(
        this.maxChargeCount,
        this._currentChargeCount + count
      );
    }

    chargeRelease(cb?: (chargeCount: number) => any) {
      if (!this.isCharging) return;

      this.onChargeRelease(this._currentChargeCount);
      if (cb) cb(this._currentChargeCount);

      this.chargeReset();
    }

    /**
     * @virtual
     * チャージ解除時のコールバック
     */
    onChargeRelease(_chargeCount: number) {}

    chargeReset() {
      this._currentChargeCount = 0;
    }

    get isCharging() {
      return this._currentChargeCount > 0;
    }

    get isChargeMax() {
      return this._currentChargeCount === this.maxChargeCount;
    }

    get chargeCountRatio() {
      return this._currentChargeCount / this.maxChargeCount;
    }

    // get chargeCount() {
    //   return this._currentChargeCount;
    // }
  };
}
