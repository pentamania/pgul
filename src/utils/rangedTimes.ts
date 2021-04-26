/**
 * 指定回数分、コールバック関数を実行
 * コールバックでrangeに応じた分割数を渡す
 *
 * @example
 * // TODO
 *
 * @param num 処理回数
 * @param cb 引数は仮、変更するかも？
 */
export default function <T = any>(
  num: number,
  cb: (currentVal: number, unitVal: number, index: number, num: number) => T,
  range: number = 0
) {
  const unit = range / num;
  for (let i = 0; i < num; i++) {
    cb(unit * i, unit, i, num);
  }
}
