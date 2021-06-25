/*jshint esversion: 6 */

//
// Utilities
//

let canvasUtils = {};

canvasUtils.createImageBitmapFromCtx = (ctx, sx, sy, sw, sh, callback) => {
  let imageData = ctx.getImageData(sx, sy, sw, sh);
  createImageBitmap(imageData, sx, sy, sw, sh)
    .then(imageBitmap => {
      if (callback instanceof Function) {
        callback(imageBitmap);
      }
    });
};

canvasUtils.canvasArrow = (ctx, x1, y1, x2, y2, start, end) => {
  var rot = -Math.atan2(x1 - x2, y1 - y2);
  let lineX2 = x2;
  switch (true) {
  case ctx.lineWidth <= 4:
    lineX2 -= 3;
    break;
  case ctx.lineWidth <= 8:
    lineX2 -= 6;
    break;
  case ctx.lineWidth <= 12:
    lineX2 -= 12;
    break;
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(lineX2, y2);
  ctx.stroke();
  if (start) {
    canvasUtils.canvasArrowHead(ctx, x1, y1, rot);
  }
  if (end) {
    canvasUtils.canvasArrowHead(ctx, x2, y2, rot + Math.PI);
  }
};

canvasUtils.canvasArrowHead = (ctx, x, y, rot) => {
  let scale = 1;
  switch (true) {
  case ctx.lineWidth == 1:
    break;
  case ctx.lineWidth <= 4:
    scale = 1.5;
    break;
  case ctx.lineWidth <= 8:
    scale = 2.5;
    break;
  case ctx.lineWidth <= 12:
    scale = 3.0;
    break;
  }

  ctx.save();
  ctx.lineWidth = 1;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-5 * scale, -9 * scale);
  ctx.lineTo(5 * scale, -9 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export default canvasUtils;
