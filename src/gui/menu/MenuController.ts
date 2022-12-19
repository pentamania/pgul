import { Menuify } from "./Menuify";

/** Menuable拡張クラス型 */
abstract class Menu extends Menuify(
  class {
    /**
     * @virtual
     * メニューを有効化
     * 選択肢を表示したりなど
     */
    activate() {}

    /**
     * @virtual
     * メニューを非アクティブ化
     */
    deactivate() {}
  }
) {}

/**
 * [jp]
 * メニュー管理クラス
 *
 * メニューコンポーネントは三つの段階に分かれる
 * - Controller: 複数のMenuを切替・管理する（本クラス）
 * - Menu：メニュー本体
 * - Item：項目。Menuの子に当たる概念
 *
 * @example
 * // TODO
 *
 */
export class MenuController<ML = any, MT extends Menu = Menu> {
  private _currentMenu?: MT;
  private _menuMap: Map<ML, MT> = new Map();
  private _prevMenuStack: MT[] = [];

  /**
   * メニュー切替
   * Deactivate current menu
   * -> Set (activated) specified menu
   *
   * @param menu menu to activate
   */
  private _setActiveMenu(menu: MT) {
    if (this._currentMenu) this._currentMenu.deactivate();
    menu.activate();
    this._currentMenu = menu;
  }

  /**
   * メニュー追加
   *
   * @param label Menu label
   * @param menu
   */
  addMenu(label: ML, menu: MT) {
    this._menuMap.set(label, menu);
  }

  /**
   * ラベルでメニューを取得
   *
   * @param label Menu label
   * @returns
   */
  getMenu(label: ML) {
    return this._menuMap.get(label);
  }

  /**
   * アクティブにしたいメニューをlabel指定
   *
   * @param label
   * @param resetState
   */
  setActiveMenu(label: ML, resetState: boolean = false) {
    if (this._currentMenu) {
      // 現在のメニューをスタック保存
      this._prevMenuStack.push(this._currentMenu);
    }

    let nextMenu = this.getMenu(label);
    if (nextMenu) {
      this._setActiveMenu(nextMenu);
      if (resetState) nextMenu.selectItem(0);
    }
  }

  /**
   * [jp]
   * 直前のメニューに戻る
   *
   * @param resetCurrent Whether to reset current menu item selection
   * @returns 前メニューの有無をBooleanで返す
   */
  backToPrevMenu(resetCurrent: boolean = false): boolean {
    const prevMenu = this._prevMenuStack.pop();
    if (!prevMenu) {
      return false;
    }
    if (this._currentMenu && resetCurrent) this._currentMenu.selectItem(0);
    this._setActiveMenu(prevMenu);
    return true;
  }

  /**
   * [jp]
   * メニュー遷移履歴をクリア
   */
  clearHistory() {
    this._prevMenuStack.length = 0;
  }

  /**
   * [jp]
   * 選択中の項目を実行.
   * (currentMenuのrunOptionを実行 -> 選択中Itemのexecuteメソッドを実行)
   *
   * currentMenuが存在しない、 選択中Itemのexecuteが定義されてない場合は何もしない
   *
   * @returns
   * 実行結果を返す
   * 実行結果がラベル文字列を返した場合、対応するメニューをアクティブ化
   */
  runOption(...args: Parameters<typeof Menu.prototype.runOption>) {
    if (!this.currentMenu) return;
    const runResult = this.currentMenu.runOption(...args);
    if (typeof runResult === "string") {
      this.setActiveMenu((runResult as unknown) as ML);
    }
    return runResult;
  }

  /**
   * [jp]
   * 現在のメニューの一つ前の項目を選択
   * ＆その参照を返す（存在すれば）
   */
  selectPrevOption() {
    if (!this.currentMenu) {
      // TODO: warn?
      return;
    }
    return this.currentMenu.selectPrev();
  }

  /**
   * [jp]
   * 現在のメニューの一つ後の項目を選択
   * ＆その参照を返す（存在すれば）
   */
  selectNextOption() {
    if (!this.currentMenu) {
      // TODO: warn?
      return;
    }
    return this.currentMenu.selectNext();
  }

  /** 現在のメニュー参照 */
  get currentMenu(): MT | undefined {
    return this._currentMenu;
  }

  /** 直前のメニュー参照を取得 */
  get previousMenu(): MT | undefined {
    return this._prevMenuStack[this._prevMenuStack.length - 1];
  }
}
