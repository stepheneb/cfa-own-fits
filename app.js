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

request({ url: "page.json" })
  .then(data => {
    let page = JSON.parse(data);
    renderPage(page);
    setupEventHandlers();
    getImages(page);
  })
  .catch(error => {
    console.log(error);
  });

//
// Component rendering ...
//

let renderPage = page => {
  let html = `
    <div id='page-1' class='activity-page'>
      ${pageHeader(page)}

      <div class='row'>
        <div class='col-3'>
          ${imageSelectFilterLayerToAdjust(page)}
          ${imageLayerPreview(page)}
          ${imageAdjustFilterLayer(page)}
        </div>
        <div class='col-7'>
          ${mainImageContent(page)}
        </div>
        <div class='col-2'>
          ${imageAboutTelescope(page)}
        </div>
      </div>
    </div>
    ${renderPageNavigation(page)}
  `;
  document.getElementById("content").innerHTML = html;
};

let pageHeader = page => {
  return `
    <div class='row page-header'>
      <div class='col-6'>
        <div class='page-title'>${page.title}</div>
        <div class='page-subtitle'>${page.subtitle}</div>
      </div>
    </div>
  `;
};

let imageSelectFilterLayerToAdjust = page => {
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.selectfiltertext}</div>
      <form>
        <div class='row'>
          <div class='select-filter-radio'>
            <input type='radio' id='select-red1' name='select-rgb' value='Red Filter' checked>
          </div>
          <div class=''>
            <label for='select-red1'>Red</label>
          </div>
        </div>
        <div class='row'>
          <div class='select-filter-radio'>
            <input type='radio' id='select-green1' name='select-rgb' value='Green Filter' disabled>
          </div>
          <div class=''>
            <label for='select-green1'>Green</label>
          </div>
        </div>
        <div class='row'>
          <div class='select-filter-radio'>
            <input type='radio' id='select-blue1' name='select-rgb' value='Blue Filter' disabled>
          </div>
          <div class=''>
            <label for='select-blue1'>Blue</label>
          </div>
        </div>
      </form>
    </div>
  `;
};

let imageLayerPreview = page => {
  return `
    <canvas class='image-layer-preview'></canvas>
  `;
};

let imageAboutTelescope = page => {
  return `
    <div>These images were taken with the</div>
    <div class="about-telescope">${page.image.about.telescope} Telescope</div>
    <canvas class='image-about-telescope'></canvas>
  `;
};

let imageAdjustFilterLayer = page => {
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      <div class='row'>
        <div class='col-4'>
          <label class="pl-2" for='brightness'>Brightness</label>
        </div>
        <div class='col-8'>
          <input type='range' id='brightness' name='brightness'>
        </div>
      </div>

      <div class=' row'>
        <div class='col-4'>
          <label class="pl-2" for='contrast'>Contrast</label>
        </div>
        <div class='col-8'>
          <input type='range' id='contrast' name='contrast' min='0' max='10' value='5' disabled>
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

let mainImageContent = page => {
  return `
    <div class='main-image-content'>
      <canvas id='main-image-canvas' class='page-image'></canvas>
      ${underMainImageRow(page)}
    </div>
  `;
};

let underMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start">
      <div class="pr-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
      <form>
        <div class="d-flex flex-row justify-content-start">
          <div class="select-layer-label">
            <label for='select-layer-red'>Red</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-red' name='select-layer-red' value='Red' checked>
          </div>
          <div class="select-layer-label">
            <label for='select-layer-green'>Green</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-green' name='select-layer-green' value='Green'>
          </div>
          <div class="select-layer-label">
            <label for='select-layer-blue'>Blue</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-blue' name='select-layer-blue' value='Blue'>
          </div>
        </div>
      </form>
      <div class="image-name pl-2 pr-2 ml-auto">
        ${page.image.name}
      </div>
    </div>
  `;
};

let imageSelectMainLayer = () => {
  return `
      <form>
        <div id="select-layer" class="d-flex flex-row justify-content-start">
          <div id='select-layer-radio' class="pl-4 pr-4">
            <input type='radio' id='select-layer-red' name='select-layer-red' value='Red' checked>
            <label for='select-layer-red'>Redabc</label>
          </div>
          <div id='select-layer-radio' class="pl-4 pr-4">
            <input type='radio' id='select-layer-green' name='select-layer-green' value='Green'>
            <label for='select-layer-green'>Green</label>
          </div>
          <div id='select-layer-radio' class="pl-4 pr-4">
            <input type='radio' id='select-layer-blue' name='select-layer-blue' value='Blue'>
            <label for='select-layer-blue'>Blue</label>
          </div>
          <div id='select-layer-radio' class="pl-4 pr-4">
            <input type='radio' id='select-layer-rgb' name='select-layer-rgb' value='RGB'>
            <label for='select-layer-rgb'>RGB</label>
          </div>
        </div>
      </form>
  `;
};

