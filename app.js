/*jshint esversion: 6 */

// XMLHttpRequest wrapper using callbacks
let request = obj => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(obj.method || "GET", obj.url);
    if (obj.headers) {
      Object.keys(obj.headers).forEach(key => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(obj.body);
  });
};

let app = {};
let pageRendered = false;
let pageNum = -1;

request({ url: "app.json" })
  .then(data => {
    app = JSON.parse(data);
    pageRendered = false;
    router();
  })
  .catch(error => {
    console.log(error);
  });

// router

let router = () => {
  let hash = window.location.hash;
  let match = hash.match(/#(?<page>\d+)/);
  if (match) {
    let num = Number.parseInt(match.groups['page']);
    if (num == pageNum && pageRendered) {
      // do nothing
    } else {
      pageNum = num;
      if (pageNum == 0) {
        renderActivityMenuPage(app);
      } else {
        if (pageNum <= app.pages.length) {
          renderActivityPage(pageNum);
        } else {
          renderActivityMenuPage(app);
        }
      }
    }
  } else {
    renderSplashPage();
  }
};

window.addEventListener('hashchange', event => {
  pageJustLoaded = false;
  router();
});

// Splash page

let renderSplashPage = () => {
  window.location.hash = '';
  let splash = document.getElementById('splash');
  if (splash) {
    splash.addEventListener('click', event => {
      splash.parentNode.removeChild(splash);
      renderActivityMenuPage(app);
    });
  }
};

let removeSplash = () => {
  let splash = document.getElementById('splash');
  if (splash) {
    splash.parentNode.removeChild(splash);
  }
};

// Activity Menu page

let renderActivityMenuPage = app => {
  removeSplash();
  window.location.hash = '0';
  let html = renderActivityMenuPageHeader(app);
  html += `
      <div class="activity-page-menu">
        ${renderActivityMenuPageItems(app)}
      </div>
      ${renderMenuPageButtons()}
    `;
  document.getElementById("content").innerHTML = html;

  let addMenuItemListener = (pageNum) => {
    let id = `start-page-${pageNum}`;
    document.getElementById(id).addEventListener('click', event => {
      renderActivityPage(pageNum);
    }, {
      once: true,
      passive: true,
      capture: true
    });
  };

  for (let i = 0; i < app.pages.length; i++) {
    let pageNum = i + 1;
    addMenuItemListener(pageNum);
  }
  setupEventHandlers();
  pageRendered = true;
};

let renderActivityMenuPageHeader = app => {
  return `
    <div class='row menu-page-header'>
      <div class='col-6'>
        <div class='menu-page-title'>${app.menu.title}</div>
        <div class='menu-page-subtitle'>${app.menu.subtitle}</div>
      </div>
    </div>
  `;
};

let renderActivityMenuPageItems = app => {
  let html = '';
  let pages = app.pages;
  let activityCount = pages.length;
  let rowCount = 6;
  let subset = [];
  for (var i = 0; i < activityCount; i += rowCount) {
    html += `
        <div class="row">
      `;
    subset = pages.slice(i, i + rowCount);
    for (var j = 0; j < subset.length; j++) {
      let page = pages[i + j];
      let pageNum = i + j + 1;
      html += `
        <div class="col-2"  id="start-page-${pageNum}">
          <img src="${page.menuimage}" class="menu-activity-page-title"></img>
          <div class="menu-activity-page-title">
            <header class="menu-activity-page-title">${page.title}</header>
          </div>
        </div>
      `;
    }
    html += `
        </div>
      `;
  }
  return html;
};

// Activity page

let renderActivityPage = pageNum => {
  removeSplash();
  let page = app.pages[pageNum - 1];
  window.location.hash = pageNum;
  page.image.selectedSource = 0;
  page.image.selectedMainLayers = '100';
  renderPage(page);
  setupEventHandlers();
  page.image.destinations = {
    main: {
      canvas: document.getElementById("main-image-canvas")
    },
    preview: {
      canvas: document.getElementById('image-layer-preview'),
      img: document.getElementById('image-layer-preview')
    }
  };

  initializeCanvasDestinations(page.image);
  initializeCanvas(page.image.destinations.preview);
  getImages(page);
  controllerImageSelectFilterLayerToAdjust(page, 0);
  controllerImageAdjustFilterLayer(page);
  updateImageAdjustFilterLayer(page);
  controllerImageSelectMainLayer(page);
  document.getElementById('btn-back').addEventListener('click', event => {
    renderActivityMenuPage(app);
  });
  pageRendered = true;
};

//
// Component rendering ...
//

let renderPage = page => {
  let html = `
    <div id='page-1' class='activity-page'>
      ${renderPageHeader(page)}

      <div class='row'>
        <div class='col-3'>
          ${renderImageSelectFilterLayerToAdjust(page)}
          ${renderImageLayerPreview(page)}
          ${renderImageAdjustFilterLayer(page)}
        </div>
        <div class='col-7'>
          ${renderMainImageContent(page)}
        </div>
        <div class='col-2'>
          ${renderImageAboutTelescope(page)}
        </div>
      </div>
    </div>
    ${renderPageNavigation()}
  `;
  document.getElementById("content").innerHTML = html;
};

let renderPageHeader = page => {
  return `
    <div class='row page-header'>
      <div class='col-6'>
        <div class='page-title'>${page.title}</div>
        <div class='page-subtitle'>${page.subtitle}</div>
      </div>
    </div>
  `;
};

let controllerImageSelectFilterLayerToAdjust = (page, layerNum) => {
  let elem = document.getElementById("image-select-filter-layer-to-adjust");
  elem.addEventListener('change', (e) => {
    let i = Number(event.target.value);
    selectImageFilterLayerToAdjust(page, i);
  });
  if (typeof layerNum == 'number') {
    elem.querySelector(`[value='${layerNum}']`).checked = true;
    page.image.selectedSource = layerNum;
  }
};

let selectImageFilterLayerToAdjust = (page, layerNum) => {
  page.image.selectedSource = layerNum;
  renderOffscreenCanvas(page.image.sources[layerNum], page.image.nx, page.image.ny);
  copyOffscreenCanvasToPreview(page.image.sources[layerNum], page.image.destinations.preview, page.image.nx, page.image.ny);
  consoleLogHistogram(page.image.sources[layerNum]);
  updateImageAdjustFilterLayer(page);
};

let renderImageSelectFilterLayerToAdjust = page => {
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.selectfiltertext}</div>
      <form id="image-select-filter-layer-to-adjust">
        ${renderRadioButtons(page)}
      </form>
    </div>
  `;

  function renderRadioButtons(page) {
    let sources = page.image.sources;
    let html = '';
    for (var i = 0; i < sources.length; i++) {
      let source = sources[i];
      if (source.type == "rawdata") {
        html += `
              <div class='row'>
                <div class='select-filter-radio'>
                  <input id='select-rgb-${i}' type='radio' name='select-rgb' value='${i}'>
                </div>
                <div class='select-filter-label'>
                  <label for='select-rgb-${i}'>${source.name}</label>
                </div>
              </div>
            `;
      }
    }
    return html;
  }
};

let renderImageLayerPreview = page => {
  return `
    <canvas id='image-layer-preview' class='image-layer-preview'></canvas>
  `;
};

let renderImageAboutTelescope = page => {
  return `
    <div>${page.image.about.prologue}</div>
    <div class="about-telescope">${page.image.about.telescope} Telescope</div>
    <canvas class='image-about-telescope'></canvas>
  `;
};

let controllerImageAdjustFilterLayer = page => {
  let elemBrightness = document.getElementById("brightness");
  elemBrightness.addEventListener('input', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    let brightness = e.target.valueAsNumber;
    source.brightness = brightness;
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    renderMainLayers(page.image);
  });

  let elemContrast = document.getElementById("contrast");
  elemContrast.addEventListener('input', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    source.contrast = e.target.valueAsNumber;
    let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
    source.max = source.originalMax - contrastShift;
    source.min = Math.max(0, source.originalMin + contrastShift);
    consoleLogHistogram(source);
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    renderMainLayers(page.image);
  });

};

let updateImageAdjustFilterLayer = page => {
  let source = page.image.sources[page.image.selectedSource];
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
};

let renderImageAdjustFilterLayer = page => {
  let source = page.image.sources[page.image.selectedSource];
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      <div class='row'>
        <div class='col-4'>
          <label class="pl-2" for='brightness'>Brightness</label>
        </div>
        <div class='col-8'>
          <input type='range' id='brightness' name='brightness'  min='0' max='${page.image.maximumBrightness}' value='${page.image.maximumBrightness / 2}'
            step='0.05'>
        </div>
      </div>

      <div class=' row'>
        <div class='col-4'>
          <label class="pl-2" for='contrast'>Contrast</label>
        </div>
        <div class='col-8'>
          <input type='range' id='contrast' name='contrast' min='0.04' max='1.96' value='1' step='0.01'>
        </div>
      </div>

      <div class='row'>
        <div class='col-4'>
          <label class="pl-2" for='color-shift'>Color Shift</label>
        </div>
        <div class='col-8'>
          <input type='range' id='color-shift' name='color-shift' min='0' max='10' value='5' disabled>
        </div>
      </div>
    </div>
  `;
};

