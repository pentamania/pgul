export interface PixelData {
  r: number;
  g: number;
  b: number;
  a: number;
  col: number;
  row: number;
}

/**
 * canvasの各ピクセル毎にコールバック関数を実行
 * CORS制約によりgetImageDataに失敗することもあることに留意
 *
 * TODO: 第三引数でoption指定できるようにする？
 *
 * @example
 * const canvas = document.createElement("canvas");
 * canvas.width = canvas.height = 4;
 * const ctx = canvas.getContext("2d");
 * ctx.fillStyle = "red";
 * ctx.fillRect(0, 0, 2, 2);
 * pixelForEach.call(ctx, (pxData)=> {
 *   // Do something with 4x4=16 pixels for each
 * })
 *
 * @param cb
 */
export function pixelForEach(
  this: CanvasRenderingContext2D,
  cb: (pixelData: PixelData, pixelIndex: number) => any
) {
  const w = this.canvas.width;
  const h = this.canvas.height;

  const imageData = this.getImageData(0, 0, w, h);
  const data = imageData.data;
  const len = imageData.data.length;
  for (let i = 0; i < len; i += 4) {
    const pixelIndex = i / 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const col = pixelIndex % w;
    const row = Math.floor(pixelIndex / w); // heightは関係ない
    cb(
      {
        r,
        g,
        b,
        a,
        col,
        row,
      },
      pixelIndex
    );
  }
}

/**
 * pixelをすべて取得
 * @param canvasOrContext
 */
export function getPixels(
  canvasOrContext: HTMLCanvasElement | CanvasRenderingContext2D
): PixelData[] {
  const ctx =
    canvasOrContext instanceof HTMLCanvasElement
      ? canvasOrContext.getContext("2d")!
      : canvasOrContext;

  const pixels: PixelData[] = [];
  pixelForEach.call(ctx, (data) => {
    pixels.push(data);
  });
  return pixels;
}
