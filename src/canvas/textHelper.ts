import { convertFontDataToCssProp, FontData } from "../css/fontDataConverter";
import { isLineStartProhibitedLetter } from "../utils/textRules";
import { builtInDefaultFontPropValue, SharedContext } from "./common";

/**
 * [en]
 * Split text to draw text within specifed width
 * using CanvasRenderingContext2D.measureText
 *
 * [jp]
 * CanvasRenderingContext2D.measureTextを使って指定幅に収まるよう、文字列を分割
 * context拡張にも使える
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * ctx.font = "20px Meirio";
 * splitTextByMetricWidth.call(ctx, "foobar", 50)
 *
 * @param text
 * @param borderWidth
 * @param applyKinsoku Apply text rules for East Asian language
 * @returns Separated lines
 */
export function splitTextByMetricWidth(
  this: CanvasRenderingContext2D,
  text: string,
  borderWidth: number,
  applyKinsoku: boolean = true
): string[] {
  const lines: string[] = [];
  // サロゲートペア文字列も考慮してArray.from使用
  const lettersLeft = Array.from(text);

  let _currentStr = "";
  while (lettersLeft.length) {
    const currentLetter = lettersLeft.shift()!;
    const metric = this.measureText(_currentStr + currentLetter);
    // 行頭禁則処理
    const isKinsoku = applyKinsoku
      ? isLineStartProhibitedLetter(currentLetter)
      : false;
    if (!isKinsoku && borderWidth < metric.width) {
      // Break line
      lines.push(_currentStr);
      _currentStr = "";
    }
    _currentStr += currentLetter;
  }
  lines.push(_currentStr);

  return lines;
}

/**
 * [en]
 * Split text to draw text within specifed width.
 *
 * [jp]
 * 文字を指定幅に描画できる範囲に収まるよう、文字列を分割
 *
 * @example
 * splitTextByWidth("foobarbaz", 20, "20px Meirio", false)
 *
 * @param text
 * @param borderWidth
 * @param font css font or FontData
 * @param applyKinsoku Apply text rules for East Asian language
 * @returns lines
 */
export function splitTextByWidth(
  text: string,
  borderWidth: number,
  font: string | FontData = builtInDefaultFontPropValue,
  applyKinsoku: boolean = true
): string[] {
  // Set context font
  const context = SharedContext;
  const fontDataString =
    typeof font === "string" ? font : convertFontDataToCssProp(font);
  context.font = fontDataString;

  return splitTextByMetricWidth.call(context, text, borderWidth, applyKinsoku);
}

/**
 * EXPERIMENTAL
 *
 * [en]
 * Calculate text number drawable within specified width.
 *
 * [jp]
 * 指定幅に描画できる最大文字数を計算
 *
 * @param testString String(Letter) used to calculate
 * @param limitWidth Line width to check
 * @param font Font data: @see https://developer.mozilla.org/en-US/docs/Web/CSS/font
 * @returns letter num
 */
export function calcMaxTextNumFromWidth(
  testString: string,
  limitWidth: number,
  font: string | FontData = builtInDefaultFontPropValue
): number {
  const context = SharedContext;
  const fontDataString =
    typeof font === "string" ? font : convertFontDataToCssProp(font);
  context.font = fontDataString;

  const metric = context.measureText(testString);
  return Math.floor(limitWidth / metric.width);
}