let renderMainImageContent = page => {
  return `
    <div class='main-image-content'>
      <canvas id='main-image-canvas' class='page-image'></canvas>
      ${renderUnderMainImageRow(page)}
    </div>
  `;
};

let controllerImageSelectMainLayer = page => {
  let elem = document.getElementById("image-select-main-layer");
  elem.addEventListener('change', (e) => {
    let checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"'));
    page.image.selectedMainLayers = checkboxes.map(elem => elem.checked ? '1' : '0').join('');
    renderMainLayers(page.image);
  });
};

let renderUnderMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start">
      <div class="pr-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
      <form id="image-select-main-layer">
        <div class="d-flex flex-row justify-content-start">
          ${renderUnderMainImageLayerSelectors(page)}
        </div>
      </form>
      <div class="image-name pl-2 pr-2 ml-auto">
        ${page.image.name}
      </div>
    </div>
  `;
};

let renderUnderMainImageLayerSelectors = page => {
  let sources = page.image.sources;
  let html = '';
  for (var i = 0; i < sources.length; i++) {
    let source = sources[i];
    let checkedState = "checked";
    if (source.type == "rawdata") {
      let name = source.name;
      if (i > 0) {
        checkedState = "";
      }
      html += `
            <div class="select-layer-label">
              <label for='select-layer-${name}'>${name}</label>
            </div>
            <div class="select-layer-checkbox">
              <input type='checkbox' id='select-layer-${name}' name='select-layer-${name}' ${checkedState} value='0'>
            </div>
          `;
    }
  }
  return html;
};

let renderPageNavigation = () => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${renderPageNavigationButtonBack()}
      ${renderPageNavigationButtonFullScreen()}
    </div>
  `;
};

