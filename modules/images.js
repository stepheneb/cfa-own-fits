/*jshint esversion: 6 */

//
// Image fetching and rendering ...
//

import Spinner from './spinner.js';

import {
  forLoopMinMax,
  roundNumber
} from './utilities.js';

import {
  consoleLogRawDataHistogram,
  consoleLogCanvasDataHistogram
} from './logging.js';

let spinner = new Spinner("loading-spinner");

let getImages = (page) => {
  spinner.show("getImages");
  fetchAllRawDataImages(page, page.image.selectedSource, renderFuncfetchRawDataForImage);

  let compositeSource = page.image.sources.find(s => s.type == 'composite');
  if (compositeSource) {
    spinner.show("initializeOffscreenCanvas");
    initializeOffscreenCanvas(compositeSource, page.image.nx, page.image.ny);
    spinner.hide("initializeOffscreenCanvas");
  }
};

let fetchAllRawDataImages = (page, selectedPreviewLayer, renderFunc) => {
  let rawDataSources = page.image.sources.filter(s => s.type == 'rawdata');
  Promise.all(
    rawDataSources.map(source => fetch(source.path))
  ).then(responses => {
    return Promise.all(responses.map(response => response.arrayBuffer()));
  }).then(arrayBuffers => {
    arrayBuffers.map((arrayBuffer, i) => {
      let source = page.image.sources[i];
      source.rawdata = new Float32Array(arrayBuffer);
      addRawDataSourceAttributes(source);
      consoleLogRawDataHistogram(source);
      let previewSelected = selectedPreviewLayer == i ? true : false;
      renderFunc(page.image, source, previewSelected, page.image.nx, page.image.ny);
    });
    renderMainLayers(page.image);
    spinner.hide("then imageBufferItems");
  }).catch(function (e) {
    spinner.cancel("fetchError");
    console.log('Error fetchAllRawaDataImages operation: ' + e.message);
  });
};

let renderFuncfetchRawDataForImage = (image, source, previewSelected, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
  if (previewSelected) {
    copyOffscreenCanvasToPreview(source, image.destinations.preview, nx, ny);
    consoleLogCanvasDataHistogram(source);
  }
};

let addRawDataSourceAttributes = source => {
  source.originalMax = source.max;
  source.originalMin = source.min;
  source.originalRange = source.originalMax - source.originalMin;
  [source.rawDataMax, source.rawDataMin] = forLoopMinMax(source);
};

let initializeCanvasDestinations = (image) => {
  initializeCanvasForUseWithOffScreenTransfer(image.destinations.main, image.nx, image.ny);
};

let initializeCanvas = function (destination, nx, ny) {
  let canvas = destination.canvas;
  destination.ctx = canvas.getContext('2d');
  destination.ctx.fillStyle = "rgb(0,0,0)";
  destination.ctx.imageSmoothingEnabled = true;
  destination.ctx.globalCompositeOperation = "source-over";
};

let initializeCanvasForUseWithOffScreenTransfer = function (destination, nx, ny) {
  let canvas = destination.canvas;
  destination.ctx = canvas.getContext('bitmaprenderer');
  destination.ctx.fillStyle = "rgb(0,0,0)";
  destination.ctx.imageSmoothingEnabled = true;
  destination.ctx.globalCompositeOperation = "source-over";

  let aspectRatio = nx / ny;
  let { width, height } = destination.canvas.parentElement.getBoundingClientRect();
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeWidth, resizeHeight;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeHeight = height;
    resizeWidth = height * sourceAspectRatio;
  } else {
    resizeWidth = width;
    resizeHeight = height * sourceAspectRatio;
  }
  destination.canvas.width = resizeWidth;
  destination.canvas.height = resizeHeight;
};

let initializeOffscreenCanvas = function (source, nx, ny) {
  source.offscreenCanvas = new OffscreenCanvas(nx, ny);
  source.ctx = source.offscreenCanvas.getContext('2d');
  // source.ctx.globalAlpha = 1.0;
  source.ctx.fillStyle = "rgb(0,0,0)";
  source.ctx.imageSmoothingEnabled = true;
  source.ctx.globalCompositeOperation = "source-over";
  source.imageData = source.ctx.getImageData(0, 0, nx, ny);
  source.uint8Data = source.imageData.data;
  source.offscreenCanvas.width = nx;
  source.offscreenCanvas.height = ny;
  setAlpha(source, 255);
};

