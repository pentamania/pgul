import { isLineStartProhibitedLetter } from "./textRules";

function splitLineByLetterNum(
  textLine: string,
  letterNum: number,
  arrayRef: string[] = []
) {
  if (textLine.length >= letterNum) {
    for (let i = 0; i < textLine.length; i += letterNum) {
      let textNum = letterNum;
      const start = i;
      // 行頭禁則文字はぶら下げる
      // FIXME: 一文字だけを想定、複数続く場合の処理必要
      if (isLineStartProhibitedLetter(textLine[i + textNum])) {
        textNum += 1;
        i += 1;
      }
      arrayRef.push(textLine.substring(start, start + textNum));
    }
  } else {
    // No limit exceeding
    arrayRef.push(textLine);
  }
  return arrayRef;
}

/**
 * 指定文字数毎に文字列を分割
 *
 * 簡易的な禁則処理も行う（WIP）
 *
 * @example
 * // TODO
 *
 * @param str If LF code `\n` exists, it will also be split there
 * @param limitLetterNum
 * @param ignoreLf set `true` to ignore `\n` in str
 * @returns String line array
 */
export default function (
  str: string,
  limitLetterNum: number,
  ignoreLf: boolean = false
): string[] {
  if (ignoreLf) {
    return splitLineByLetterNum(str, limitLetterNum);
  } else {
    const lines: string[] = [];
    str.split("\n").forEach((line) => {
      splitLineByLetterNum(line, limitLetterNum, lines);
    });
    return lines;
  }
}
