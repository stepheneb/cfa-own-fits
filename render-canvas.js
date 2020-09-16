/*jshint esversion: 6 */

//
// Canvas Array Rendering
//

var ctx, canvas_columns, canvas_rows, imageData, pd;

var nx = 2600,
  ny = 2500;

setupCanvas = function (canvas, rawdata, min, max, color) {
  if (canvas) {
    initializeCanvas(canvas);
    console.log("min: " + min + ", max: " + max);
    if (min < 0) {
      min = 0;
    }
    switch (color) {
    case 'red':
      renderCanvasRed(canvas, rawdata, min, max);
      break;
    case 'green':
      renderCanvasGreen(canvas, rawdata, min, max);
      break;
    case 'blue':
      renderCanvasBlue(canvas, rawdata, min, max);
      break;
    default:
      renderCanvasGray(canvas, rawdata, min, max);
      break;
    }
  }
};

initializeCanvas = function (canvas) {
  ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.globalCompositeOperation = "destination-atop";

  canvas_columns = nx;
  canvas_rows = ny;

  canvas.width = canvas_columns;
  canvas.height = canvas_rows;

  imageData = ctx.getImageData(0, 0, canvas_columns, canvas_rows);
  pd = imageData.data;
};

renderCanvasRed = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256 / range * 10,
    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale + min);
      pixel_data[pix_index] = scaledval;
      pixel_data[pix_index + 1] = 0;
      pixel_data[pix_index + 2] = 0;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

renderCanvasGreen = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256 / range * 10,
    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale + min);
      pixel_data[pix_index] = 0;
      pixel_data[pix_index + 1] = scaledval;
      pixel_data[pix_index + 2] = 0;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

renderCanvasBlue = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256 / range * 10,
    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale + min);
      pixel_data[pix_index] = 0;
      pixel_data[pix_index + 1] = 0;
      pixel_data[pix_index + 2] = scaledval;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

renderCanvasGray = function (canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256 / range * 10,
    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale + min);
      pixel_data[pix_index] = scaledval;
      pixel_data[pix_index + 1] = scaledval;
      pixel_data[pix_index + 2] = scaledval;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

renderCanvasRGB = function (canvas, rawdataRed, redMin, redMax, rawdataGreen, greenMin, greenMax, rawdataBlue, blueMin, blueMax) {
  var pix_index, ycols, x, y,
    redVal, scaledRedVal,
    greenVal, scaledGreenVal,
    blueVal, scaledBlueVal,
    i = 0,
    redRange = redMax - redMin,
    redScale = 256 / redRange * 10,

    greenRange = greenMax - greenMin,
    greenScale = 256 / greenRange * 10,

    blueRange = blueMax - blueMin,
    blueScale = 256 / blueRange * 10,

    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      redVal = rawdataRed[i];
      scaledRedVal = Math.min(255, redVal * redScale + redMin);

      greenVal = rawdataGreen[i];
      scaledGreenVal = Math.min(255, greenVal * greenScale + greenMin);

      blueVal = rawdataBlue[i];
      scaledBlueVal = Math.min(255, blueVal * blueScale + blueMin);

      pixel_data[pix_index] = scaledRedVal;
      pixel_data[pix_index + 1] = scaledGreenVal;
      pixel_data[pix_index + 2] = scaledBlueVal;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

putCanvas = function (canvas) {
  canvas.getContext('2d').putImageData(imageData, 0, 0);
};
