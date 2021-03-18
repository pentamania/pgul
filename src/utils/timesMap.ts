/**
 * 指定回数分、戻り値を返すコールバック関数を実行し、その結果を配列で返す
 * （RubyのtimesとArray.mapを組み合わせたような挙動）
 *
 * @example
 * // Itemインスタンスを16個持った配列を生成
 * const itemArray = timesMap(16, (i)=> new Item({id: i});)
 *
 * @param num 処理回数
 * @param cb
 */
export default function timesMap<T = any>(
  num: number,
  cb: (i: number, n: number) => T
): T[] {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(cb(i, num));
  }
  return arr;
}
