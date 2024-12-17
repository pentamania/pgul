type ParticalCSSStyle = Partial<CSSStyleDeclaration>;

const DEFAULT_LINE_HEIGHT = 16;
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

  width: "200px",
  height: "250px",
  overflow: "auto",
};

export class Stats {
  private _targetProps: {
    // prettier-ignore
    obj: any;
    propName: string | number | symbol;
    label: string;
  }[] = [];
  private _domElement: HTMLDivElement | HTMLCanvasElement;
  private _canvasContext?: CanvasRenderingContext2D;
  private _text: string = "";
  private _lineHeight: number = 0;

  /**
   * @param updateEveryFrame
   * 毎フレーム自動更新するかどうか;
   * 更新頻度はrequestAnimationFrame依存 [default=true]
   *
   * @param customStyles
   * Custom CSS settings for dom
   *
   * @param domType "div" or "canvas" [default="canvas"]
   */
  constructor(
    updateEveryFrame = true,
    customStyles?: ParticalCSSStyle,
    domType: "div" | "canvas" = "canvas"
    // domType: "div" | "canvas" = "div"
  ) {
    this._domElement =
      domType === "canvas"
        ? document.createElement("canvas")
        : document.createElement("div");

    // Apply style
    Object.assign(this._domElement.style, DEFAULT_DOM_STYLE, customStyles);
    this.lineHieght = DEFAULT_LINE_HEIGHT;

    // Set up canvas context
    if (this._domElement instanceof HTMLCanvasElement) {
      const ctx = (this._canvasContext = this._domElement.getContext("2d")!);
      ctx.font = `${this._domElement.style.fontSize} arial`;
      ctx.fillStyle = this._domElement.style.color;
      ctx.textBaseline = "top";
    }

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
    // TODO: Resize height to fit texts?
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

  set lineHieght(v: number) {
    this._lineHeight = v;
    this._domElement.style.lineHeight = v + "px";
  }

  set text(v: string) {
    if (v === this._text) return;
    if (this._domElement instanceof HTMLCanvasElement) {
      const ctx = this._canvasContext;
      if (!ctx) {
        // TODO: Warn "No canvas context"
        return;
      }
      ctx.clearRect(0, 0, this._domElement.width, this._domElement.height);
      v.split("\n").forEach((line, i) => {
        ctx.fillText(line, 0, this._lineHeight * i);
      });
    } else {
      this._domElement.innerText = v;
    }
    this._text = v;
  }

  get domElement() {
    return this._domElement;
  }
}
