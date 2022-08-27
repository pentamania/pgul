/**
 * [en]
 * DESC
 *
 * [jp]
 * Promiseが完了(finallyで判定)するまで空yieldを繰り返すGeneratorを返す
 *
 * @param promise Promise
 * @returns Generator
 */
export function convertPromiseToGenerator(promise: Promise<any>): Generator {
  let _comp: boolean = false;
  promise.finally(() => (_comp = true));
  return (function* () {
    while (!_comp) {
      yield;
    }
  })();
}
