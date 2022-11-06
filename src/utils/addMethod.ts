/**
 * thisの型参照を残しながら任意のメソッドを拡張する
 * `Foo.prototype[methodName] = function (){...}`とほぼ同等
 *
 * @param obj
 * @param prop
 * @param methodFunc
 */
export function addMethod<T>(
  obj: T,
  prop: string,
  methodFunc: (this: T, ...args: any) => any
) {
  Object.defineProperty(obj, prop, {
    value: methodFunc,
    enumerable: false,
    writable: true,
  });
}
