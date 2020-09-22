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
    page.image.selectedSource = 0;
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
    ${renderPageNavigation(page)}
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
  copyOffscreenCanvasToDestination(page.image.sources[layerNum], page.image.destinations.main, page.image.destinations.preview);
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
                <div class=''>
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
  // return `
  //   <image id='image-layer-preview' class='image-layer-preview'></image>
  // `;
};

let renderImageAboutTelescope = page => {
  return `
    <div>These images were taken with the</div>
    <div class="about-telescope">${page.image.about.telescope} Telescope</div>
    <canvas class='image-about-telescope'></canvas>
  `;
};

let controllerImageAdjustFilterLayer = page => {
  let elem = document.getElementById("brightness");
  elem.addEventListener('input', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    let brightness = e.target.valueAsNumber;
    source.brightness = brightness;
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToDestination(source, page.image.destinations.main, page.image.destinations.preview);
  });
};

let updateImageAdjustFilterLayer = page => {
  let source = page.image.sources[page.image.selectedSource];
  let elem = document.getElementById("brightness");
  elem.value = source.brightness;
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

let renderMainImageContent = page => {
  return `
    <div class='main-image-content'>
      <canvas id='main-image-canvas' class='page-image'></canvas>
      ${renderUnderMainImageRow(page)}
    </div>
  `;
};

let renderUnderMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start">
      <div class="pr-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
      <form>
        <div class="d-flex flex-row justify-content-start">
          <div class="select-layer-label">
            <label for='select-layer-red'>Red</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-red' name='select-layer-red' value='Red' disabled>
          </div>
          <div class="select-layer-label">
            <label for='select-layer-green'>Green</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-green' name='select-layer-green' value='Green' disabled>
          </div>
          <div class="select-layer-label">
            <label for='select-layer-blue'>Blue</label>
          </div>
          <div class="select-layer-checkbox">
            <input type='checkbox' id='select-layer-blue' name='select-layer-blue' value='Blue' disabled>
          </div>
        </div>
      </form>
      <div class="image-name pl-2 pr-2 ml-auto">
        ${page.image.name}
      </div>
    </div>
  `;
};

let renderImageSelectMainLayer = () => {
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

let renderImageSelectMainLayers = () => {
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
      <div class="pl-1 pr-1" style="display: none">
        <button type="button" id="btn-forward" class="btn btn-outline-primary btn-small page-navigation-button">Forward &nbsp&#9654</button>
      </div>
      <div class="pl-1 pr-1 ml-auto">
        <button type="button" id="btn-toggle-fullscreen" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Full Screen</button>
      </div>
    </div>
  `;
};

//
// Image fetching and rendering ...
//

let getImages = page => {
  let source = page.image.sources[0];
  fetchImage(page, source, renderFuncFetchImageFirstSource);
  for (var s = 1; s < page.image.sources.length; s++) {
    source = page.image.sources[s];
    if (source.type == "rawdata") {
      fetchImage(page, source, renderFuncFetchImageSubsequentSource);
    }
  }
};

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
      renderFunc(page.image, source, page.image.nx, page.image.ny);

    })
    .catch(e => {
      console.log('There has been a problem with your fetch operation: ' + e.message);
    });
};

let initializeCanvasDestinations = (image) => {
  initializeCanvasForUseWithOffScreenTransfer(image.destinations.main, image.nx, image.ny);
  // initializeCanvasForUseWithOffScreenTransfer(image.destinations.preview, image.nx, image.ny);
};

let renderFuncFetchImageFirstSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
  copyOffscreenCanvasToDestination(source, image.destinations.main, image.destinations.preview);
  // copyOffscreenCanvasToDestination(source, image.destinations.preview);
};

let renderFuncFetchImageSubsequentSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
};

let initializeCanvas = function (destination, nx, ny) {
  let canvas = destination.canvas;
  destination.ctx = canvas.getContext('2d');
  destination.ctx.fillStyle = "rgb(0,0,0)";
  destination.ctx.imageSmoothingEnabled = true;
  destination.ctx.globalCompositeOperation = "source-over";
  // destination.canvas.width = nx;
  // destination.canvas.height = ny;
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
  source.ctx.fillStyle = "rgb(0,0,0)";
  source.ctx.imageSmoothingEnabled = true;
  source.ctx.globalCompositeOperation = "source-over";
  source.imageData = source.ctx.getImageData(0, 0, nx, ny);
  source.uint8Data = source.imageData.data;
  source.offscreenCanvas.width = nx;
  source.offscreenCanvas.height = ny;
};

let renderAndCopyOffscreenCanvasToDestination = function (source, destination, nx, ny, preview) {
  renderOffscreenCanvas(source, nx, ny);
  copyOffscreenCanvasToDestination(source, destination, preview);
};

let copyOffscreenCanvasToDestination = function (source, destination, preview) {

  let { width, height } = preview.canvas.getBoundingClientRect();
  let resizeHeight = height;
  let resizeWidth = height * 26 / 25;
  let imageData = new ImageData(source.uint8Data, 2600, 2500);
  let bitmapP2 = createImageBitmap(imageData, 0, 0, 2600, 2500, { resizeWidth: resizeWidth, resizeHeight: resizeHeight });

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

  // let px = preview.canvas.width;
  // let py = preview.canvas.height;

  // let blobPromise = source.offscreenCanvas.convertToBlob();

  // createImageBitmap(source.offscreenCanvas, 0, 0, { resizeWidth: 300 })
  //   .then(smallbitmap => {
  //     preview.ctx.drawImage(smallbitmap, 0, 0);
  //     // preview.img.src = URL.createObjectURL(smallbitmap);
  //   });

  // preview.img.src = URL.createObjectURL(smallbitmap);
  // bitmapPromise.then(bitmap => {
  //   preview.img.src = URL.createObjectURL(blob);
  // });

  // blobPromise = source.offscreenCanvas.convertToBlob();
  // blobPromise.then(blob => {
  //   // preview.ctx.drawImage(b, 0, 0);
  //   // var img = document.body.appendChild(new Image());
  //   let x = blob;
  //   preview.img.src = URL.createObjectURL(blob);
  // });
};

let renderOffscreenCanvas = function (source, nx, ny) {
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
        pixeldata[pixindex + 2] = scaledval;
        pixeldata[pixindex + 3] = 255;
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
      pixeldata[i + 3] = 255;
    }
    break;
  }
  source.ctx.putImageData(source.imageData, 0, 0);
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

//
// Utilities
//

const forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];

  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    min = (value < min) ? value : min;
    max = (value > max) ? value : max;
  }

  return [min, max];
};
