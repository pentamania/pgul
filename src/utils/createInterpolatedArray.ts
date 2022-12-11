/**
 * 与えられた引数値（整数）の間を整数で補間した配列を返す
 *
 * @example
 * createInterpolatedArray(1, 3, 5) // => [1, 2, 3, 4, 5]
 * createInterpolatedArray(0, 2, -1) // => [0, 1, 2, 1, 0, -1]
 * createInterpolatedArray(0, 2, 2) // => [0, 1, 2]
 *
 * @param milestones
 */
export function createInterpolatedArray(...milestones: number[]): number[] {
  return milestones.reduce<number[]>((acc, cur, i) => {
    // is last stone
    if (i === milestones.length - 1) {
      acc.push(cur);
      return acc;
    }

    const nextStone: number | undefined = milestones[i + 1];

    // 次マイルストーン値が無い or 現在値と一緒ならスキップ
    if (nextStone == null || cur === nextStone) return acc;

    if (cur < nextStone) {
      // 正側step
      for (let j = cur; j < nextStone; j++) {
        acc.push(j);
      }
    } else {
      // 負側step
      for (let j = cur; nextStone < j; j--) {
        acc.push(j);
      }
    }

    return acc;
  }, []);
}
