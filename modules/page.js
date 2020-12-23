/*jshint esversion: 6 */
/*global app  */

// https://stackoverflow.com/questions/38127416/is-it-possible-to-destructure-instance-member-variables-in-a-javascript-construc

import CanvasImages from './canvas-images.js';
import events from './events.js';
import router from '../router.js';
import colorMaps from './render/colorMaps.js';
import specialEffects from './render/specialEffects.js';
import adjustImage from './render/adjustImage.js';
import telescopes from './render/telescopes.js';
import navigation from './render/navigation.js';
import layerHistogram from './layerHistogram.js';
import renderMenu from './render/menu.js';
import renderDev from './render/dev.js';
import splash from './render/splash.js';
import checkBrowser from './check-browser.js';
import logger from './logger.js';

class Page {
  constructor(ctype, page) {
    this.type = ctype;
    this.category = app.categories.find(c => c.type == ctype);
    Object.assign(this, page);
    this.image.selectedSourceNumber = this.image.selectedSourceNumber || 0;
    this.id = `page-${this.type}-${this.name}`;
    this.registeredCallbacks = [];
    let html = this.generateHtml();
    this.content = html;
    if (checkBrowser()) {
      this.render();
      splash.hide();
    } else {
      splash.hide();
    }
  }

  close() {
    this.canvasImages.close();
  }

  get selectedSource() {
    return this.image.sources[this.image.selectedSourceNumber];
  }

  get selectedSourceNumber() {
    return this.image.selectedSourceNumber;
  }

  get content() {
    return document.getElementById("content").innerHTML;
  }

  set content(html) {
    document.getElementById("content").innerHTML = html;
  }

  get telescopes() {
    let telescopes = [];
    this.image.about.telescopes.forEach(tkey => {
      telescopes.push(app.telescopeData.telescopes.find(t => t.key == tkey));
    });
    return telescopes;
  }

  generateHtml() {
    [this.telescopeHtmls, this.telescopeHtmlModals] = telescopes.render(this, this.registeredCallbacks);
    this.leftColumnHtml = '';
    this.mainImageHtml = '';
    this.rightColumnHtml = `
        ${this.telescopeHtmls}
        <div id="dev-right">
          ${layerHistogram.render(this.selectedSource)}
          ${this.renderimageSize(this, this.registeredCallbacks)}
        </div>
    `;

    switch (this.type) {

    case 'rgb':
    case 'multi-wave':
      this.leftColumnHtml = `
          <div class='col-3 pr-1 m-0'>
            ${this.renderImageSelectFilterLayerToAdjust()}
            ${this.renderImageLayerPreview()}
            ${adjustImage.renderRGB(this, this.registeredCallbacks)}
          </div>
        `;
      this.mainImageHtml = `
          ${this.renderMainImageContent(this, this.type, this.registeredCallbacks)}
        `;
      break;

    case 'masterpiece':
      this.leftColumnHtml = `
        <div class='col-3 pr-1 m-0'>
          ${colorMaps.render(this, this.registeredCallbacks)}
          ${specialEffects.render(this, this.registeredCallbacks)}
          ${adjustImage.renderMasterpiece(this, this.registeredCallbacks)}
        </div>
      `;
      this.mainImageHtml = `
          ${this.renderMainImageContent(this, this.type, this.registeredCallbacks)}
        `;
      break;
    }

    let html = `
      <div id='${this.id}' class='activity-page row' data-categorytype="${this.type}" data-pagename="${this.name}">
        <div class="col-10">

          ${this.renderPageHeader(this)}
          <div class="row">
            ${this.leftColumnHtml}
            ${this.mainImageHtml}
          </div>
        </div>
        <div class="col-2 d-flex flex-column justify-content-start">
          <div class="shrinking-spacer"></div>
          ${this.rightColumnHtml}
        </div>
      </div>
      ${navigation.page(this.registeredCallbacks)}
      ${this.telescopeHtmlModals}
    `;
    return html;
  }

