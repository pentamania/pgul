const lineStartProhibitedLetters = [
  // 句読点
  "、",
  ",",
  "。",
  ".",

  // 役物
  "！",
  "!",
  "？",
  "?",
  "⁈",
  "⁉",
  "‼",

  // 括弧閉じ
  ")",
  "）",
  // TODO: add
];

/**
 * WIP
 * 行頭禁止文字かどうか
 * 禁則処理用
 * @see https://ja.wikipedia.org/wiki/%E7%A6%81%E5%89%87%E5%87%A6%E7%90%86
 *
 * @param v
 * @returns
 */
export function isLineStartProhibitedLetter(v: string) {
  return lineStartProhibitedLetters.includes(v);
}
