import clamp from "../core/clamp";

// Helper vars & funcs
const oneThird = 1 / 3;
const oneSixth = 1 / 6;
const half = 0.5;
const twoThird = 2 / 3;
function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < oneSixth) return p + (q - p) * 6 * t;
  if (t < half) return q;
  if (t < twoThird) return p + (q - p) * (twoThird - t) * 6;
  return p;
}

export type ColorCodeTupple = [number, number, number];

/**
 * HSL色処理ヘルパークラス
 * HSL値を保持し、RGBに変換などする
 */
export class HslColorHelper {
  /** hue: 0 ~ 1  */
  _h: number;
  /** saturation: 0 ~ 1  */
  _s: number;
  /** luminescence: 0 ~ 1 */
  _l: number;

  /**
   * @param {number} [h=0]
   * @param {number} [s=0.5]
   * @param {number} [l=0.5]
   */
  constructor(h: number = 0, s: number = 0.5, l: number = 0.5) {
    this._h = h;
    this._s = s;
    this._l = l;
  }

  private _toRgbHex(): string {
    // hslToRgb
    let [r, g, b] = HslColorHelper.hslToRgb(this._h, this._s, this._l);

    // Convert to 0 ~ 255 int
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    // Convert to hex
    return `${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  }

  /**
   * 現在のHSL値を`#ffee11`のような形式のRGB文字列で返す
   */
  toRgbHexString(): string {
    return `#${this._toRgbHex()}`;
  }

  /**
   * 現在のHSL値をRGB16進数Number型で返す
   */
  toRgbHex(): number {
    return parseInt(this._toRgbHex(), 16);
  }

  toCssColorStyle() {
    return `hsl(${this._h * 360}, ${this._s * 100}%, ${this._l * 100}%)`;
  }

  /**
   * hue: clamped to 0 ~ 1
   */
  get h() {
    return this._h;
  }
  set h(v) {
    if (v === this._h) return;
    this._h = clamp(v, 0, 1);
  }

  /**
   * saturation: clamped to 0 ~ 1
   */
  get s() {
    return this._s;
  }
  set s(v) {
    if (v === this._s) return;
    this._s = clamp(v, 0, 1);
  }

  /**
   * luminescence: clamped to 0 ~ 1
   */
  get l() {
    return this._l;
  }
  set l(v) {
    if (v === this._l) return;
    this._l = clamp(v, 0, 1);
  }

  /**
   * 0 ~ 1範囲のHSL値を同じく 0 ~ 1範囲のRGB値に変換
   * @see https://stackoverflow.com/a/9493060
   *
   * @param h 0 ~ 1
   * @param s 0 ~ 1
   * @param l 0 ~ 1
   */
  static hslToRgb(h: number, s: number, l: number): ColorCodeTupple {
    let r, g, b;
    if (s === 0) {
      // 白黒
      r = g = b = l;
    } else {
      const q = l < half ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + oneThird);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - oneThird);
    }
    return [r, g, b];
  }

  /**
   * RGB数値（10進数, 0 ~ 255）からインスタンス生成
   * @see https://stackoverflow.com/a/9493060
   *
   * @param r Normalized to 0 ~ 255
   * @param g Normalized to 0 ~ 255
   * @param b Normalized to 0 ~ 255
   * @returns HslColorHelper instance
   */
  static fromRgb(r: number, g: number, b: number): HslColorHelper {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
        default:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return new HslColorHelper(h, s, l);
  }

  /**
   * RGB文字列をパースし、[r, g, b]型の数値（10進数）配列を返す
   * ハッシュ（"#"）つきでもOK
   *
   * @example
   * HslColorHelper.parseRgbString("#ff00fe"); // [255, 0, 254]
   *
   * @param rgbStr
   * @returns HslColorHelper instance
   */
  static parseRgbString(rgbStr: string): ColorCodeTupple {
    if (rgbStr[0] === "#") rgbStr = rgbStr.slice(1);
    const res: ColorCodeTupple = [0, 0, 0];
    for (let i = 0; i < res.length; i++) {
      const j = i * 2;
      const v = rgbStr.slice(j, j + 2);
      res[i] = parseInt(v, 16);
    }
    return res;
  }

  /**
   * RGB文字列からインスタンス生成
   *
   * @example
   * const color = HslColorHelper.fromRgbString("ff0000")
   * console.log(color.h === 0); // Red
   *
   * @param rgbStr
   * @returns HslColorHelper instance
   */
  static fromRgbString(rgbStr: string): HslColorHelper {
    return HslColorHelper.fromRgb(...HslColorHelper.parseRgbString(rgbStr));
  }

  /**
   * RGB数値(10進数)からインスタンス生成
   *
   * @example
   * const color = HslColorHelper.fromRgbHex(16777215); // #ffffff
   * console.log(color.l === 1);
   *
   * @param rgbStr
   * @returns HslColorHelper instance
   */
  static fromRgbHex(rgbHex: number): HslColorHelper {
    return HslColorHelper.fromRgb(
      ...HslColorHelper.parseRgbString(rgbHex.toString(16))
    );
  }

  /**
   * Convert hue value from degree(0 ~ 360) to 0 ~ 0.1
   *
   * @param v
   */
  static normalizeHue(v: number) {
    return v / 360;
  }
}
