/**
 * 指定オブジェクトのキーから
 * {key: "key"} の文字列Enum風ハッシュマップオブジェクトを作成
 * stringToEnum（https://typescript-jp.gitbook.io/deep-dive/type-system/literal-types#bsuno）の発展形
 *
 * @example
 * const obj = {"name": "pentamania", "age": 5};
 * const Keys = keysToEnum(obj)
 * console.log(Keys.name) // "name"
 *
 * @param o
 */
export default function objectKeysToEnum<
  T extends Record<string | number, any>
>(o: T): { [K in keyof T]: K } {
  return Object.keys(o).reduce((accumulator, currentValue) => {
    accumulator[currentValue] = currentValue;
    return accumulator;
  }, Object.create(null));
}
