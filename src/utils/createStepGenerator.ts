type CallbackWithCtx<C> = (this: C, count: number) => any;

/**
 * next処理ごとにコールバック関数を実行するGeneratorを生成
 *
 * @example
 * const gen = createStepGenerator((cnt)=> {
 *   console.log("cnt:", cnt);
 * }, 2);
 * gen.next() // "cnt:0"
 * get.next() // "cnt:1"
 * get.next() // no log...
 *
 * @param cb
 * @param duration
 * @param context optional
 */
export function createStepGenerator<C = any>(
  cb: CallbackWithCtx<C>,
  duration: number,
  context: C | null = null
): Generator<number> {
  return (function* () {
    let _count = 0;
    while (_count < duration) {
      // context指定なしの場合、cb.call(null, _count)となり、
      // 通常の関数呼び出しと同等となる
      cb.call(context as C, _count); // `as C`はTSエラー対策
      yield _count++;
    }
  })();
}
