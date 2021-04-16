type ParticalCSSStyle = Partial<CSSStyleDeclaration>;

const DEFAULT_DOM_STYLE: ParticalCSSStyle = {
  color: "white",
  backgroundColor: "gray",
  opacity: "0.7",

  fontSize: "16px",
  borderRadius: "1px",
  // border: "2px solid black",

  position: "fixed",
  top: "4px",
  right: "4px",
  padding: "4px",
  zIndex: "2147483647",
};

export class Stats {
  private _targetProps: {
    // prettier-ignore
    obj: any;
    propName: string | number | symbol;
    label: string;
  }[] = [];
  private _domElement: HTMLDivElement = document.createElement("div");
  private _text: string = "";

  /**
   * @param updateEveryFrame 毎フレーム更新する
   * @param customStyles
   */
  constructor(updateEveryFrame = true, customStyles?: ParticalCSSStyle) {
    // Apply style
    Object.assign(this._domElement.style, DEFAULT_DOM_STYLE, customStyles);

    // 自動表示更新
    if (updateEveryFrame) {
      const _loop = () => {
        this.updateText();
        requestAnimationFrame(_loop);
      };
      _loop();
    }
  }

  /**
   * 追跡表示するパラメータを追加
   * @param targetObjRef
   * @param propName
   */
  subscribe<T = any>(label: string, targetObjRef: T, propName: keyof T) {
    this._targetProps.push({
      obj: targetObjRef,
      propName: propName,
      label: label,
    });
    return this;
  }

  /**
   * 追跡パラメータを全てクリア
   */
  unsubscribeAll() {
    this._targetProps.length = 0;
    return this;
  }

  /**
   * プロパティ表示を更新する
   */
  updateText() {
    if (!this._targetProps.length) return;
    this.text = this._targetProps
      .map((item) => {
        const key = String(item.propName);
        const val = JSON.stringify(item.obj[key]);
        return `${item.label}: ${val}`;
      })
      .join("\n");
  }

  clearText() {
    this.text = "";
  }

  /**
   * 表示DOMをappend
   * @param dom
   */
  append(dom: HTMLElement = document.body) {
    dom.appendChild(this._domElement);
    return this;
  }

  /**
   * 追跡パラメータのクリアとappend解除
   * 参照の類を切るときに使用
   */
  detach() {
    this.unsubscribeAll();
    if (this._domElement.parentElement) {
      this._domElement.parentElement.removeChild(this._domElement);
    }
  }

  /**
   * DOM要素の表示・非表示
   */
  set visible(v: boolean) {
    if (!v) {
      this._domElement.style.visibility = "hidden";
    } else {
      this._domElement.style.visibility = "visible";
    }
  }

  set text(v: string) {
    if (v === this._text) return;
    this._domElement.innerText = v;
    this._text = v;
  }

  get domElement() {
    return this._domElement;
  }
}
