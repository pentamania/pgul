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

  /** Turn on when you want to disable selection of this item */
  isLocked?: boolean;
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
    addItem(...items: FocusableMenuItem[]) {
      items.forEach((item) => {
        this._optionItems.push(item);
      });

      // Update focus
      this.selectItem(this._currentItemIndex);
    }

    /**
     * 指定インデックスの項目を選択（フォーカス）状態にする
     * （== その他のItemは非フォーカス化）
     *
     * @param itemIndex 0 ~ アイテム数の範囲内に補正、0以下の時はループ
     * @returns 選択したアイテム要素、ロックされてたらfalse
     */
    selectItem(itemIndex: number): FocusableMenuItem | false {
      // indexを 0 ~ 最大インデックスの範囲内に収める
      itemIndex =
        itemIndex < 0
          ? this.lastItemIndex // 0以下の時はループ
          : itemIndex % this.itemNum;

      const nextItem = this._optionItems[itemIndex];

      // ロックされてたらreturn false
      if (nextItem.isLocked) return false;

      this._optionItems.forEach((item, i) => {
        if (i === itemIndex) {
          item.focus();
        } else {
          item.defocus();
        }
      });

      this._currentItemIndex = itemIndex;
      return nextItem;
    }

    /**
     * ひとつ前の項目を選択
     */
    selectPrev() {
      let i = -1;
      while (!this.selectItem(this._currentItemIndex + i)) {
        --i;
      }
    }

    /**
     * ひとつ後の項目を選択
     */
    selectNext() {
      let i = 1;
      while (!this.selectItem(this._currentItemIndex + i)) {
        ++i;
      }
    }

    /**
     * 現在のItemに仕込まれた処理を実行
     *
     * @param args 実行処理の引数
     * @returns 実行結果を返す。何もしなかった場合はfalseを返す（仮）
     */
    runOption(...args: any) {
      if (this.currentItem.execute && !this.currentItem.isLocked) {
        return this.currentItem.execute(...args);
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
