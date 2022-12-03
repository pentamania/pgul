import { GConstructor } from "../../core/utilTypes";
import { FocusableMenuItem } from "./MenuItem";

/**
 * 指定オブジェクトにメニュー化するMixin.
 * 主に項目の追加、およびそれらを選択・実行する処理を追加する
 *
 * @param Base
 */
export function Menuify<TBase extends GConstructor<any>>(Base: TBase) {
  return class Menuify extends Base {
    _currentItemIndex: number = 0;
    _optionItems: FocusableMenuItem[] = [];

    /**
     * 項目オブジェクトを追加
     *
     * @param items
     */
    appendItem(...items: FocusableMenuItem[]) {
      items.forEach((item) => {
        this._optionItems.push(item);
      });

      // Update focus
      this._selectItem(this._currentItemIndex);
    }

    /**
     * @alias appendItem
     */
    addItem(...items: FocusableMenuItem[]) {
      return this.appendItem(...items);
    }

    /**
     * See ${@link Menuify.selectItem}
     *
     * @param itemIndex 0 ~ アイテム数の範囲内に補正、0以下の時はループ
     * @returns
     * 選択できたらアイテム参照、そうでなければfalse
     */
    _selectItem(itemIndex: number): FocusableMenuItem | false {
      // indexを 0 ~ 最大インデックスの範囲内に収める
      itemIndex =
        itemIndex < 0
          ? this.lastItemIndex // 0以下の時はループ
          : itemIndex % this.itemNum;

      const nextItem = this._optionItems[itemIndex];
      if (!nextItem) {
        // TODO Warn "No item"
        return false;
      }

      // ロックされてたらreturn false
      if (nextItem.isLocked) return false;

      // Reset focus
      this._optionItems.forEach((item) => item.defocus());
      nextItem.focus();

      this._currentItemIndex = itemIndex;
      return nextItem;
    }

    /**
     * @private
     * @returns
     * 全ての項目がロック状態になっていればtrue
     */
    _isAllItemLocked(): boolean {
      // lock状態になってない奴が一つも見つかなければtrue
      return this._optionItems.find((item) => !item.isLocked) === undefined;
    }

    /**
     * 指定インデックスの項目を選択（フォーカス）状態にする
     * （== その他のItemは非フォーカス化）
     *
     * @param index
     * index Item ; 0 ~ アイテム数の範囲内に補正、0以下の時はループ
     * @param recursiveSelect
     * Increment index and execute method
     * until selectable (unlocked) item is selected
     * (default: false)
     * @returns
     * Selected item, or `false` if it fails.
     * 選択したアイテム要素を返す。
     * ただしアイテムが見つからなかったり、ロックされてたらfalseを返す
     */
    selectItem(index: number, recursiveSelect: boolean = false) {
      if (recursiveSelect) {
        if (this._isAllItemLocked()) {
          // TODO: Warn "At least one item should be unlocked"
          return false;
        }
        while (!this._selectItem(index)) {
          index++;
        }
      }
      return this._selectItem(index);
    }

    /**
     * ひとつ前の項目を選択
     * ロックされていたらさらにひとつ前を選ぶ
     *
     * @returns
     * 選択することができない（全てロックされている）場合、falseを返す
     */
    selectPrev() {
      if (this._isAllItemLocked()) {
        // TODO: Warn "At least one item should be unlocked"
        return false;
      }
      let i = -1;
      while (!this._selectItem(this._currentItemIndex + i)) {
        --i;
      }
      return true;
    }

    /**
     * ひとつ後の項目を選択
     * ロックされていたらさらにひとつ後を選ぶ
     *
     * @returns
     * 選択することができない（全てロックされている）場合、falseを返す
     */
    selectNext() {
      if (this._isAllItemLocked()) {
        // TODO: Warn "At least one item should be unlocked"
        return false;
      }
      let i = 1;
      while (!this._selectItem(this._currentItemIndex + i)) {
        ++i;
      }
      return true;
    }

    /**
     * 現在のItemに仕込まれた処理を実行
     *
     * @param args 実行処理の引数
     *
     * @returns
     * WIP 実行結果を返す。何もしなかった場合はfalseを返す
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
