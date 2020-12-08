/*jshint esversion: 6 */

//
// Image fetching and rendering ...
//

import Spinner from './spinner.js';

import utilities from './utilities.js';

import logger from './logger.js';

let spinner = new Spinner("loading-spinner");

let images = {}

images.init = (image, preview) => {
  initializeCanvasDestinations(image);
  initializeCanvas(preview);
};

images.get = (page) => {
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
      logger.rawData(source);
      let previewSelected = selectedPreviewLayer == i ? true : false;
      renderFunc(page.image, source, previewSelected, page.image.nx, page.image.ny);
    });
    images.renderMain(page.image);
    spinner.hide("then imageBufferItems");
  }).catch(function (e) {
    spinner.cancel("fetchError");
    console.log('Error fetchAllRawaDataImages operation: ' + e.message);
  });
};

let renderFuncfetchRawDataForImage = (image, source, previewSelected, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  images.renderOffscreen(source, nx, ny);
  if (previewSelected) {
    images.copyOffscreenToPreview(source, image.destinations.preview, nx, ny);
    logger.imageData(source);
  }
};

let addRawDataSourceAttributes = source => {
  source.originalMax = source.max;
  source.originalMin = source.min;
  source.originalRange = source.originalMax - source.originalMin;
  [source.rawDataMax, source.rawDataMin] = utilities.forLoopMinMax(source);
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
  let resizeW, resizeH;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeH = height;
    resizeW = height * sourceAspectRatio;
  } else {
    resizeW = width;
    resizeH = height * sourceAspectRatio;
  }
  destination.canvas.width = resizeW;
  destination.canvas.height = resizeH;
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

images.copyOffscreenToPreview = function (source, preview, nx, ny) {
  let aspectRatio = nx / ny;
  let { width, height } = preview.canvas.parentElement.getBoundingClientRect();
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeW, resizeH;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeH = height;
    resizeW = resizeH * sourceAspectRatio;
  } else {
    resizeW = width;
    resizeH = height * sourceAspectRatio;
  }
  let resizeAspectRatio = resizeW / resizeH;
  let imageData = new ImageData(source.uint8Data, nx, ny);
  let bitmapP2 = createImageBitmap(imageData, 0, 0, nx, ny, { resizeWidth: resizeW, resizeHeight: resizeH });

  bitmapP2.then(smallbitmap => {
    preview.canvas.width = smallbitmap.width;
    preview.canvas.height = smallbitmap.height;
    preview.ctx.drawImage(smallbitmap, 0, 0);
  });
};

images.renderOffscreen = function (source, nx, ny) {
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
  console.log(`images.renderOffscreen: name: ${source.name}, filter: ${source.filter}: render: ${utilities.roundNumber(renderTime  - startTime, 4)}`);
};

images.renderMain = image => {
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
  console.log(`renderMain: ${utilities.roundNumber(image.selectedMainLayers, 4)}: render: ${utilities.roundNumber(renderTime - startTime, 4)}, transferToImageBitmap: ${utilities.roundNumber(transferToImageBitmapTime - putImageDataTime, 4)}`);
};

export default images;
