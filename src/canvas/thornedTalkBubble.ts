/**
 * [en]
 * Canvas 2D API extension to add a thorned talk bubble to the current path
 *
 * [jp]
 * トゲ付きフキダシのパスを描画するCanvas2D API拡張
 *
 * @example
 * const ctx = canvas.getContext("2d")
 * ctx.beginPath();
 * pgul.canvasHelper.thornedTalkBubble.call(ctx, 10, 10, 100, 80, 12, 14, 8 ,12);
 * ctx.closePath();
 *
 * @param x The x-axis coordinate of the bubble's starting point
 * @param y The y-axis coordinate of the bubble's starting point
 * @param width The width of bubble (including thorns)
 * @param height The height of bubble (including thorns)
 * @param verticalThornInterval The interval of vertical thorn
 * @param sideThornInterval The interval of side/horizontal thorn
 * @param verticalThornSize The size of vertical thorn
 * @param sideThornSize The size of side/horizontal thorn
 */
export function thornedTalkBubble(
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  verticalThornInterval: number,
  sideThornInterval: number,
  verticalThornSize: number,
  sideThornSize: number
) {
  const ctx = this;

  // 上下面
  const vertThornInterval = verticalThornInterval;
  const vertThornHeight = verticalThornSize || verticalThornInterval * 0.5;

  // 側面
  const sideThornWidth = sideThornSize || sideThornInterval * 2;
  const cps = [];
  const cpsRev = [];

  // 角用の設定
  const cornerGapX = sideThornWidth * 0.6;
  const cornerGapY = vertThornHeight * 1.6;

  // サイズ調整用
  const sideThornMax = Math.max(sideThornWidth, cornerGapX);
  const vertThornMax = Math.max(vertThornHeight, cornerGapY);

  const bubbleWidth = width - sideThornMax * 2;
  const bubbleHeight = height - vertThornMax * 2;
  const thornNum = (bubbleWidth / vertThornInterval) | 0;
  const cpNum = (bubbleHeight / sideThornInterval) | 0;
  const l = x + sideThornMax;
  const r = x + width - sideThornMax;
  const t = y + vertThornMax;
  const b = y + height - vertThornMax;

  // 制御点
  for (let i = 0; i < cpNum; i++) {
    cps.push({ x: r, y: t + sideThornInterval * (i + 0.5) }); // 右側用
    cpsRev.push({ x: l, y: b - sideThornInterval * (i + 0.5) });
  }

  // 上辺
  ctx.moveTo(l, t);
  for (let i = 0; i < thornNum; i++) {
    const sx = l + i * vertThornInterval;
    ctx.lineTo(sx + vertThornInterval * 0.25, t);
    ctx.lineTo(sx + vertThornInterval * 0.25 * 2, t - vertThornHeight);
    ctx.lineTo(sx + vertThornInterval * 0.25 * 3, t);
    if (i !== thornNum - 1) ctx.lineTo(sx + vertThornInterval, t);
  }

  // 右辺
  ctx.quadraticCurveTo(r, t, r + cornerGapX, t - cornerGapY); //上
  for (let i = 0, len = cps.length; i < len; i++) {
    // 二段目以降
    if (i % 2 === 0) {
      ctx.quadraticCurveTo(
        cps[i].x,
        cps[i].y,
        r + sideThornWidth * 0.8,
        t + (i + 1) * sideThornInterval
      );
    } else {
      ctx.quadraticCurveTo(
        cps[i].x,
        cps[i].y,
        r + sideThornWidth,
        t + (i + 1) * sideThornInterval
      );
    }
  }

  // 下辺
  ctx.quadraticCurveTo(r, b, r + cornerGapX, b + cornerGapY); //下
  for (let i = thornNum - 1; 0 <= i; i--) {
    const sx = l + i * vertThornInterval;
    ctx.lineTo(sx + vertThornInterval * 0.25 * 3, b);
    ctx.lineTo(sx + vertThornInterval * 0.25 * 2, b + vertThornHeight);
    ctx.lineTo(sx + vertThornInterval * 0.25, b);
  }

  // 左辺
  ctx.quadraticCurveTo(l, b, l - cornerGapX, b + cornerGapY); //下
  // 二段目以降
  for (let i = 0, len = cpsRev.length; i < len; i++) {
    if (i % 2 === 0) {
      ctx.quadraticCurveTo(
        cpsRev[i].x,
        cpsRev[i].y,
        l - sideThornWidth * 0.8,
        b - (i + 1) * sideThornInterval
      );
    } else {
      ctx.quadraticCurveTo(
        cpsRev[i].x,
        cpsRev[i].y,
        l - sideThornWidth,
        b - (i + 1) * sideThornInterval
      );
    }
  }
  ctx.quadraticCurveTo(l, t, l - cornerGapX, t - cornerGapY); // to左上
}

// // TODO
// export function createThornedTalkBubbleImage() {
//   console.warn("Not implemented yet");
// }