  render() {
    events.setupGlobal(this);
    switch (this.type) {

    case 'rgb':
    case 'multi-wave':
      this.canvasImages = new CanvasImages(this.image, this.type);
      this.canvasImages.renderPalettes();
      this.controllerImageSelectFilterLayerToAdjust();
      this.controllerImageSelectMainLayer();
      adjustImage.update(this);
      break;

    case 'masterpiece':
      this.canvasImages = new CanvasImages(this.image, this.type);
      this.canvasImages.renderColorMaps();
      break;
    }

    this.registeredCallbacks.forEach(func => func());
    document.getElementById('btn-back').addEventListener('click', () => {
      renderMenu.page(this.type);
    });
    router.updateHash(`run/${this.type}/${this.name}`);
  }

  //
  // Component rendering ...
  //

  renderimageSize(page, registeredCallbacks) {
    let { nx, ny } = page.image.dimensions[page.image.size];
    let id = 'image-stats';
    registeredCallbacks.push(callback);
    return `
      <div id = "${id}" class='developer'>
      </div>
    `;

    function callback() {
      let elem = document.getElementById(id);
      let size = document.createTextNode(`Image size: ${nx} x ${ny}`);
      elem.append(size);
    }
  }

  renderPageHeader() {
    return `
      <div class='row page-header'>
        <div class='col-8 p-0'>
          <div class='page-title'>${this.category.title}</div>
          <div class='page-subtitle'>${this.subtitle}</div>
        </div>
      </div>
    `;
  }

  controllerImageSelectFilterLayerToAdjust() {
    let layerNum = this.selectedSourceNumber;
    let elem = document.getElementById("image-select-filter-layer-to-adjust");
    elem.addEventListener('change', (e) => {
      var layerNum = Number(e.target.value);
      this.image.selectedSourceNumber = layerNum;
      adjustImage.update(this);
      this.canvasImages.renderPreview(this.selectedSource);
      logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    });
    if (typeof layerNum == 'number') {
      elem.querySelector(`[value='${layerNum}']`).checked = true;
      this.image.selectedSourceNumber = layerNum;
    }
  }

  renderImageSelectFilterLayerToAdjust() {
    function renderButtonsAndPalletes(p) {
      let sources = p.image.sources;
      let html = '';
      for (var i = 0; i < sources.length; i++) {
        let source = sources[i];
        if (source.type == "rawdata") {
          html += `
            <div class='row select-filter'>
              <div class="col-1 d-flex align-items-center p-0">
                <input id='select-rgb-${i}' type='radio' name='select-rgb' value='${i}'>
              </div>
              <div class="col-3 d-flex justify-content-start align-items-center">
                <label for='select-rgb-${i}'>${source.name}</label>
              </div>
              <div class="col-8 filter-palette d-flex align-items-center">
                ${p.renderPalette(source, i)}
              </div>
            </div>
          `;
        }
      }
      return html;
    }

    return `
      <div id="image-select-filter-layer-to-adjust"  class='control-collection select-layer'>
        <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${this.selectfiltertext}</div>
        ${renderButtonsAndPalletes(this)}
      </div>
    `;
  }

  renderPalette(source, i) {
    return `
      <canvas id="palette-${source.filter}-${i}"></canvas>
    `;
  }

  renderImageLayerPreview() {
    return `
      <div id="preview-image-canvas-container" class="row d-flex justify-content-center">
      </div>
    `;
  }

  renderMainImageContent() {
    let id2 = 'main-image-canvas-container';
    let optionalFunc = function () {
      // images.resizeCanvas(this.image.destinations.main.canvas, this.image.nx, this.image.ny);
    };
    return `
      <div id='main-image-content' class='main-image-content col-9 justify-content-center'>
        <div id='${id2}' class="row d-flex justify-content-center align-items-center">
          ${renderDev.fullScreenButton(id2, '#main-image-content', this.registeredCallbacks, optionalFunc)}
          ${this.renderSpinner()}
        </div>
        ${this.renderUnderMainImageRow(this.type, this.registeredCallbacks)}
        <span class="touchinfo hidden">Use your fingers to zoom and move the image<br>(touch to hide this tooltip)</span>
      </div>
    `;
  }

