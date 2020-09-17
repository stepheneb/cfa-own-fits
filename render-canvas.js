/*jshint esversion: 6 */

//
// Canvas Array Rendering
//

var
  redCtx, redImageData, redUint8data,
  greenCtx, greenImageData, greenUint8data,
  blueCtx, blueImageData, blueUint8data,
  grayCtx, grayImageData, grayUint8data,
  rgbCtx, rgbImageData, rgbUint8data,
  canvas_columns, canvas_rows;

var
  nx = 2600,
  ny = 2500;

setupCanvas = function (canvas, rawdata, min, max, color) {
  if (canvas) {
    switch (color) {
    case 'red':
      [redCtx, redImageData, redUint8data] = initializeCanvas(canvas);
      renderCanvasRed(canvas, rawdata, min, max);
      break;
    case 'green':
      [greenCtx, greenImageData, greenUint8data] = initializeCanvas(canvas);
      renderCanvasGreen(canvas, rawdata, min, max);
      break;
    case 'blue':
      [blueCtx, blueImageData, blueUint8data] = initializeCanvas(canvas);
      renderCanvasBlue(canvas, rawdata, min, max);
      break;
    default:
      [grayCtx, grayImageData, grayUint8data] = initializeCanvas(canvas);
      renderCanvasGray(canvas, rawdata, min, max);
      break;
    }
  }
};

setupCanvasRGB = function (canvas, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax) {
  if (canvas) {
    [rgbCtx, rgbImageData, rgbUint8data] = initializeCanvas(canvas);
    renderCanvasRGB(canvas, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
  }
};

initializeCanvas = function (canvas) {
  var ctx, imageData;

  ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "source-over";

  canvas_columns = nx;
  canvas_rows = ny;

  imageData = ctx.getImageData(0, 0, canvas_columns, canvas_rows);

  canvas.width = canvas_columns;
  canvas.height = canvas_rows;
  return [
    ctx,
    imageData,
    imageData.data
  ];
};

renderCanvasRed = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = redBrightness / range,
    pixel_data = redUint8data;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale - min);
      pixel_data[pix_index] = scaledval;
      pixel_data[pix_index + 1] = 0;
      pixel_data[pix_index + 2] = 0;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  redCtx.putImageData(redImageData, 0, 0);
};

renderCanvasGreen = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = greenBrightness / range,
    pixel_data = greenUint8data;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale - min);
      pixel_data[pix_index] = 0;
      pixel_data[pix_index + 1] = scaledval;
      pixel_data[pix_index + 2] = 0;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  greenCtx.putImageData(greenImageData, 0, 0);
};

renderCanvasBlue = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = blueBrightness / range,
    pixel_data = blueUint8data;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale - min);
      pixel_data[pix_index] = 0;
      pixel_data[pix_index + 1] = 0;
      pixel_data[pix_index + 2] = scaledval;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  blueCtx.putImageData(blueImageData, 0, 0);
};

renderCanvasGray = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256 / range,
    pixel_data = grayUint8data;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale - min);
      pixel_data[pix_index] = scaledval;
      pixel_data[pix_index + 1] = scaledval;
      pixel_data[pix_index + 2] = scaledval;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  grayCtx.putImageData(grayImageData, 0, 0);
};

renderCanvasRGB = function (canvas, rawdataRed, redMin, redMax, rawdataGreen, greenMin, greenMax, rawdataBlue, blueMin, blueMax) {
  var pix_index, ycols, x, y,
    redVal, scaledRedVal,
    greenVal, scaledGreenVal,
    blueVal, scaledBlueVal,
    i = 0,
    redRange = redMax - redMin,
    redScale = redBrightness / redRange,

    greenRange = greenMax - greenMin,
    greenScale = greenBrightness / greenRange,

    blueRange = blueMax - blueMin,
    blueScale = blueBrightness / blueRange,

    pixel_data = rgbUint8data;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      redVal = rawdataRed[i];
      scaledRedVal = Math.min(255, redVal * redScale - redMin);

      greenVal = rawdataGreen[i];
      scaledGreenVal = Math.min(255, greenVal * greenScale - greenMin);

      blueVal = rawdataBlue[i];
      scaledBlueVal = Math.min(255, blueVal * blueScale - blueMin);

      pixel_data[pix_index] = scaledRedVal;
      pixel_data[pix_index + 1] = scaledGreenVal;
      pixel_data[pix_index + 2] = scaledBlueVal;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  rgbCtx.putImageData(rgbImageData, 0, 0);
};
