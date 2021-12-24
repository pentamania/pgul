/**
 * Returns grid rect data by evenly slicing
 * width/height with specified column-num/row-num
 *
 * @param fullWidth
 * @param fullHeight
 * @param col
 * @param row
 * @returns Rect data
 */
export default function (
  fullWidth: number,
  fullHeight: number,
  col: number,
  row: number
) {
  const gridWidth = fullWidth / col;
  const gridHeight = fullHeight / row;
  const slices = [];
  for (let ri = 0; ri < row; ri++) {
    const y = gridHeight * ri;
    for (let ci = 0; ci < col; ci++) {
      const x = gridWidth * ci;
      slices.push({
        col: ci,
        row: ri,
        x,
        y,
        width: gridWidth,
        height: gridHeight,
      });
    }
  }
  return slices;
}