let imageSelectMainLayers = () => {
  return `
    <div id="display-layers" class="d-flex flex-row justify-content-start">
      <div class="form-check form-check-inline">
        <input class="form-check-input display-layer-checkbox" type="checkbox" id="inlineCheckbox1" value="option1">
        <label class="form-check-label" for="inlineCheckbox1">Red</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input display-layer-checkbox" type="checkbox" id="inlineCheckbox2" value="option2">
        <label class="form-check-label" for="inlineCheckbox2">Green</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input display-layer-checkbox" type="checkbox" id="inlineCheckbox3" value="option3">
        <label class="form-check-label" for="inlineCheckbox3">Blue</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input display-layer-checkbox" type="checkbox" id="inlineCheckbox3" value="option3">
        <label class="form-check-label" for="inlineCheckbox3">RGB</label>
      </div>
    </div>
  `;
};

renderPageNavigation = page => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      <div class="pl-1 pr-1">
        <button type="button" id="btn-start-over" class="btn btn-outline-primary btn-small page-navigation-button">Start Over</button>
      </div>
      <div class="pl-1 pr-1">
        <button type="button" id="btn-back" class="btn btn-outline-primary btn-small page-navigation-button">&#9664 Back</button>
      </div>
      <div class="pl-1 pr-1">
        <button type="button" id="btn-forward" class="btn btn-outline-primary btn-small page-navigation-button">Forward &nbsp&#9654</button>
      </div>
      <div class="pl-1 pr-1 ml-auto">
        <button type="button" id="btn-toggle-fullscreen" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Full Screen</button>
      </div>
    </div>
  `;
};

let getImages = page => {
  page.image.canvas = document.getElementById("main-image-canvas");
  let source = page.image.sources[0];
  fetchImage(page, source, initializeAndRenderFirstCanvas);
  for (var s = 1; s < page.image.sources.length; s++) {
    source = page.image.sources[s];
    if (source.type == "rawdata") {
      fetchImage(page, source, initializeAndRenderOffscreenCanvas);
    }
  }
};

//
// Image fetching and rendering ...
//

let fetchImage = (page, source, renderFunc) => {
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
      renderFunc(page.image, source);

    })
    .catch(e => {
      console.log('There has been a problem with your fetch operation: ' + e.message);
    });
};

let initializeAndRenderFirstCanvas = (image, source) => {
  initializeMainCanvasForUseWithOffScreen(image);
  initializeOffscreenCanvas(image, source);
  renderOffscreenCanvas(image, source);
  copyOffscreenCanvas(image, source);
};

let initializeAndRenderOffscreenCanvas = (image, layerNum) => {
  initializeOffscreenCanvas(image, layerNum);
  renderOffscreenCanvas(image, layerNum);
};

let initializeMainCanvasForUseWithOffScreen = function (image) {
  image.ctx = image.canvas.getContext('bitmaprenderer');
  image.ctx.fillStyle = "rgb(0,0,0)";
  image.ctx.imageSmoothingEnabled = true;
  image.ctx.globalCompositeOperation = "source-over";
  image.canvas.width = image.nx;
  image.canvas.height = image.ny;
};

let initializeOffscreenCanvas = function (image, source) {
  let ny = image.ny;
  let nx = image.nx;
  source.offscreenCanvas = new OffscreenCanvas(nx, ny);
  source.ctx = source.offscreenCanvas.getContext('2d');
  source.ctx.fillStyle = "rgb(0,0,0)";
  source.ctx.imageSmoothingEnabled = true;
  source.ctx.globalCompositeOperation = "source-over";
  source.imageData = source.ctx.getImageData(0, 0, nx, ny);
  source.uint8Data = source.imageData.data;
  source.offscreenCanvas.width = nx;
  source.offscreenCanvas.height = ny;
};

let renderOffscreenCanvas = function (image, source) {
  let rawdata = source.rawdata;
  let pixeldata = source.uint8Data;
  let ny = image.ny;
  let nx = image.nx;
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
        pixeldata[pixindex + 1] = 0;
        pixeldata[pixindex + 2] = 0;
        pixeldata[pixindex + 3] = 255;
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
        pixeldata[pixindex] = 0;
        pixeldata[pixindex + 1] = scaledval;
        pixeldata[pixindex + 2] = 0;
        pixeldata[pixindex + 3] = 255;
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
        pixeldata[pixindex] = 0;
        pixeldata[pixindex + 1] = 0;
        pixeldata[pixindex + 2] = 0;
        pixeldata[pixindex + 3] = scaledval;
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
      pixeldata[i + 1] = pixeldataRed[i + 1];
      pixeldata[i + 3] = pixeldataRed[i + 2];
      pixeldata[i + 3] = 255;
    }
    break;
  }
  source.ctx.putImageData(source.imageData, 0, 0);
};

let copyOffscreenCanvas = function (image, source) {
  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  image.ctx.transferFromImageBitmap(bitmap);
};

// brightnessRedSlider.addEventListener('input', e => {
//   redBrightness = e.target.valueAsNumber;
//   renderCanvasRed(canvasred, redRawData, redMin, redMax);
// });
//
// brightnessRedSlider.addEventListener('change', e => {
//   renderCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
// });

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
