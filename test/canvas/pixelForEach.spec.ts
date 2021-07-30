/** @jest-environment jsdom */
import { PixelData, pixelForEach } from "../../src/canvas/pixelEach";

function createCanvasSet() {
  const cvs = document.createElement("canvas");
  return {
    canvas: cvs,
    ctx: cvs.getContext("2d")!,
  };
}
const RED = { r: 255, g: 0, b: 0, a: 255 };
const NONE = { r: 0, g: 0, b: 0, a: 0 };

describe("canvas/pixelForEach", () => {
  test("Scan 4x4 canvas to get proper pixelData", () => {
    const SIZE = 4;
    const expected = [
      // row 0
      { ...RED, col: 0, row: 0 },
      { ...RED, col: 1, row: 0 },
      { ...NONE, col: 2, row: 0 },
      { ...NONE, col: 3, row: 0 },
      // row 1
      { ...RED, col: 0, row: 1 },
      { ...RED, col: 1, row: 1 },
      { ...NONE, col: 2, row: 1 },
      { ...NONE, col: 3, row: 1 },
      // row 2
      { ...NONE, col: 0, row: 2 },
      { ...NONE, col: 1, row: 2 },
      { ...NONE, col: 2, row: 2 },
      { ...NONE, col: 3, row: 2 },
      // row 3
      { ...NONE, col: 0, row: 3 },
      { ...NONE, col: 1, row: 3 },
      { ...NONE, col: 2, row: 3 },
      { ...NONE, col: 3, row: 3 },
    ];
    const result: PixelData[] = [];

    // Setup 4x4 canvas
    const { canvas, ctx } = createCanvasSet();
    canvas.width = canvas.height = SIZE;

    // Draw 2x2 red rect from top-left
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 2, 2);

    // Push pixel data of the canvas
    pixelForEach.call(ctx, (px: PixelData) => {
      result.push(px);
    });

    expect(result).toEqual(expected);
  });
});
