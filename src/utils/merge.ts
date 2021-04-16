/**
 * 指定オブジェクトを新規オブジェクトに統合
 * @param args
 */
export default function merge(...args: any[]) {
  return Object.assign({}, ...args);
}
