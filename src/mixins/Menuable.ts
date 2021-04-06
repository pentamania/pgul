import { GConstructor } from "./common";

/**
 * Menuableのitemとして追加可能な型
 *
 * @example
 * import { Foo } from "./foo";
 * class OptionItem extends Foo implements FocusableMenuItem {
 *   focus() { this.alpha = 1.0 }
 *   defocus() { this.alpha = 0.5 }
 *   execute() { console.log("hallow!") }
 * }
 */
export interface FocusableMenuItem {
  focus: Function;
  defocus: Function;
  execute?: Function;
}

/**
 * 項目indexは追加した順番に付与
 * @param Base
 */
export function Menuable<TBase extends GConstructor>(Base: TBase) {
  return class Menuable extends Base {
    _currentItemIndex: number = 0;
    _optionItems: FocusableMenuItem[] = [];

    /**
     * 項目オブジェクトを追加
     * @param item
     */
    addItem(item: FocusableMenuItem) {
      item.defocus();
      this._optionItems.push(item);
    }

    /**
     * 指定インデックスの項目を選択（フォーカス）状態にする
     * @param itemIndex 0 ~ 最大インデックスの範囲内に補正されます
     */
    selectItem(itemIndex: number) {
      // indexを 0 ~ 最大インデックスの範囲内に収める
      itemIndex =
        itemIndex < 0
          ? this.lastItemIndex // 0以下の時はループ
          : itemIndex % this.itemNum;

      this._optionItems.forEach((item, i) => {
        if (i === itemIndex) {
          item.focus();
        } else {
          item.defocus();
        }
      });
      this._currentItemIndex = itemIndex;
    }

    /**
     * ひとつ前の項目を選択
     */
    selectPrev() {
      this.selectItem(this._currentItemIndex - 1);
    }

    /**
     * ひとつ後の項目を選択
     */
    selectNext() {
      this.selectItem(this._currentItemIndex + 1);
    }

    /**
     * 現在の項目に仕込まれた処理を実行
     * @returns
     */
    runOption() {
      if (this.currentItem.execute) {
        return this.currentItem.execute();
      }
      return false;
    }

    get currentItem() {
      return this._optionItems[this._currentItemIndex];
    }

    get currentItemIndex() {
      return this._currentItemIndex;
    }

    get itemNum() {
      return this._optionItems.length;
    }

    get lastItemIndex() {
      return this.itemNum - 1;
    }

    get items() {
      return this._optionItems.slice(0);
    }
  };
}
