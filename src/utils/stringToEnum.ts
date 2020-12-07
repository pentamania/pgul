/**
 * 文字列配列から文字列Enumもどきを生成する
 * つまりenum Hoge { Foo = "Foo" } のようなものを作る
 * @see https://typescript-jp.gitbook.io/deep-dive/type-system/literal-types#bsuno
 * @param o
 */
export default function stringToEnum<T extends string>(
  o: T[]
): { [K in T]: K } {
  return o.reduce((accumulator, currentValue) => {
    accumulator[currentValue] = currentValue;
    return accumulator;
  }, Object.create(null));
}
