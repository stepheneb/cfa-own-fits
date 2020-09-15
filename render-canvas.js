//
// Canvas Array Rendering
//

var ctx, canvas_columns, canvas_rows, imageData, pd;

var nx = 2600,
  ny = 2500;

setupCanvas = function(canvas, rawdata, min, max) {
  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.globalCompositeOperation = "destination-atop";

    canvas_columns = nx;
    canvas_rows = ny;

    canvas.width = canvas_columns;
    canvas.height = canvas_rows;

    imageData = ctx.getImageData(0, 0, canvas_columns, canvas_rows);
    pd = imageData.data;

    console.log("min: " + min + ", max: " + max);
    if (min < 0) {
      min = 0;
    }
    renderCanvas(canvas, rawdata, min, max);
  }
};


renderCanvas = function(canvas, rawdata, min, max) {
  var pix_index, ycols, x, y, val, scaledval,
    i = 0,
    range = max - min,
    scale = 256/range * 10,
    pixel_data = pd;
  for (y = 0; y < ny; y++) {
    ycols = y * ny;
    pix_index = ycols * 4;
    for (x = 0; x < nx; x++) {
      i = y * ny + x;
      val = rawdata[i];
      scaledval = Math.min(255, val * scale + min);
      pixel_data[pix_index] = scaledval ;
      pixel_data[pix_index + 1] = scaledval;
      pixel_data[pix_index + 2] = scaledval;
      pixel_data[pix_index + 3] = 255;
      pix_index += 4;
    }
  }
  putCanvas(canvas);
};

putCanvas = function(canvas) {
  canvas.getContext('2d').putImageData(imageData, 0, 0);
};

