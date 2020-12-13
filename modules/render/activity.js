/*jshint esversion: 6 */

// Activity page

import images from '../images.js';
import events from '../events.js';
import router from '../router.js';
import navigation from './navigation.js';
import layerHistogram from '../layerHistogram.js';
import renderMenu from './menu.js';
import renderDev from './dev.js';
import renderUtil from './util.js';
import splash from './splash.js';
import logger from '../logger.js';
import checkBrowser from '../checkBrowser.js';

let renderActivity = {};

renderActivity.page = (category, page) => {
  let renderedCallbacks = [];
  splash.hide();
  let [telescopeHtmls, telescopeHtmlModals] = renderImageAboutTelescope(page, renderedCallbacks);
  let html = `
    <div id='page-1' class='activity-page'
      data-categorytype="${category.type}"
      data-pagename="${page.name}">
      ${renderPageHeader(page)}

      <div class='row'>
        <div class='col-3'>
          ${renderImageSelectFilterLayerToAdjust(page)}
          ${renderImageLayerPreview(page)}
          ${renderImageAdjustFilterLayer(page)}
        </div>
        <div class='col-7'>
          ${renderMainImageContent(page, renderedCallbacks)}
        </div>
        <div class='col-2'>
          ${telescopeHtmls}
          ${layerHistogram.render(renderUtil.getSelectedSource(page))}
        </div>
      </div>
    </div>
    ${navigation.page(renderedCallbacks)}
    ${telescopeHtmlModals}
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
    images.renderPalettes(page);
  }
  renderedCallbacks.forEach(func => func());
  document.getElementById('btn-back').addEventListener('click', event => {
    renderMenu.page(category);
  });
  router.updateHash(`run/${category.type}/${page.name}`);
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
    <div id="image-select-filter-layer-to-adjust"  class='control-collection select-layer'>
      <div class='title'><span class="solid-right-arrow">&#11157</span>${page.selectfiltertext}</div>
      ${renderButtonsAndPalletes(page)}
    </div>
  `;

  function renderButtonsAndPalletes(page) {
    let sources = page.image.sources;
    let html = '';
    for (var i = 0; i < sources.length; i++) {
      let source = sources[i];
      if (source.type == "rawdata") {
        html += `
              <div class='row select-filter'>
                <div class="col-4 d-flex align-items-center">
                  <input id='select-rgb-${i}' type='radio' name='select-rgb' value='${i}'>
                  <label for='select-rgb-${i}'>${source.name}</label>
                </div>
                <div class="col-8 filter-palette d-flex align-items-center">
                  ${renderPalette(source, i)}
                </div>
              </div>
            `;
      }
    }
    return html;
  }
};

let renderPalette = (source, i) => {
  return `
    <canvas id="palette-${source.filter}-${i}"></canvas>
  `;
};

let renderImageLayerPreview = page => {
  return `
    <div id="preview-image-canvas-container" class="row d-flex justify-content-center">
      <canvas id='image-layer-preview'></canvas>
    </div>
  `;
};

let renderImageAboutTelescope = (page, registerCallback) => {
  let telescopes = renderUtil.getTelescopes(page);
  let prologue = app.telescopeData.prologue;
  let html = `<div>${prologue}</div>`;
  let modalHtml = '';
  let id, modalId;
  telescopes.forEach(telescope => {
    id = telescope.key;
    modalId = `${id}-modal`;
    html += `
      <div id="${id}" class="telescope-container" data-bs-toggle="modal" data-bs-target="#${modalId}">
        <div class="about-telescope">${telescope.name} Telescope</div>
        <div id="${telescope.key}-container" class="telescope-image-container">
          <img src="${telescope.image}"></img>
        </div>
      </div>
    `;

    modalHtml += `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}-title">About the ${telescope.name} Telescope</h5>
              <div class="image-container">
                <img src="${telescope.image}"></img>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="modal-body">
              ${telescope.description}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-small btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  return [html, modalHtml];
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
  let source = renderUtil.getSelectedSource(page);
  return `
    <div class='control-collection adjust-layer'>
      <div class='title'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      <div class='row adjust-filter'>
        <div class='col-4'>
          <label for='brightness'>Brightness</label>
        </div>
        <div class='col-8 adjust-layer'>
          <input type='range' id='brightness' name='brightness'  min='0' max='${page.image.maximumBrightness}' value='${page.image.maximumBrightness / 2}'
            step='0.05'>
        </div>
      </div>

      <div class=' row adjust-filter'>
        <div class='col-4'>
          <label for='contrast'>Contrast</label>
        </div>
        <div class='col-8'>
          <input type='range' id='contrast' name='contrast' min='0.04' max='1.96' value='1' step='0.01'>
        </div>
      </div>

      <div class='row adjust-filter'>
        <div class='col-4'>
          <label for='color-shift'>Color Shift</label>
        </div>
        <div class='col-8'>
          <input type='range' id='color-shift' name='color-shift' min='0' max='10' value='5' disabled>
        </div>
      </div>

      <div id="scaling-control" class='row developer'>
        <div class='col-4'>
          <label>Scaling</label>
        </div>
        <div class="col-8">
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
    </div>
  `;
};

let renderMainImageContent = (page, renderedCallbacks) => {
  let id2 = 'main-image-canvas-container';
  let optionalFunc = () => {
    images.resizeCanvas(page.image.destinations.main.canvas, page.image.nx, page.image.ny);
  };
  return `
    <div id='main-image-content' class='main-image-content'>
      <div id='${id2}' class="row d-flex justify-content-center">
        <canvas id='main-image-canvas'></canvas>
        ${renderDev.fullScreenButton(id2, '#main-image-content', renderedCallbacks, optionalFunc)}
      </div>
      ${renderUnderMainImageRow(page, renderedCallbacks)}
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

let renderUnderMainImageRow = (page, renderedCallbacks) => {
  let id = 'under-main-image-row';
  let source = renderUtil.getSelectedSource(page);
  return `
    <div id="${id}" class="d-flex flex-row justify-content-start">
      <div class="pe-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
      <form id="image-select-main-layer">
        <div class="d-flex flex-row justify-content-start align-items-center">
          ${renderUnderMainImageLayerSelectors(page)}
        </div>
      </form>
      <div class="image-name ps-2 pe-2 ms-auto">
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



export default renderActivity;
