import { GConstructor } from "../utilTypes";

export interface IconGauganizeItem {
  /** Activate func */
  turnOn: (i: number, ...args: any[]) => any;

  /** Deactivate func */
  turnOff: (i: number, ...args: any[]) => any;
}

/**
 * [en] DESC
 *
 * [jp]
 * ゼルダの💛のようにパラメータをアイコンで表現可能にする
 *
 * CurrentValue / MaxValue (=> Appended item num)
 * - 3/5 -> ♥♥♥♡♡
 * - 6/5 -> ♥♥♥♥♥
 * - -1/5 -> ♡♡♡♡♡
 *
 * @example
 * TODO
 *
 * @param Base
 * @returns
 */
export function IconGauganize<TBase extends GConstructor>(Base: TBase) {
  return class extends Base {
    _value: number = 0;
    readonly _iconObjects: IconGauganizeItem[] = [];

    updateState() {
      this._iconObjects.forEach((icon, i) => {
        if (i < this._value) {
          icon.turnOn(i);
        } else {
          icon.turnOff(i);
        }
      });
    }

    appendItem(icon: IconGauganizeItem) {
      this._iconObjects.push(icon);
      this.updateState();
    }

    setValue(v: number) {
      this._value = v;
      this.updateState();
    }

    get value() {
      return this._value;
    }
    set value(v) {
      this.setValue(v);
    }
  };
}