  renderSpinner() {
    let html = `
      <div id="loading-spinner" class="hide d-flex justify-content-center align-items-center">
        <div class="spinner-border text-secondary" role="status">
          <span class="sr-only"></span>
        </div>
      </div>
    `;
    return html;
  }

  controllerImageSelectMainLayer() {
    let checkboxes;
    let elem = document.getElementById("image-select-main-layer");
    elem.addEventListener('change', (e) => {
      checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"'));
      this.image.selectedMainLayers = checkboxes.map(elem => elem.checked ? '1' : '0').join('');
      this.canvasImages.renderCanvasRGB();
    });
  }

  renderUnderMainImageRow() {
    let id = 'under-main-image-row';
    let underImageRow = '';
    switch (this.type) {
    case 'rgb':
    case 'multi-wave':
      underImageRow = this.renderUnderMainImageRGBLayerSelectors();
      break;
    case 'masterpiece':
      underImageRow = this.renderUnderMainImageMasterpiece();
      break;
    }

    return `
      <div id="${id}" class="d-flex flex-row justify-content-between">
        ${underImageRow}
      </div>
    `;
  }

  renderUnderMainImageRGBLayerSelectors() {
    let sources = this.image.sources;
    let source, checkedState, name;
    let html = `
      <div class="subtitle pe-4">
        <span class="solid-right-arrow">&#11157</span>
        Combine to reveal a full-color image
      </div>
      <form id="image-select-main-layer">
        <div class="d-flex flex-row justify-content-start align-items-center">
    `;
    for (var i = 0; i < sources.length; i++) {
      source = sources[i];
      checkedState = this.image.selectedMainLayers[i] == "1" ? "checked" : "";
      if (source.type == "rawdata") {
        name = source.name;
        html += `
          <div class="select-layer">
            <label class="pe-2" for='select-layer-${name}'>${name}</label>
            <input type='checkbox' id='select-layer-${name}' name='select-layer-${name}' ${checkedState} value='0'>
          </div>
        `;
      }
    }
    html += `
        </div>
      </form>
      <div class="image-name pe-2">
        ${this.image.name}
      </div>
    `;
    return html;
  }

  renderUnderMainImageMasterpiece() {
    let html = '';
    html += `
      <div class="pe-4"><span class="solid-right-arrow">&#11157</span> Pinch to zoom or pan or use the buttons</div>
      <form id="image-select-main-layer">
        <div class="d-flex flex-row justify-content-start align-items-center">
          ${this.renderScalingButtons()}
        </div>
      </form>
      <div class="image-name pe-2">
        ${this.image.name}
      </div>
    `;
    return html;
  }

  renderScalingButtons() {
    let zoomIn = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-in" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
      <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
      <path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/>
    </svg>`;

    let zoomOut = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-out" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
      <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
      <path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
    </svg>`;

    let zoomReset = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-app" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11 2H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM5 1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4H5z"/>
    </svg>`;

    let html = '';
    html += `
      <div class="scale button-group d-flex">
        <button id="zoomin" type="button" class="scale btn btn-outline-primary" data-scale="zoomin">
          ${zoomIn}
        </button>
        <button id="zoomout" type="button" class="scale btn btn-outline-primary" data-scale="zoomout" disabled>
          ${zoomOut}
        </button>
        <button id="zoomreset" type="button" class="scale btn btn-outline-primary" data-scale="zoomreset" disabled>
          ${zoomReset}
        </button>
      </div>
    `;
    return html;
  }
}

export default Page;
