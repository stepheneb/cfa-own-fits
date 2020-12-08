/*jshint esversion: 6 */

// Activity page

import images from '../images.js';
import events from '../events.js';
import layerHistogram from '../layerHistogram.js';
import renderDev from './dev.js';
import renderUtil from './util.js';
import splash from './splash.js';
import logger from '../logger.js';
import checkBrowser from '../checkBrowser.js';

let renderActivity = {};

renderActivity.page = (category, page) => {
  splash.hide();
  window.location.hash = `run/${category.type}/${page.name}`;
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
          ${layerHistogram.render(renderUtil.getSelectedSource(page))}
        </div>
      </div>
    </div>
    ${renderPageNavigation()}
  `;
  document.getElementById("content").innerHTML = html;
  events.setupGlobal();
  page.image.destinations = {
    main: {
      canvas: document.getElementById("main-image-canvas")
    },
    preview: {
      canvas: document.getElementById('image-layer-preview'),
      img: document.getElementById('image-layer-preview')
    }
  };
  images.init(page.image, page.image.destinations.preview);
  if (checkBrowser()) {
    images.get(page);
    controllerImageSelectFilterLayerToAdjust(page);
    controllerImageAdjustFilterLayer(page);
    updateImageAdjustFilterLayer(page);
    controllerImageSelectMainLayer(page);
  }
  document.getElementById('btn-back').addEventListener('click', event => {
    window.location.hash = `menu/${category.type}`;
  });
  app.hashRendered = window.location.hash;
};

//
// Component rendering ...
//

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

let controllerImageSelectFilterLayerToAdjust = (page) => {
  let layerNum = page.image.selectedSource;
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
  let source = page.image.sources[layerNum];
  images.renderOffscreen(source, page.image.nx, page.image.ny);
  images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
  updateImageAdjustFilterLayer(page);
  logger.imageData(source);
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
    <div id="preview-image-canvas-container" class="row d-flex justify-content-center">
      <canvas id='image-layer-preview'></canvas>
    </div>
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
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

  let elemContrast = document.getElementById("contrast");
  elemContrast.addEventListener('input', (e) => {
    let source = renderUtil.getSelectedSource(page);
    source.contrast = e.target.valueAsNumber;
    let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
    source.max = source.originalMax - contrastShift;
    source.min = Math.max(0, source.originalMin + contrastShift);
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

  let elemScaling = document.getElementById("select-scaling");
  elemScaling.addEventListener('change', (e) => {
    let source = renderUtil.getSelectedSource(page);
    source.scaling = event.target.value;
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

};

let updateImageAdjustFilterLayer = page => {
  let source = renderUtil.getSelectedSource(page);
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let elemScaling = document.getElementById("select-scaling");
  let radios = elemScaling.elements.scaling;
  radios.value = source.scaling;
};

let renderImageAdjustFilterLayer = page => {
  let source = renderUtil.getSelectedSource(page);;
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

      <div class='row'>
        <div class='col-4'>
          <label class="pl-2">Scaling</label>
        </div>
        <form id="select-scaling" class="d-flex flex-row justify-content-start">
          <div class="select-scaling-label">
            <label for="select-scaling-linear">Linear</label>
          </div>
          <div class="select-scaling-radio">
            <input id="select-scaling-linear" type="radio" name="scaling" value="linear">
          </div>
          <div class="select-scaling-label">
            <label for="select-scaling-log">Log</label>
          </div>
          <div class="select-scaling-radio">
            <input id="select-scaling-log" type="radio" name="scaling" value="log">
          </div>
        </form>
      </div>
    </div>
  `;
};

let renderMainImageContent = page => {
  return `
    <div class='main-image-content'>
      <div id="main-image-canvas-container" class="row d-flex justify-content-center">
        <canvas id='main-image-canvas'></canvas>
      </div>
      ${renderUnderMainImageRow(page)}
    </div>
  `;
};

let controllerImageSelectMainLayer = page => {
  let elem = document.getElementById("image-select-main-layer");
  elem.addEventListener('change', (e) => {
    let checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"'));
    page.image.selectedMainLayers = checkboxes.map(elem => elem.checked ? '1' : '0').join('');
    images.renderMain(page.image);
  });
};

let renderUnderMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start mt-2">
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
    let checkedState = page.image.selectedMainLayers[i] == "1" ? "checked" : "";
    if (source.type == "rawdata") {
      let name = source.name;
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
      ${renderDev.fullScreenButton()}
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

export default renderActivity;