let setAlpha = (source, value) => {
  let i,
    pixeldata = source.uint8Data,
    len = pixeldata.length;

  for (i = 3; i < len; i += 4) {
    pixeldata[i] = value;
  }
};

let copyOffscreenCanvasToMain = function (source, destination) {
  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  destination.ctx.transferFromImageBitmap(bitmap);
};

let copyOffscreenCanvasToPreview = function (source, preview, nx, ny) {
  let aspectRatio = nx / ny;
  let { width, height } = preview.canvas.parentElement.getBoundingClientRect();
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeWidth, resizeHeight;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeHeight = height;
    resizeWidth = height * sourceAspectRatio;
  } else {
    resizeWidth = width;
    resizeHeight = height * sourceAspectRatio;
  }
  let imageData = new ImageData(source.uint8Data, nx, ny);
  let bitmapP2 = createImageBitmap(imageData, 0, 0, nx, ny, { resizeWidth: resizeWidth, resizeHeight: resizeHeight });

  bitmapP2.then(smallbitmap => {
    let { width, height } = preview.canvas.getBoundingClientRect();
    let posx = width / 2 - smallbitmap.width / 2;
    let posy = height / 2 - smallbitmap.height / 2;
    preview.canvas.width = smallbitmap.width;
    preview.canvas.height = smallbitmap.height;
    preview.ctx.drawImage(smallbitmap, 0, 0);
  });
};

let renderOffscreenCanvas = function (source, nx, ny) {
  let startTime = performance.now();
  let rawdata = source.rawdata;
  let pixeldata = source.uint8Data;
  let min = source.min;
  let max = source.max;
  let range = max - min;
  let scale = source.brightness * 256 / range;
  let i, pixindex, ycols, x, y, val, scaledval;

  let renderLinear = () => {
    switch (source.filter) {
    case 'red':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'green':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex + 1] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'blue':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex + 2] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 3] = pixeldataBlue[i + 2];
      }
      break;
    }
  };

  let renderLog = () => {
    scale = source.brightness * 256 / Math.log(range + 1);
    switch (source.filter) {
    case 'red':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'green':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex + 1] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'blue':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex + 2] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 3] = pixeldataBlue[i + 2];
      }
      break;
    }
  };

  switch (source.scaling) {
  case 'linear':
    renderLinear();
    break;
  case 'log':
    renderLog();
    break;
  }

  let renderTime = performance.now();
  source.ctx.putImageData(source.imageData, 0, 0);
  let putImageDataTime = performance.now();
  console.log(`renderOffscreenCanvas: name: ${source.name}, filter: ${source.filter}: render: ${roundNumber(renderTime  - startTime, 4)}`);
};

let renderMainLayers = image => {
  let startTime = performance.now();
  let rgbsource = image.sources[3];
  let pixeldata = rgbsource.uint8Data;
  let pixeldataRed = image.sources[0].uint8Data;
  let pixeldataGreen = image.sources[1].uint8Data;
  let pixeldataBlue = image.sources[2].uint8Data;
  let i = 0;
  let len = pixeldataRed.length;

  switch (image.selectedMainLayers) {
  case '000': // No layers
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = 0;
      pixeldata[i + 1] = 0;
      pixeldata[i + 2] = 0;
    }
    break;

  case '100': // Red
    pixeldata.set(pixeldataRed);
    break;

  case '010': // Green
    pixeldata.set(pixeldataGreen);
    break;

  case '001': // Blue
    pixeldata.set(pixeldataBlue);
    break;

  case '110': // Red, Green
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = 0;
    }
    break;

  case '011': // Green, Blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = 0;
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  case '101': // Red, blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = 0;
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  case '111': // Red, Green, Blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  }
  let renderTime = performance.now();
  rgbsource.ctx.putImageData(rgbsource.imageData, 0, 0);

  let putImageDataTime = performance.now();
  let bitmap = rgbsource.offscreenCanvas.transferToImageBitmap();
  image.destinations.main.ctx.transferFromImageBitmap(bitmap);
  let transferToImageBitmapTime = performance.now();
  console.log(`renderMainLayers: ${roundNumber(image.selectedMainLayers, 4)}: render: ${roundNumber(renderTime - startTime, 4)}, transferToImageBitmap: ${roundNumber(transferToImageBitmapTime - putImageDataTime, 4)}`);
};

export { getImages, renderMainLayers, renderOffscreenCanvas, copyOffscreenCanvasToPreview, initializeCanvasDestinations, initializeCanvas };
