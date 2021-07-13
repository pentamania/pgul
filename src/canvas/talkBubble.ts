////////////////
// HTML5 canvasを使って吹き出しを描画
////////////////

import { CanvasStyle } from "./common";

const PI = Math.PI;
const PI_H = Math.PI * 0.5;

type Direction = "top" | "right" | "bottom" | "left";

/**
 * 吹き出し💭パスを設定
 *
 * @caveats
 * This method is experimetal. Parameters may be changed.
 *
 * @example
 * const canvas = document.createElement("canvas");
 * const ctx = canvas.getContext("2d");
 * ctx.beginPath();
 * talkBubble.call(ctx, 10, 10, 100, 80, 5));
 * ctx.closePath();
 * ctx.stroke();
 *
 * @param x ふきだし矩形始点x（左、しっぽ部分は考慮せず）
 * @param y ふきだし矩形始点y（上、しっぽ部分は考慮せず）
 * @param width ふきだし矩形幅（しっぽ部分は考慮せず）
 * @param height ふきだし矩形高さ（しっぽ部分は考慮せず）
 * @param cornerRadius ふきだし矩形角丸半径
 * @param tailDirection ふきだししっぽの方向
 * @param tailBasePoint しっぽの位置。幅/高さに対する比率で指定。0.5なら中心、通常0 ~ 1.0以内で指定
 * @param tailBottomSize しっぽ底辺長さ：未指定の場合はwidthもしくはheightのサイズに準拠（どちらに合わせるかはdirectionによる）
 * @param tailLength しっぽのふきだしからの飛び出し距離 : 未指定の場合は底辺長さに合わせる
 * @param tailEndOffset しっぽ先端の基点からのズレ
 */
export function talkBubble(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius: number,
  tailDirection: Direction = "top",
  tailBasePoint: number = 0.5,
  tailBottomSize?: number,
  tailLength?: number,
  tailEndOffset: number = 0
) {
  const ctx = this;
  const left = x;
  const top = y;
  const right = x + width;
  const bottom = y + height;
  const rad = cornerRadius;
  const tipPosRatio = Math.min(1, Math.max(0, tailBasePoint));
  tailBottomSize =
    tailBottomSize ||
    (tailDirection === "top" || tailDirection === "bottom"
      ? width * 0.2
      : height * 0.2);

  const tipCenter =
    tailDirection === "right" || tailDirection === "left"
      ? top + height * tipPosRatio // y軸上
      : left + width * tipPosRatio; // x軸上
  const tipSizeHalf = tailBottomSize * 0.5;
  const tipOffset = tailLength || tailBottomSize;

  let tipX, tipY;
  switch (tailDirection) {
    case "right":
      tipX = right + tipOffset;
      tipY = tipCenter + tailEndOffset;

      ctx.arc(left + rad, top + rad, rad, -PI, -PI_H, false); // 左上
      ctx.arc(right - rad, top + rad, rad, -PI_H, 0, false); // 右上
      ctx.lineTo(right, tipCenter - tipSizeHalf);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(right, tipCenter + tipSizeHalf);
      ctx.arc(right - rad, bottom - rad, rad, 0, PI_H, false); // 右下
      ctx.arc(left + rad, bottom - rad, rad, PI_H, PI, false); // 左下
      break;

    case "left":
      tipX = left - tipOffset;
      tipY = tipCenter + tailEndOffset;

      ctx.arc(left + rad, top + rad, rad, -PI, -PI_H, false); // 左上
      ctx.arc(right - rad, top + rad, rad, -PI_H, 0, false); // 右上
      ctx.arc(right - rad, bottom - rad, rad, 0, PI_H, false); // 右下
      ctx.arc(left + rad, bottom - rad, rad, PI_H, PI, false); // 左下
      ctx.lineTo(left, tipCenter + tipSizeHalf);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(left, tipCenter - tipSizeHalf);
      break;

    case "bottom":
      tipX = tipCenter + tailEndOffset;
      tipY = bottom + tipOffset;

      ctx.arc(left + rad, top + rad, rad, -PI, -PI_H, false); // 左上
      ctx.arc(right - rad, top + rad, rad, -PI_H, 0, false); // 右上
      ctx.arc(right - rad, bottom - rad, rad, 0, PI_H, false); // 右下
      ctx.lineTo(tipCenter + tipSizeHalf, bottom);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipCenter - tipSizeHalf, bottom);
      ctx.arc(left + rad, bottom - rad, rad, PI_H, PI, false); // 左下
      break;

    // case "top":
    default:
      tipX = tipCenter + tailEndOffset;
      tipY = top - tipOffset;

      ctx.arc(left + rad, top + rad, rad, -PI, -PI_H, false); // 左上
      ctx.lineTo(tipCenter - tipSizeHalf, top);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipCenter + tipSizeHalf, top);
      ctx.arc(right - rad, top + rad, rad, -PI_H, 0, false); // 右上
      ctx.arc(right - rad, bottom - rad, rad, 0, PI_H, false); // 右下
      ctx.arc(left + rad, bottom - rad, rad, PI_H, PI, false); // 左下
      break;
  }
}

export interface TalkBubbleImageOption {
  width: number;
  height: number;
  cornerRadius: number;
  tailDirection?: Direction;
  tailBasePoint?: number;
  tailBottomSize?: number;
  tailLength?: number;
  tailEndOffset?: number;
  padding?: number;
  fill?: CanvasStyle;
  stroke?: CanvasStyle;
  lineWidth?: number;
}

/**
 * WIP
 */
const TalkBubbleImageDefaultOption: Required<TalkBubbleImageOption> = {
  width: 128,
  height: 64,
  cornerRadius: 8,
  tailDirection: "bottom",
  tailBasePoint: 0.5,
  tailBottomSize: 0,
  tailLength: 16,
  tailEndOffset: 0,
  padding: 0,
  fill: "white",
  stroke: "gray",
  lineWidth: 2,
};

/**
 * 吹き出し💭描画済みcanvasを返す
 * @param options
 * @param canvas
 */
export function createTalkBubbleImage(
  options: TalkBubbleImageOption = Object.create(null),
  canvas: HTMLCanvasElement = document.createElement("canvas")
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // TODO: message only in dev mode
    console.warn("[pgul]: Failed getting context2D of specified canvas");
    return canvas;
  }
  const opt = Object.assign({}, TalkBubbleImageDefaultOption, options);
  const lineWidth = opt.lineWidth || ctx.lineWidth;
  const taillength = opt.tailLength;

  const basePadding = lineWidth / 2 + opt.padding;
  let left = basePadding;
  let top = basePadding;
  let fullWidth = opt.width + lineWidth + opt.padding * 2;
  let fullHeight = opt.height + lineWidth + opt.padding * 2;
  switch (opt.tailDirection) {
    // 左右軸
    case "left":
      left += taillength;
    case "right":
      fullWidth += taillength;
      break;

    // 上下軸
    case "top":
      top += taillength;
    case "bottom":
      fullHeight += taillength;
      break;
  }

  // canvasサイズ設定: コンテキストの設定はリセットされることに留意
  canvas.width = fullWidth;
  canvas.height = fullHeight;

  // コンテキストパラメータ設定
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = opt.fill;
  ctx.strokeStyle = opt.stroke;

  // Draw
  ctx.beginPath();
  talkBubble.call(
    ctx,
    left,
    top,
    opt.width,
    opt.height,
    opt.cornerRadius,
    opt.tailDirection,
    opt.tailBasePoint,
    opt.tailBottomSize,
    opt.tailLength,
    opt.tailEndOffset
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return canvas;
}
