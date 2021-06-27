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

canvasUtils.canvasArrow = (ctx, x1, y1, x2, y2, start, end, color, arrowScale) => {
  color = (color === undefined) ? 'rgba(243, 60, 143, 1.0)' : color;
  arrowScale = (arrowScale === undefined) ? 1 : arrowScale;

  ctx.save();
  if (arrowScale > 1) {
    ctx.lineWidth = arrowScale;
  }
  var rot = -Math.atan2(x1 - x2, y1 - y2);
  let lineX2 = x2 - arrowScale;
  ctx.strokeStyle = color;
  ctx.linecap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(lineX2, y2);
  ctx.stroke();
  ctx.linecap = 'butt';
  ctx.beginPath();
  ctx.moveTo(lineX2, y1);
  ctx.lineTo(lineX2 - arrowScale, y2);
  ctx.stroke();
  if (start) {
    canvasArrowHead(ctx, x1, y1, rot);
  }
  if (end) {
    canvasArrowHead(ctx, x2, y2, rot + Math.PI);
  }
  ctx.restore();

  function canvasArrowHead(ctx, x, y, rot) {
    ctx.save();
    ctx.lineCap = 'round';
    // ctx.lineWidth = 1;
    ctx.translate(x, y);
    ctx.rotate(rot);
    // ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-1.5 * arrowScale, -3 * arrowScale);
    ctx.stroke();
    ctx.moveTo(0, 0);
    ctx.lineTo(1.5 * arrowScale, -3 * arrowScale);
    ctx.stroke();
    // ctx.closePath();
    // ctx.fill();
    ctx.restore();
  }

};

export default canvasUtils;
