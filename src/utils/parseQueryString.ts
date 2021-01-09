/**
 *文字列をnumber変換できるか試す。失敗したらそのまま文字列返す
 * @param v
 */
function _tryNumberConversion(v: string): string | number {
  const n = Number(v);
  return !isNaN(n) ? n : v;
}

/**
 * 文字列をboolean変換できるか試す。失敗したらそのまま文字列返す
 * ケースインセンシティブなので'trUe', 'FALSE'などの大文字交じりでも有効
 * @param v
 */
function _tryBooleanConversion(v: string): string | boolean {
  const t = v.toLowerCase();
  if (t === "true" || t === "false") {
    return t == "true";
  } else {
    return v;
  }

  // 以下はシンプルだが、JSON.parseが成功しちゃう可能性がある？
  // try {
  //   return JSON.parse(v.toLowerCase());
  // } catch {
  //   return v;
  // }
}

/**
 * 文字列のデコードおよび型変換を行う
 * @param encodedString
 */
function decodeValue(encodedString: string): string | number | boolean {
  let decoded: any;
  decoded = decodeURIComponent(encodedString);

  // Is it boolean?
  decoded = _tryBooleanConversion(decoded);
  if (typeof decoded === "boolean") {
    return decoded;
  }

  // Is it number?
  decoded = _tryNumberConversion(decoded);
  return decoded;
}

/**
 * クエリストリングをパース
 * @param str テスト用、通常は指定しない
 */
export default function parse(str?: string): { [k: string]: any } {
  const paramString = str || window.location.search.substr(1);
  const result: { [k: string]: any } = Object.create(null);
  return paramString.split("&").reduce((obj, v) => {
    const pair = v.split("=") as [string, string];
    obj[pair[0]] = decodeValue(pair[1]);
    return obj;
  }, result);
}
