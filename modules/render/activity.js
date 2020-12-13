/*jshint esversion: 6 */

// Activity page

import images from '../images.js';
import events from '../events.js';
import router from '../router.js';
import telescopes from './telescopes.js';
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
  splash.hide();
  let registeredCallbacks = [];
  let id = `page-${category.type}-${page.name}`;
  let [telescopeHtmls, telescopeHtmlModals] = telescopes.render(page, registeredCallbacks);
  let leftColumnHtml = '';
  let mainImageHtml = '';
  let rightColumnHtml = `
    <div class='col-2'>
      ${telescopeHtmls}
      ${layerHistogram.render(renderUtil.getSelectedSource(page))}
    </div>
  `;
  switch (category.type) {
  case 'rgb':
  case 'multi-wave':
    leftColumnHtml = `
        <div class='col-3'>
          ${renderImageSelectFilterLayerToAdjust(page)}
          ${renderImageLayerPreview(page)}
          ${renderImageAdjustFilterLayer(page)}
        </div>
      `;
    mainImageHtml = `
        <div class='col-7'>
          ${renderMainImageContent(page, category.type, registeredCallbacks)}
        </div>
      `;
    break;
  case 'masterpiece':
    leftColumnHtml = `
      <div class='col-3'>
        ${renderColorMaps(page, registeredCallbacks)}
        ${renderSpecialEffects(page, registeredCallbacks)}
        ${renderImageAdjustFilterLayer(page)}
      </div>
    `;
    mainImageHtml = `
        <div class='col-7'>
          ${renderMainImageContent(page, category.type, registeredCallbacks)}
        </div>
      `;
    break;
  }

  let html = `
    <div id='${id}' class='activity-page'
      data-categorytype="${category.type}"
      data-pagename="${page.name}">
      ${renderPageHeader(page)}

      <div class='row'>
          ${leftColumnHtml}
          ${mainImageHtml}
          ${rightColumnHtml}
      </div>
    </div>
    ${navigation.page(registeredCallbacks)}
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

  switch (category.type) {
  case 'rgb':
  case 'multi-wave':
    images.init(page.image, page.image.destinations.preview);
    if (checkBrowser()) {
      images.get(page, category.type);
      controllerImageSelectFilterLayerToAdjust(page);
      controllerImageAdjustFilterLayer(page);
      updateImageAdjustFilterLayer(page);
      controllerImageSelectMainLayer(page);
      images.renderPalettes(page);
    }
    break;
  case 'masterpiece':
    images.init(page.image);
    if (checkBrowser()) {
      images.get(page, category.type);
    }
    break;
  }

  registeredCallbacks.forEach(func => func());
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
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.selectfiltertext}</div>
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

let renderColorMaps = (page, registeredCallbacks) => {
  let id, elem;
  let cmaps = [
    ['grey', 'plasma'],
    ['rainbow', 'firesky'],
    ['inferno', 'watermelon'],
    ['bluegreen', 'red'],
    ['cool', 'green'],
    ['magma', 'blue'],
  ];
  let getId = cmap => `select-cmap-${cmap}`;
  let cmapsHtml = '';
  cmaps.forEach(row => {
    cmapsHtml += '<div class="row select-cmap">';
    row.forEach(cmap => {
      id = getId(cmap);
      cmapsHtml += `
        <div id="${id}" class="col-6 d-flex align-items-center" data-cmap="${id}">
          <div>${cmap}</div>
        </div>
      `;
    });
    cmapsHtml += '</div>';
  });
  let html = `
    <div class='control-collection color-maps'>
      <div class='title'>Color Maps</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Select a color range to add color to your image</div>
      ${cmapsHtml}
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    cmaps.forEach(row => {
      row.forEach(cmap => {
        id = getId(cmap);
        elem = document.getElementById(id);
        elem.addEventListener('click', event => {
          event.stopPropagation();
          let id = event.currentTarget.dataset.cmap;
          console.log(`${id} clicked`);
        });
      });
    });
  }
};

let renderSpecialEffects = (page, registeredCallbacks) => {
  let id, elem;
  let effects = [
    ['lighten', 'reduce noise'],
    ['blur', 'emboss'],
    ['sharpen', 'invert']
  ];
  let effectsHtml = '';
  let getId = effect => `select-effect-${effect}`;
  effects.forEach(row => {
    effectsHtml += '<div class="row special-effects">';
    row.forEach(effect => {
      id = getId(effect);
      effectsHtml += `
        <div id='${id}' class="col-6 d-flex align-items-center" data-effect="${id}">
          <input type='checkbox' name='select-effect' value='${id}'>
          <label for='${id}'>${effect}</label>
        </div>
      `;
    });
    effectsHtml += '</div>';
  });
  let html = `
    <div class='control-collection special-effects'>
      <div class='title'>Special Effects</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Try an effect to enhance your image</div>
      ${effectsHtml}
      </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    effects.forEach(row => {
      row.forEach(effect => {
        id = getId(effect);
        elem = document.getElementById(id);
        elem.addEventListener('change', event => {
          event.stopPropagation();
          let id = event.currentTarget.dataset.effect;
          console.log(`${id} clicked`);
        });
      });
    });
  }
};

let renderImageAdjustFilterLayer = page => {
  let source = renderUtil.getSelectedSource(page);
  return `
    <div class='control-collection adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
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

let renderMainImageContent = (page, categoryType, registeredCallbacks) => {
  let id2 = 'main-image-canvas-container';
  let optionalFunc = () => {
    images.resizeCanvas(page.image.destinations.main.canvas, page.image.nx, page.image.ny);
  };
  return `
    <div id='main-image-content' class='main-image-content'>
      <div id='${id2}' class="row d-flex justify-content-center">
        <canvas id='main-image-canvas'></canvas>
        ${renderDev.fullScreenButton(id2, '#main-image-content', registeredCallbacks, optionalFunc)}
      </div>
      ${renderUnderMainImageRow(page, categoryType, registeredCallbacks)}
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

let renderUnderMainImageRow = (page, categoryType, registeredCallbacks) => {
  let id = 'under-main-image-row';
  let source = renderUtil.getSelectedSource(page);
  let underImageRow = '';
  switch (categoryType) {
  case 'rgb':
  case 'multi-wave':
    underImageRow = renderUnderMainImageRGBLayerSelectors(page);
    break;
  case 'masterpiece':
    underImageRow = renderUnderMainImageMasterpiece(page);
    break;
  }

  return `
    <div id="${id}" class="d-flex flex-row justify-content-start">
      ${underImageRow}
    </div>
  `;
};

let renderUnderMainImageRGBLayerSelectors = page => {
  let sources = page.image.sources;
  let html = `
    <div class="pe-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
    <form id="image-select-main-layer">
      <div class="d-flex flex-row justify-content-start align-items-center">
  `;
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
  html += `
      </div>
    </form>
    <div class="image-name ps-2 pe-2 ms-auto">
      ${page.image.name}
    </div>
  `;
  return html;
};

let renderUnderMainImageMasterpiece = page => {
  let sources = page.image.sources;
  let html = '';
  html += `
    <div class="pe-4"><span class="solid-right-arrow">&#11157</span> Pinch to zoom or pan or use the buttons</div>
    <form id="image-select-main-layer">
      <div class="d-flex flex-row justify-content-start align-items-center"></div>
    </form>
    <div class="image-name ps-2 pe-2 ms-auto">
      ${page.image.name}
    </div>
  `;
  return html;
};

export default renderActivity;
