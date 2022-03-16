/**
 * Font data
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties#font_properties
 * - fontFamily, fontSize must be included
 */
export interface FontData {
  fontFamily: string;
  fontSize: string | number;
  fontStyle?: string; // "normal" "italic", "oblique", etc.
  fontVariant?: string;
  fontWeight?: string | number;
  fontStretch?: string;
  lineHeight?: number;
}

/**
 * [en] Convert FontData to CSS font property string
 *
 * [jp] FontDataをCSS文字列に変換
 *
 * @param data
 * @returns CSS font property string
 */
export function convertFontDataToCssProp(data: FontData): string {
  let fontSizeStr: string =
    data.fontSize != null
      ? typeof data.fontSize === "string"
        ? data.fontSize
        : `${data.fontSize}px`
      : "";

  // line-height must immediately follow font-size, preceded by "/", like this: "16px/3"
  if (data.lineHeight) {
    fontSizeStr += `/${data.lineHeight}`;
  }

  return [
    // Note: font-style, font-variant and font-weight must precede font-size
    data.fontStyle || "",
    data.fontVariant || "",
    data.fontWeight || "",
    fontSizeStr,
    data.fontStretch || "",
    data.fontFamily, // Must be last
  ]
    .join(" ")
    .trim();
}
