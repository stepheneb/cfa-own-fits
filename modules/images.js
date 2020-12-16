/*jshint esversion: 6 */

//
// Image fetching and rendering ...
//

import Filter from './filter.js';
import cmap from './render/cmap.js';
import renderUtil from './render/util.js';
import Spinner from './spinner.js';
import utilities from './utilities.js';
import logger from './logger.js';

let spinner = new Spinner("loading-spinner");

let images = {};

images.init = (image, preview) => {
  initializeCanvasDestinations(image);
  if (preview) {
    images.initializeCanvas(preview);
  }
};

images.get = (page, categoryType) => {
  spinner.show("getImages");
  let layerRenderFunc, mainRenderFunc;
  switch (categoryType) {
  case 'rgb':
  case 'multi-wave':
    layerRenderFunc = renderFuncfetchRawDataForRGBImage;
    mainRenderFunc = images.renderMain;
    break;
  case 'masterpiece':
    layerRenderFunc = renderFuncfetchRawDataForMasterpieceImage;
    mainRenderFunc = images.renderMainMasterpiece;
    break;
  }
  fetchAllRawDataImages(page, page.image.selectedSource, layerRenderFunc, mainRenderFunc);
  let compositeSource = page.image.sources.find(s => s.type == 'composite');
  if (compositeSource) {
    spinner.show("initializeOffscreenCanvas");
    initializeOffscreenCanvas(compositeSource, page.image.nx, page.image.ny);
    spinner.hide("initializeOffscreenCanvas");
  }
};

let fetchAllRawDataImages = (page, selectedPreviewLayer, layerRenderFunc, mainRenderFunc) => {
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
      layerRenderFunc(page.image, source, previewSelected, page.image.nx, page.image.ny);
    });
    mainRenderFunc(page.image);
    spinner.hide("then imageBufferItems");
  }).catch(function (e) {
    spinner.cancel("fetchError");
    console.log('Error fetchAllRawaDataImages operation: ' + e.message);
  });
};

let renderFuncfetchRawDataForRGBImage = (image, source, previewSelected, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  images.renderOffscreen(source, nx, ny);
  if (previewSelected) {
    images.copyOffscreenToPreview(source, image.destinations.preview, nx, ny);
    logger.imageData(source);
  }
};

let renderFuncfetchRawDataForMasterpieceImage = (image, source, previewSelected, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  images.renderOffscreen(source, nx, ny);
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

images.initializeCanvas = function (destination, nx, ny) {
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
  images.resizeCanvas(destination.canvas, nx, ny);
};

let getWidthHeight = elem => {
  return { width: elem.clientWidth, height: elem.clientHeight };
};

images.resizeCanvas = (canvas, nx, ny) => {
  let aspectRatio = nx / ny;
  let { width, height } = getWidthHeight(canvas.parentElement);
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeW, resizeH;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeH = height;
    resizeW = height * sourceAspectRatio;
  } else {
    resizeW = width;
    resizeH = width / sourceAspectRatio;
  }
  canvas.width = resizeW;
  canvas.height = resizeH;
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
  let pixeldata = source.uint8Data,
    len = pixeldata.length;

  for (var i = 3; i < len; i += 4) {
    pixeldata[i] = value;
  }
};

let copyOffscreenCanvasToMain = function (source, destination) {
  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  destination.ctx.transferFromImageBitmap(bitmap);
};

