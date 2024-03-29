/*jshint esversion: 6 */
/*global app  defaultApp */
/*global bootstrap  */

// https://stackoverflow.com/questions/38127416/is-it-possible-to-destructure-instance-member-variables-in-a-javascript-construc

import CanvasImages from './canvas-images.js';
import ImageInspect from './image-inspect.js';
import events from './events.js';
import router from '../router.js';
import colorMaps from './render/colorMaps.js';
import animate from './render/animate.js';
import specialEffects from './render/specialEffects.js';
import adjustImage from './render/adjustImage.js';
import telescopes from './render/telescopes.js';
import saveAndSend from './render/saveAndSend.js';
import observation from './render/observation.js';
import navigation from './render/navigation.js';
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
    this.id = `page-${this.type}-${this.name}`;
    this.registeredCallbacks = [];

    let mb_elems = document.getElementsByClassName('modal-backdrop');
    while (mb_elems.length > 0) {
      var mb = mb_elems[0];
      mb.parentNode.removeChild(mb);
    }

    if (this.type == "observation") {
      this.content = this.generateObservationHtml();
    } else {
      this.image.selectedSourceNumber = this.image.selectedSourceNumber || 0;
      this.content = this.generateHtml();
    }
    if (checkBrowser()) {
      this.render();
      splash.hide();
    } else {
      splash.hide();
    }
  }

  reset() {
    let category = defaultApp.categories.find(c => c.type == this.type);
    let page = category.pages.find(p => p.name == router.path.page);
    let sources = page.image.sources;
    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];
      if (source.type == 'rawdata') {
        let sourceInUse = this.image.sources[i];
        for (let key of source.defaultValues.keys) {
          let currentValue = sourceInUse[key];
          let defaultValue = source.defaultValues[key];
          if ((defaultValue !== undefined) && defaultValue !== currentValue) {
            sourceInUse[key] = defaultValue;
            sourceInUse.changed = true;
          }
        }
        source.range = source.max - source.min;
      }
    }
    this.updateAll();
  }

  updateAll() {
    this.updateImageSelectFilterLayer();
    for (var i = 0; i < this.image.sources.length; i++) {
      let source = this.image.sources[i];
      if (source.type == 'rawdata' && source.changed) {
        this.canvasImages.clearCanvas(source);
        adjustImage.renderRGBUpdate(this, source);
      }
    }
    adjustImage.renderRGBUpdate(this, this.selectedSource);
    logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    if (app.dev) {
      this.imageInspect.reset();
    }
  }

  close() {
    this.canvasImages.close();
    this.animate = null;
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

  get saveandsend() {
    let saveandsend;
    return saveandsend;
  }

  get observation() {
    let observation;
    return observation;
  }

  generateObservationHtml() {
    [this.observationModalElemHtml, this.observationModalElemId] = observation.render(this, this.registeredCallbacks);
    let html = `
      ${this.observationModalElemHtml}
      ${navigation.page(this.registeredCallbacks)}
    `;
    return html;
  }

  generateHtml() {
    [this.telescopeHtmls, this.telescopeHtmlModals] = telescopes.render(this, this.registeredCallbacks);
    [this.saveAndSend, this.saveAndSendModals] = saveAndSend.render(this, this.registeredCallbacks);
    this.leftColumnHtml = '';
    this.mainImageHtml = '';
    this.rightColumnHtml = `
        ${this.telescopeHtmls}
        <div id="column-middle-spacer"></div>
        ${this.saveAndSend}
    `;

    switch (this.type) {

    case 'find-apollo':
      this.leftColumnHtml = `
        <div class='col-3 pr-1 m-0'>
          ${this.renderApolloLandingLeftColumn()}
        </div>
      `;
      this.mainImageHtml = `
          ${this.renderMainImageContent(this, this.type, this.registeredCallbacks)}
        `;
      break;

    case 'rgb':
      this.leftColumnHtml = `
          <div class='col-3 pr-1 m-0'>
            ${this.renderImageSelectFilterLayerToAdjust()}
            ${this.renderImageLayerPreview()}
            ${adjustImage.renderRGB(this, this.registeredCallbacks)}
            <div class="control-collection">
              <div class="context">${this.context}</div>
            </div>
          </div>
        `;
      this.mainImageHtml = `
          ${this.renderMainImageContent(this, this.type, this.registeredCallbacks)}
        `;
      break;

    case 'multi-wave':
      this.leftColumnHtml = `
            <div class='col-3 pr-1 m-0'>
              ${this.renderImageSelectFilterLayerToAdjust()}
              ${this.renderImageLayerPreview()}
              ${adjustImage.renderRGB(this, this.registeredCallbacks)}
              <div class="control-collection">
                <div class="context">${this.context}</div>
              </div>
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
          <div class="control-collection">
            <div class="context">${this.context}</div>
          </div>
        </div>
      `;
      this.mainImageHtml = `
          ${this.renderMainImageContent(this, this.type, this.registeredCallbacks)}
        `;
      break;

    case 'animate':
      this.leftColumnHtml = `
            <div class='left-column col-3 pr-1 m-0'>
              <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${this.animatetext}</div>
              ${animate.render(this, this.registeredCallbacks)}
              <div class="control-collection">
                <div class="context">${this.context}</div>
              </div>
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
      ${this.saveAndSendModals}
      ${renderDev.developerToolsSideBar()}
    `;
    return html;
  }

  render() {
    events.setupGlobal(this);

    switch (this.type) {

    case 'rgb':
    case 'multi-wave':
      this.imageInspect = new ImageInspect();
      this.canvasImages = new CanvasImages(this, this.image, this.type);
      this.canvasImages.renderPalettes();
      this.controllerImageSelectFilterLayerToAdjust();
      this.controllerImageSelectMainLayer();
      this.renderDevSideBar(this, this.registeredCallbacks);
      adjustImage.update(this);
      break;

    case 'find-apollo':
      this.canvasImages = new CanvasImages(this, this.image, this.type, this.findApolloSiteContainerId, this.findApolloSiteCanvasId);
      break;

    case 'masterpiece':
      this.imageInspect = new ImageInspect();
      this.canvasImages = new CanvasImages(this, this.image, this.type);
      this.canvasImages.renderColorMaps();
      this.renderDevSideBar(this, this.registeredCallbacks);
      break;

    case 'animate':
      this.canvasImages = new CanvasImages(this, this.image, this.type);
      break;

    case 'observation':
      this.observationModalElem = document.getElementById(this.observationModalElemId);
      // bootstrap.Modal.getInstance(this.observationModalElem).show();
      this.observationModalElem.addEventListener('hidden.bs.modal', () => {
        renderMenu.page(this.type);
      });
      break;
    }

    // run callbacks registered after interactive components are rendered
    this.registeredCallbacks.forEach(func => func(this));

    document.getElementById('btn-back').addEventListener('click', () => {
      if (this.type == "observation") {
        bootstrap.Modal.getInstance(this.observationModalElem).hide();
      } else {
        renderMenu.page(this.type);
      }
      document.body.classList.remove('nofadeout');
    });

    router.updateHash(`run/${this.type}/${this.name}`);

  }

  renderDevSideBar(page, registeredCallbacks) {
    if (app.dev) {
      this.devSideBar = document.getElementById('developerToolsSideBar');
      this.bsDevSideBar = new bootstrap.Offcanvas(this.devSideBar);
      this.devSideBarBody = document.getElementById('developerToolsSideBar-body');
      this.devSideBarBody.insertAdjacentHTML('beforeend', `
        ${this.imageInspect.render(this, this.registeredCallbacks)}
      `);
      this.bsDevSideBar.show();
      registeredCallbacks.push(callback);
    }

    function callback(page) {
      page.devSideBar.addEventListener('hidden.bs.offcanvas', function () {
        page.imageInspect.disable();
      });
      page.devSideBar.addEventListener('shown.bs.offcanvas', function () {
        if (page.imageInspect.connected && page.imageInspect.inspectChecked() && page.imageInspect.enabled == false) {
          page.imageInspect.enable();
        }
      });

    }
  }

  //
  // Component rendering ...
  //

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

  animationStep(step) {
    let sources = this.canvasImages.rawdataSources;
    let len = sources.length;
    let layerNum = this.selectedSourceNumber;
    layerNum += step;
    if (layerNum >= len) {
      layerNum = 0;
    } else if (layerNum < 0) {
      layerNum = len - 1;
    }
    this.image.selectedSourceNumber = layerNum;
    this.canvasImages.renderPreview(this.selectedSource);
    this.canvasImages.renderCanvasRGB1(this.selectedSource);
    logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
  }

  controllerImageSelectFilterLayerToAdjust() {
    let layerNum = this.selectedSourceNumber;
    let elem = document.getElementById("image-select-filter-layer-to-adjust");
    elem.addEventListener('change', (e) => {
      var layerNum = Number(e.target.value);
      this.image.selectedSourceNumber = layerNum;
      this.updateImageSelectFilterLayer();
    });
    if (typeof layerNum == 'number') {
      elem.querySelector(`[value='${layerNum}']`).checked = true;
      this.image.selectedSourceNumber = layerNum;
    }
  }

  updateImageSelectFilterLayer() {
    adjustImage.update(this);
    if (app.dev) {
      this.imageInspect.connectUpdate(this.canvasImages);
    }
    this.canvasImages.renderPreview(this.selectedSource);
    if (this.type == "multi-wave") {
      let telescopeName = document.getElementById('multi-wave-telescope-name');
      telescopeName.textContent = this.telescopes.find(t => t.key == this.selectedSource.telescope).name;
    }
    if (app.dev) {
      logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
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
    if (this.type == "multi-wave") {
      return `
        <div id="preview-image-container" class="">
          <div id="preview-image-canvas-container" class="row d-flex justify-content-center">
            <div id="multi-wave-telescope-name" class="label">
              ${this.telescopes.find(t => t.key == this.selectedSource.telescope).name}
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div id="preview-image-container" class="">
          <div id="preview-image-canvas-container" class="row d-flex justify-content-center"></div>
        </div>
      `;
    }
  }

  renderApolloLandingLeftColumn() {
    this.findApolloSiteContainerId = `${this.type}-site`;
    this.findApolloSiteCanvasId = `${this.type}-canvas`;
    // let id = `${this.type}-${this.poster}`;
    return `
      <div class='control-collection'>
        <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${this.findtext}</div>
        <div id="${this.findApolloSiteContainerId}" class="${this.type}">
          <canvas id="${this.findApolloSiteCanvasId}"></canvas>
        </div>
        <div class="name">${this.image.site}</div>
        <div class="zoom-preview-content mt-4 mb-2">
          <div class="label">${this.youaretext}</div>
          <div class="zoom-rect-container">
            <div id="preview-image-canvas-container" class="zoomrect"></div>
          </div>
        </div>
        <div class="context">${this.context}</div>
      </div>
    `;
  }

  renderMainImageContent() {
    this.miccCanvasContainerId = 'main-image-canvas-container';
    let optionalFunc = function () {
      // images.resizeCanvas(this.image.destinations.main.canvas, this.image.nx, this.image.ny);
    };
    return `
      <div id='main-image-content' class='main-image-content col-9'>
        <div id="micc-container">
          <div id='${this.miccCanvasContainerId}' class="">
              ${renderDev.fullScreenButton(this.miccCanvasContainerId, '#micc', this.registeredCallbacks, optionalFunc)}
              ${this.renderSpinner()}
          </div>
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
      if (app.dev) {
        this.imageInspect.connectUpdate(this.canvasImages);
      }
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
    case 'find-apollo':
    case 'masterpiece':
      underImageRow = this.renderUnderMainImageMasterpiece();
      break;
    case 'animate':
      underImageRow = this.renderUnderMainImageAnimate();
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

  renderUnderMainImageAnimate() {
    let html = '';
    html += `
      <div class="pe-4"></div>
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
