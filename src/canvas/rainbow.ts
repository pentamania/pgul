interface RainbowRenderOptions {
  readonly radius: number;
  readonly bandWidth: number;
  readonly hueInterval?: number;
  readonly startHue?: number;
  readonly endHue?: number;
  // readonly startAngle?: number;
  readonly endAngle?: number;
  readonly counterclockwise?: boolean | undefined;
}

const defaultParams: Required<RainbowRenderOptions> = {
  radius: 64,
  bandWidth: 12,
  hueInterval: 30,
  startHue: 0,
  endHue: 270,
  // startAngle: 0,
  endAngle: Math.PI,
  counterclockwise: true,
};

/**
 *
 * [en]
 * Render rainbow
 *
 * [jp]
 * 虹を描画
 *
 * 引数は仮
 * @param x
 * @param y
 * @param radius
 * @param bandWidth
 * @param hueInterval
 * @param startHue
 * @param endHue
 * @param startAngle
 * @param endAngle
 * @param counterclockwise
 * @param sat temp
 * @param lit temp
 * @param alpha temp
 */
export function drawRainbow(
  this: CanvasRenderingContext2D,

  x: number,
  y: number,
  radius: number,
  bandWidth: number,

  // color
  hueInterval = defaultParams.hueInterval,
  startHue = defaultParams.startHue,
  endHue = defaultParams.endHue,

  // arc angle
  startAngle = 0,
  endAngle = defaultParams.endAngle,
  counterclockwise = defaultParams.counterclockwise,

  // color-misc (tmp)
  sat = 50,
  lit = 50,
  alpha = 1.0
) {
  const ctx = this;
  const hueRange = endHue - startHue;
  if (hueRange <= 0)
    console.warn(
      "[pgul:drawRainbow] Delta of endHue - startHue should be positive."
    );

  const steps = hueRange / hueInterval;
  if (steps < 1) {
    console.warn(
      "[pgul:drawRainbow] Range of hue should be larger than hueInterval."
    );
  }
  const lnWidth = bandWidth / steps;

  // Draw
  let _currentRad = radius - bandWidth;
  ctx.lineWidth = lnWidth;
  for (let h = startHue; h <= endHue; h += hueInterval) {
    ctx.strokeStyle = `hsla(${h}, ${sat}%, ${lit}%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, _currentRad, startAngle, endAngle, counterclockwise);
    ctx.stroke();

    _currentRad += lnWidth;
  }
}

/**
 * WIP
 *
 *
 * @param options
 * @param canvas
 * @returns Rainbow drawed canvas
 */
export function createRainbowImage(
  options: RainbowRenderOptions,
  canvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const optionFulfilled = { options, ...defaultParams };

  const rad = optionFulfilled.radius;
  if (!canvas) {
    // canvas指定が無い場合、canvasを生成して適当にリサイズ
    // -> 逆に指定した場合、特にリサイズはしない
    // FIXME 円arc範囲でサイズが変わるが、今は固定なのをどうにかする（90度なら1/4にするなど）
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = rad * 2;
  }

  // Draw
  const ctx = canvas.getContext("2d")!;
  drawRainbow.call(
    ctx,
    rad,
    rad,
    rad,
    optionFulfilled.bandWidth,
    optionFulfilled.hueInterval,
    optionFulfilled.startHue,
    optionFulfilled.endHue,
    0,
    optionFulfilled.endAngle,
    optionFulfilled.counterclockwise
  );

  return canvas;
}
