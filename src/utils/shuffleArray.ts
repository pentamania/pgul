/**
 * Shuffles array element order.
 *
 * @param array Target array. This will be modified (is not cloned).
 * @param randomGenerator Func that returns number of 0 ~ 1 [Default is Math.random]
 * @returns Shuffled array ref (not clone)
 */
export default function shuffle(
  array: any[],
  randomGenerator: () => number = Math.random
) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(randomGenerator() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }

  return array;
}