images.copyOffscreenToPreview = function (source, preview, nx, ny) {
  let aspectRatio = nx / ny;
  let { width, height } = getWidthHeight(preview.canvas.parentElement);
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeW, resizeH;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeH = height;
    resizeW = resizeH * sourceAspectRatio;
  } else {
    resizeW = width;
    resizeH = width / sourceAspectRatio;
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
    case 'gray':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex] = scaledval;
          pixeldata[++pixindex] = scaledval;
          pixeldata[++pixindex] = scaledval;
          pixindex += 2;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (var i = 0; i < len; i += 4) {
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
    case 'gray':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex] = scaledval;
          pixeldata[++pixindex] = scaledval;
          pixeldata[++pixindex] = scaledval;
          pixindex += 2;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (var i = 0; i < len; i += 4) {
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
  let len = pixeldataRed.length;
  let i = 0;

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

images.renderMainMasterpiece = image => {
  let startTime = performance.now();
  let rgbsource = image.sources[3];
  let pixeldata = rgbsource.uint8Data;
  let pixeldataRed = image.sources[0].uint8Data;
  let pixeldataGreen = image.sources[1].uint8Data;
  let pixeldataBlue = image.sources[2].uint8Data;
  if (!image.cmap) image.cmap = 'gray';
  let colormap = cmap.data[image.cmap];
  let len = pixeldataRed.length;
  let i = 0;
  let indexR, indexG, indexB;
  let colorR, colorG, colorB;

  for (i = 0; i < len; i += 4) {
    indexR = pixeldataRed[i];
    colorR = colormap[indexR][0];

    indexG = pixeldataGreen[i + 1];
    colorG = colormap[indexG][1];

    indexB = pixeldataBlue[i + 2];
    colorB = colormap[indexB][2];

    pixeldata[i] = colorR;
    pixeldata[i + 1] = colorG;
    pixeldata[i + 2] = colorB;
  }

  let renderTime = performance.now();
  rgbsource.ctx.putImageData(rgbsource.imageData, 0, 0);

  let putImageDataTime = performance.now();
  let bitmap = rgbsource.offscreenCanvas.transferToImageBitmap();
  image.destinations.main.ctx.transferFromImageBitmap(bitmap);
  let transferToImageBitmapTime = performance.now();
  console.log(`renderMain: ${utilities.roundNumber(image.selectedMainLayers, 4)}: render: ${utilities.roundNumber(renderTime - startTime, 4)}, transferToImageBitmap: ${utilities.roundNumber(transferToImageBitmapTime - putImageDataTime, 4)}`);
};

images.renderColorMaps = page => {
  let id, canvas, name;
  let [nx, ny] = [256, 16];
  let names = cmap.names;
  let colormaps = cmap.names().map(name => {
    id = `select-cmap-${name}-canvas`;
    canvas = document.getElementById(id);
    return [name, canvas];
  });

  colormaps.forEach(([name, canvas], i) => {
    init(canvas, nx, ny);
    render(canvas, name, nx, ny);
  });

  function init(canvas, nx, ny) {
    canvas.ctx = canvas.getContext('2d');
    canvas.ctx.fillStyle = "rgb(0,0,0)";
    canvas.ctx.imageSmoothingEnabled = true;
    canvas.ctx.globalCompositeOperation = "source-over";
    canvas.width = nx;
    canvas.height = ny;
  }

  function render(canvas, name, nx, ny) {
    let imageData = canvas.ctx.createImageData(nx, ny);
    let uint8Data = imageData.data;
    let colormap = cmap.data[name];
    let i = 0;
    let pixindex = 0;
    let ci = 0;
    const alpha = 255;
    var x, y;
    for (y = 0; y < ny; y++) {
      for (x = 0; x < nx; x++) {
        i = y * nx + x;
        uint8Data[pixindex] = colormap[x][0];
        uint8Data[++pixindex] = colormap[x][1];
        uint8Data[++pixindex] = colormap[x][2];
        uint8Data[++pixindex] = alpha;
        pixindex++;
      }
    }
    canvas.ctx.putImageData(imageData, 0, 0);
  }
};

let renderLayersFromRawData = (image) => {
  image.sources.filter(s => s.type == 'rawdata')
    .forEach(source => {
      images.renderOffscreen(source, image.nx, image.ny);
    });
};

images.runFilters = (image, filters) => {
  // let canvas = image.destinations.main.canvas;
  let rgbsource = image.sources[3];

  renderLayersFromRawData(image);
  images.renderMainMasterpiece(image);
  rgbsource.ctx.putImageData(rgbsource.imageData, 0, 0);
  let bitmap = rgbsource.offscreenCanvas.transferToImageBitmap();
  image.destinations.main.ctx.transferFromImageBitmap(bitmap);

  let pixeldata = {
    data: rgbsource.uint8Data,
    width: image.nx,
    height: image.ny
  };

  if (filters.length > 0) {
    filters.forEach(filter => {
      Filter.filters[filters[0]].filter(pixeldata);
      rgbsource.ctx.putImageData(rgbsource.imageData, 0, 0);
      let bitmap = rgbsource.offscreenCanvas.transferToImageBitmap();
      image.destinations.main.ctx.transferFromImageBitmap(bitmap);
    });
  }

};

images.renderPalettes = page => {
  let id, canvas, name;
  let [nx, ny] = [256, 16];
  let sources = renderUtil.getAllRawdataSources(page);
  let palettes = sources.map((source, i) => {
    name = source.filter;
    id = `palette-${name}-${i}`;
    canvas = document.getElementById(id);
    return [name, canvas];
  });

  palettes.forEach(([name, canvas], i) => {
    init(canvas, nx, ny);
    render(canvas, name, nx, ny);
    // resize(canvas);
  });

  function init(canvas, nx, ny) {
    canvas.ctx = canvas.getContext('2d');
    canvas.ctx.fillStyle = "rgb(0,0,0)";
    canvas.ctx.imageSmoothingEnabled = true;
    canvas.ctx.globalCompositeOperation = "source-over";
    canvas.width = nx;
    canvas.height = ny;
  }

  function render(canvas, name, nx, ny) {
    let imageData = canvas.ctx.createImageData(nx, ny);
    let uint8Data = imageData.data;
    let i = 0;
    let pixindex = 0;
    let color = 0;
    const alpha = 255;
    var x, y;
    switch (name) {
    case 'red':
      for (y = 0; y < ny; y++) {
        color = 0;
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          uint8Data[pixindex] = color;
          uint8Data[++pixindex] = 0;
          uint8Data[++pixindex] = 0;
          uint8Data[++pixindex] = alpha;
          pixindex++;
          color++;
        }
      }
      break;
    case 'green':
      for (y = 0; y < ny; y++) {
        color = 0;
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          uint8Data[pixindex] = 0;
          uint8Data[++pixindex] = color;
          uint8Data[++pixindex] = 0;
          uint8Data[++pixindex] = alpha;
          pixindex++;
          color++;
        }
      }
      break;
    case 'blue':
      for (y = 0; y < ny; y++) {
        color = 0;
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          uint8Data[pixindex] = 0;
          uint8Data[++pixindex] = 0;
          uint8Data[++pixindex] = color;
          uint8Data[++pixindex] = alpha;
          pixindex++;
          color++;
        }
      }
      break;
    case 'gray':
      for (y = 0; y < ny; y++) {
        color = 0;
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          uint8Data[pixindex] = color;
          uint8Data[++pixindex] = color;
          uint8Data[++pixindex] = color;
          uint8Data[++pixindex] = alpha;
          pixindex++;
          color++;
        }
      }
      break;
    }
    canvas.ctx.putImageData(imageData, 0, 0);
  }
};

export default images;