let renderMenuPageButtons = () => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${renderPageNavigationButtonFullScreen()}
    </div>
  `;
};

let renderPageNavigationButtonBack = () => {
  return `
    <div class="pl-1 pr-1">
      <button type="button" id="btn-back" class="btn btn-outline-primary btn-small page-navigation-button">&#9664 Back</button>
    </div>
  `;
};

let renderPageNavigationButtonFullScreen = () => {
  return `
    <div class="pl-1 pr-1 ml-auto">
      <button type="button" id="btn-toggle-fullscreen" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Full Screen</button>
    </div>
  `;
};

//
// Image fetching and rendering ...
//

let getImages = page => {
  // get inital image layer, render offscreen and copy to main canvas
  let source = page.image.sources[0];
  addRawDataSourceAttributes(source);
  fetchRawDataForImage(page, source, renderFuncfetchRawDataForImageFirstSource);
  // step through rest of image layers and fetch all rawdata images
  for (var s = 1; s < page.image.sources.length; s++) {
    source = page.image.sources[s];
    switch (source.type) {
    case 'rawdata':
      fetchRawDataForImage(page, source, renderFuncfetchRawDataForImageSubsequentSource);
      break;
    case 'composite':
      initializeOffscreenCanvas(source, page.image.nx, page.image.ny);
      break;
    }
  }
};

let fetchRawDataForImage = (page, source, renderFunc) => {
  fetch(source.path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        return response.arrayBuffer();
      }
    })
    .then(arrayBuffer => {
      source.rawdata = new Float32Array(arrayBuffer);
      addRawDataSourceAttributes(source);
      consoleLogHistogram(source);
      renderFunc(page.image, source, page.image.nx, page.image.ny);

    })
    .catch(e => {
      console.log('There has been a problem with your fetch operation: ' + e.message);
    });
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

let renderFuncfetchRawDataForImageFirstSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
  copyOffscreenCanvasToPreview(source, image.destinations.preview, nx, ny);
  copyOffscreenCanvasToMain(source, image.destinations.main);
};

let renderFuncfetchRawDataForImageSubsequentSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
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
  destination.canvas.width = nx;
  destination.canvas.height = ny;
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

let copyOffscreenCanvasToDestination = function (source, destination, preview, nx, ny) {

  let { width, height } = preview.canvas.getBoundingClientRect();
  let resizeHeight = height;
  let resizeWidth = height * 26 / 25;
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

  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  destination.ctx.transferFromImageBitmap(bitmap);
};

let copyOffscreenCanvasToMain = function (source, destination) {
  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  destination.ctx.transferFromImageBitmap(bitmap);
};

let copyOffscreenCanvasToPreview = function (source, preview, nx, ny) {
  let { width, height } = preview.canvas.getBoundingClientRect();
  let resizeHeight = height;
  let resizeWidth = height * 26 / 25;
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
  switch (source.filter) {
  case 'red':
    for (y = 0; y < ny; y++) {
      ycols = y * ny;
      pixindex = ycols * 4;
      for (x = 0; x < nx; x++) {
        i = y * ny + x;
        val = rawdata[i];
        scaledval = val * scale - min;
        pixeldata[pixindex] = scaledval;
        pixindex += 4;
      }
    }
    break;
  case 'green':
    for (y = 0; y < ny; y++) {
      ycols = y * ny;
      pixindex = ycols * 4;
      for (x = 0; x < nx; x++) {
        i = y * ny + x;
        val = rawdata[i];
        scaledval = val * scale - min;
        pixeldata[pixindex + 1] = scaledval;
        pixindex += 4;
      }
    }
    break;
  case 'blue':
    for (y = 0; y < ny; y++) {
      ycols = y * ny;
      pixindex = ycols * 4;
      for (x = 0; x < nx; x++) {
        i = y * ny + x;
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
  let renderTime = performance.now();
  source.ctx.putImageData(source.imageData, 0, 0);
  let putImageDataTime = performance.now();
  console.log(`renderOffscreenCanvas: name: ${source.name}, filter: ${source.filter}: render: ${roundNumber(renderTime  - startTime, 4)}`);
};

const containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

const sameMembers = (arr1, arr2) =>
  containsAll(arr1, arr2) && containsAll(arr2, arr1);

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

//
// Event handling
//

let setupEventHandlers = () => {
  let toggleFullscreenButton = document.getElementById('btn-toggle-fullscreen');
  if (toggleFullscreenButton) {
    toggleFullscreenButton.addEventListener('click', event => {
      if (document.documentElement.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else {
          if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
        }
      } else {
        const _element = document.documentElement;
        if (_element.requestFullscreen) {
          _element.requestFullscreen();
        } else {
          if (_element.webkitRequestFullscreen) {
            _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        }
      }
    });
  } else {
    console.log('btn-toggle-fullscreen not found');
  }
};

//
// Utilities
//

const forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

const histogram = (array, numbuckets, min, max) => {
  let i, index, val, sval,
    range = max - min,
    bucketSize = range / numbuckets,
    scale = numbuckets / range,
    buckets = Array(numbuckets);

  for (i = 0; i < buckets.length; i++) {
    let bucketStart = roundNumber(i * bucketSize + min, 2);
    buckets[i] = [bucketStart, 0];
  }
  for (i = 0; i < array.length; i++) {
    val = array[i];
    if (val >= min && val <= max) {
      sval = (val - min) * scale;
      index = Math.floor(sval);
      if (index < 0 || index >= numbuckets) {
        // console.log(index);
      } else {
        buckets[index][1] += 1;
      }
    }
  }
  return buckets;
};

let consoleLogHistogram = source => {
  let h = histogram(source.rawdata, 30, source.min, source.max);
  let [min, max] = forLoopMinMax(source.rawdata);
  console.log(`Histogram (raw data): name: ${source.name}, min: ${roundNumber(min, 3)}, max: ${roundNumber(max, 3)}, hmin: ${roundNumber(source.min, 4)}, hmax: ${roundNumber(source.max, 4)}, contrast: ${roundNumber(source.contrast, 4)}`);
  console.table(h);
};

let roundNumber = (value, precision = 1) => {
  return Number(Number.parseFloat(value).toPrecision(precision));
};
