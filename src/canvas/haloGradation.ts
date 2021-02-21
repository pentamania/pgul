function rgba(r: number, g: number, b: number, a: number = 1.0) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hsla(h: number, s: number, l: number, a: number = 1.0) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

const DEFAULT_HALO_WIDTH_RATIO_AGAINST_RADIUS = 0.45;

/**
 * 共通処理
 * グラデーションは座標[0,0]が起点になってしまうことに留意
 * @param ctx
 * @param radius 輪っか基本半径。グラデーション全体の半径は+haloWidth/2されることに注意
 * @param haloWidth 輪っかの幅。radiusの0.4 ~ 0.5ぐらいを指定するといい感じ
 * @param colorStops
 */
function _createGradation(
  ctx: CanvasRenderingContext2D,
  radius: number,
  haloWidth: number = radius * DEFAULT_HALO_WIDTH_RATIO_AGAINST_RADIUS,
  ...colorStops: string[]
) {
  const strokeHalf = haloWidth * 0.5;
  const fullRadius = radius + strokeHalf;
  const colorStopUnit = strokeHalf / fullRadius;

  const g = ctx.createRadialGradient(0, 0, fullRadius, 0, 0, 0);
  colorStops.forEach((color, i) => {
    g.addColorStop(colorStopUnit * i, color);
  });
  return g;
}

/**
 * WIP
 * @param radius
 * @param haloWidth
 * @param r
 * @param g
 * @param b
 */
export function createHaloGradationFromRGB(
  this: CanvasRenderingContext2D,
  radius: number,
  haloWidth?: number,
  r: number = 255,
  g: number = 0,
  b: number = 0
): CanvasGradient {
  return _createGradation(
    this,
    radius,
    haloWidth,
    rgba(r, g, b, 0),
    rgba(r, g, b, 1),
    rgba(r, g, b, 0)
  );
}

/**
 * HSLから輪っかグラデーション作成
 * mock: https://runstant.com/pentamania/projects/ed04e522
 *
 * @example
 * const params = [64, 32, 120]; // [rad, haloWidth, hue]
 * const grad = createHaloGradationFromHSL.call(ctx, ...params);
 * ctx.fillStyle = grad;
 *
 * @param radius
 * @param haloWidth
 * @param h
 * @param s
 * @param l
 */
export function createHaloGradationFromHSL(
  this: CanvasRenderingContext2D,
  radius: number,
  haloWidth?: number,
  h: number = 0,
  s: number = 100,
  l: number = 50
): CanvasGradient {
  return _createGradation(
    this,
    radius,
    haloWidth,
    hsla(h, s, l, 0),
    hsla(h, s, l, 1),
    hsla(h, s, l, 0)
  );
}

export interface CreateHaloImageParam {
  radius: number;
  haloWidth: number;
  hue?: number;
  sat?: number;
  lit?: number;
  // r?: number;
  // g?: number;
  // b?: number;
}

/**
 * 輪っかイメージを返す
 * 色指定が無い場合は赤色になる
 * @param params
 * @param canvas
 */
export function createHaloImage(
  params: CreateHaloImageParam,
  canvas?: HTMLCanvasElement
) {
  if (!canvas) {
    // canvas指定が無い場合、canvasを生成して適当にリサイズ
    // -> 逆に指定した場合、特にリサイズはしない
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = params.radius * 2;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.translate(params.radius, params.radius);
  ctx.fillStyle = createHaloGradationFromHSL.call(
    ctx,
    params.radius,
    params.haloWidth,
    params.hue,
    params.sat,
    params.lit
  );
  ctx.beginPath();
  ctx.arc(0, 0, params.radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  return canvas;
}
