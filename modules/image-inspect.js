/*jshint esversion: 6 */
/*global bootstrap  */

import layerHistogram from './layerHistogram.js';
import adjustImage from './render/adjustImage.js';
import u from './utilities.js';

class ImageInspect {
  constructor() {
    this.pos = {
      x: 0,
      y: 0
    };
    this.cpos = {
      x: 0,
      y: 0,
      r: 0,
      b: 0,
      g: 0,
      raw: 0,
      ptr: 0
    };
    this.enabled = false;
    this.enableWhenConnected = true;
    this.js9 = {
      x: 0,
      y: 0,
      min: 0,
      max: 3107.1
    };
  }

  render(page, registeredCallbacks) {
    this.page = page;
    this.indicatorId = "inspect-indicator";
    this.indicatorWidth = 16;
    this.indicatorHeight = 16;
    this.indicator = `
      <svg id="${this.indicatorId}" xmlns="http://www.w3.org/2000/svg" width="${this.indicatorWidth}" height="${this.indicatorHeight}" fill="currentColor" class="bi bi-brightness-high" viewBox="0 0 16 16">
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
      </svg>
    `;
    this.indicatorPos = {
      top: 10,
      left: 10
    };
    let html = "";
    let that = this;
    const propsAndIds = [
      ['posxId', 'image-inspect-posx'],
      ['posyId', 'image-inspect-posy'],
      ['cposxId', 'image-inspect-cposx'],
      ['cposyId', 'image-inspect-cposy'],
      ['cposRedId', 'image-inspect-cpos-red'],
      ['cposGreenId', 'image-inspect-cpos-green'],
      ['cposBlueId', 'image-inspect-cpos-blue'],
      ['cposPtrId', 'image-inspect-cpos-ptr'],
      ['layerNameId', 'image-inspect-layer'],
      ['cposRawId', 'image-inspect-cpos-raw'],
      ['rawMinId', 'image-inspect-raw-min'],
      ['rawMaxId', 'image-inspect-raw-max'],
      ['js9posxId', 'image-inspect-js9-posx'],
      ['js9posyId', 'image-inspect-js9-posy'],
      ['js9RawId', 'image-inspect-js9-raw'],
      ['originalImageId', 'original-image'],
      ['rawDataHistogramContainerId', 'raw-data-histogram-container'],
      ['pixelLayerDataHistogramContainerId', 'pixel-data-histogram-container'],
      ['imageStatsId', 'image-stats'],
      ['scalingId', 'scaling-container-id'],
    ];
    for (const e of propsAndIds) {
      this[e[0]] = e[1];
    }

    html = `
      <div class="image-inspect">
        ${originalImage(page, registeredCallbacks)}
        ${rawDataHistogram(page, registeredCallbacks)}
        ${imageSettings(page, registeredCallbacks)}
        ${resetCopyButtons(page, registeredCallbacks)}
        ${pixelLayerDataHistogram(page, registeredCallbacks)}
        ${inspectCheckbox(page, registeredCallbacks)}
        ${inspectPosition(page, registeredCallbacks)}
      </div>
    `;
    registeredCallbacks.push(callback);
    return html;

    function callback() {
      that.imageContainer = document.getElementById(that.page.miccCanvasContainerId);
      that.imageContainerTargetRect = that.imageContainer.getBoundingClientRect();
      that.imageContainer.insertAdjacentHTML('beforeend', that.indicator);
      that.indicatorElem = document.getElementById(that.indicatorId);
    }

    function originalImage(page, registeredCallbacks) {
      registeredCallbacks.push(callback);
      return `
        <div id = "${that.originalImageId}"></div>
      `;

      function callback(page) {
        let { nx, ny } = page.image.dimensions[page.image.size];
        let elem = document.getElementById(that.originalImageId);
        let html = "";
        let source = page.selectedSource;
        let original = source.original;
        if (original) {
          html += `
              <div>Original: <a href="${original.path}" target="_blank" download>${u.getLastItem(original.path)}</a></div>
              <div>Image size: ${nx} x ${ny}</div>
            `;
        }
        elem.innerHTML = html;
      }
    }

    // histogram of R, G, or B pixel data from canvas image for selected source layer
    function pixelLayerDataHistogram(page, registeredCallbacks) {
      registeredCallbacks.push(callback);
      return `
          <div id = "${that.pixelLayerDataHistogramContainerId}">
            <div class="d-flex flex-row justify-content-between align-items-center">
              <div class="xaxis"><span>0</span></div>
              <div class="xaxis ms-auto"><span>255</span></div>
            </div>
          </div>
        `;

      function callback(page) {
        let elem = document.getElementById(that.pixelLayerDataHistogramContainerId);
        let template = document.createElement('template');
        template.innerHTML = layerHistogram.render(page.selectedSource).trim();
        let canvas = template.content.firstChild;
        elem.insertAdjacentElement('afterbegin', canvas);
      }
    }

    // histogram of raw data from original image for selected source layer
    function rawDataHistogram(page, registeredCallbacks) {
      registeredCallbacks.push(callback);
      return `
          <div id = "${that.rawDataHistogramContainerId}">
            <div class="d-flex flex-row justify-content-between align-items-center">
              <div class="xaxis"><span id="${that.rawMinId}"></span></div>
              <div class="xaxis ms-auto"><span id="${that.rawMaxId}"></span></div>
            </div>
          </div>
        `;

      function callback(page) {
        that.rawMinElem = document.getElementById(that.rawMinId);
        that.rawMaxElem = document.getElementById(that.rawMaxId);
        let elem = document.getElementById(that.rawDataHistogramContainerId);
        let template = document.createElement('template');
        template.innerHTML = layerHistogram.renderRawData(page.selectedSource).trim();
        let canvas = template.content.firstChild;
        elem.insertAdjacentElement('afterbegin', canvas);
      }
    }

    // Settings for image layer
    function imageSettings(page) {
      let source = page.selectedSource;
      let html = "";
      // registeredCallbacks.push(callback);
      html = `
        <div id = "${that.imageStatsId}">
          <header>Settings, <span>filter: ${source.filter}</span></header>
          <div class="data">
            <div class="d-flex flex-row justify-content-start align-items-center">
              <div class="setting">min: ${u.roundNumber(source.min, 3)}</div>
              <div class="setting">max: ${u.roundNumber(source.max, 4)}</div>
            </div>
            <div class="d-flex flex-row justify-content-start align-items-center">
              <div class="setting">brightness: ${u.roundNumber(source.brightness, 3)}</div>
              <div class="setting">contrast: ${u.roundNumber(source.contrast, 3)}</div>
            </div>
          </div>
          ${adjustImage.renderScaling(page)}
        </div>
        `;
      return html;
    }

    // wrapper for reset and copy buttons
    function resetCopyButtons(page, registeredCallbacks) {
      return `
        <div class="d-flex flex-row justify-content-start align-items-center">
          <div class="pos">${resetButton(page, registeredCallbacks)}</div>
          <div class="pos">${copyButton(page, registeredCallbacks)}</div>
        </div>
      `;
    }

    // button: Reset adjustments to default settings
    function resetButton(page, registeredCallbacks) {
      let id = 'page-reset';
      let tooltip = 'Reset adjustments to default settings';
      let tooltipDone = 'Reset!';
      registeredCallbacks.push(callback);
      return `
        <button type="button" id="${id}" class="btn-reset" title="${tooltip}">Reset <i class="bi bi-arrow-counterclockwise"></i></button>
      `;

      function callback(page) {
        let elem = document.getElementById(id);
        if (elem) {
          let b = new bootstrap.Tooltip(elem);
          elem.addEventListener('mouseleave', function () {
            b.hide();
          });
          elem.addEventListener('click', () => {
            page.reset();
            let b = bootstrap.Tooltip.getInstance(elem);
            elem.setAttribute('data-bs-original-title', tooltipDone);
            b.show();
            elem.setAttribute('data-bs-original-title', tooltip);
            elem.focus();
            document.activeElement.blur();
            window.getSelection().removeAllRanges();
          });
        }
      }
    }

    // button: Copy JSON for source layer into the system clipboard
    function copyButton(page, registeredCallbacks) {
      let id = 'btn-clipboard';
      let tooltip = `Copy JSON for '${page.name}-${page.title}' image to clipboard`;
      let tooltipDone = 'Copied!';
      registeredCallbacks.push(callback);
      return `
        <button type="button" id="${id}" class="btn-clipboard" title="${tooltip}">Copy <i class="bi bi-clipboard-plus"></i></button>
      `;

      function callback(page) {
        const { ClipboardItem } = window;
        let elem = document.getElementById(id);
        if (elem) {
          let b = new bootstrap.Tooltip(elem);
          elem.addEventListener('mouseleave', function () {
            b.hide();
          });
          elem.addEventListener('click', () => {
            let text = JSON.stringify(page.image, null, 2);
            var type = "text/json";
            var blob = new Blob([text], { type });
            var data = [new ClipboardItem({
              [type]: blob
            })];
            navigator.clipboard.write(data).then(
              function () {
                /* success */
                console.log('success');
                let b = bootstrap.Tooltip.getInstance(elem);
                elem.setAttribute('data-bs-original-title', tooltipDone);
                b.show();
                elem.setAttribute('data-bs-original-title', tooltip);
                elem.focus();
                document.activeElement.blur();
                window.getSelection().removeAllRanges();
              },
              function (a) {
                /* failure */
                console.log('failure');
                console.log(a);
              }
            );
          });
        }
      }
    }

    // checkbox: enable/disable image layer inspect tool
    function inspectCheckbox(page, registeredCallbacks) {
      let id = 'image-inspect-checkbox';
      let checkedState = that.enableWhenConnected ? "checked" : "";
      registeredCallbacks.push(callback);
      return `
        <div>
          <label class="pe-2" for='${id}'>Inspect</label>
          <input type='checkbox' id='${id}' name='${id}' ${checkedState} value='0'>
          (hold shift)
        </div>
      `;

      function callback() {
        that.enabledElem = document.getElementById(id);
        if (that.enabledElem) {
          that.enabledElem.addEventListener('change', (e) => {
            if (e.target.checked) {
              that.enable();
            } else {
              that.disable();
            }
          });
        }
      }
    }

    function inspectPosition(page, registeredCallbacks) {
      registeredCallbacks.push(callback);
      return `
        <div class="data">
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">canvas</div>
            <div class="pos">x: <span id="${that.cposxId}"></span></div>
            <div class="pos">y: <span id="${that.cposyId}"></span></div>
          </div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">rgb</div>
            <div class="pos">r: <span id="${that.cposRedId}"></span></div>
            <div class="pos">g: <span id="${that.cposGreenId}"></span></div>
            <div class="pos">b: <span id="${that.cposBlueId}"></span></div>
          </div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">rgb ptr</div>
            <div class="pos"><span id="${that.cposPtrId}"></span></div>
          </div>
          <div>&nbsp;</div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">Layer: </div>
            <div class="pos"><span id="${that.layerNameId}"></span></div>
          </div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">raw value</div>
            <div class="pos"><span id="${that.cposRawId}"></span></div>
          </div>
          <div>&nbsp;</div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">js9 pos</div>
            <div class="pos">x: <span id="${that.js9posxId}"></span></div>
            <div class="pos">y: <span id="${that.js9posyId}"></span></div>
          </div>
        </div>
      `;

      function callback() {
        that.cposxElem = document.getElementById(that.cposxId);
        that.cposyElem = document.getElementById(that.cposyId);

        that.cposRedElem = document.getElementById(that.cposRedId);
        that.cposGreenElem = document.getElementById(that.cposGreenId);
        that.cposBlueElem = document.getElementById(that.cposBlueId);

        that.cposPtrElem = document.getElementById(that.cposPtrId);

        that.layerNameElem = document.getElementById(that.layerNameId);
        that.cposRawElem = document.getElementById(that.cposRawId);

        that.js9posxElem = document.getElementById(that.js9posxId);
        that.js9posyElem = document.getElementById(that.js9posyId);

        // that.js9RawElem = document.getElementById(that.js9RawId);
      }
    }

  }

  update() {
    this.updateCalcs();

    this.cposxElem.textContent = u.roundNumber(this.cpos.x, 4);
    this.cposyElem.textContent = u.roundNumber(this.cpos.y, 4);

    this.cposRedElem.textContent = this.cpos.r;
    this.cposGreenElem.textContent = this.cpos.g;
    this.cposBlueElem.textContent = this.cpos.b;

    this.cposPtrElem.textContent = this.cpos.ptr;

    this.layerNameElem.textContent = this.source.name;
    this.cposRawElem.textContent = u.roundNumber(this.cpos.raw, 4);
    this.rawMinElem.textContent = u.roundNumber(this.rawMinValue, 3);
    this.rawMaxElem.textContent = u.roundNumber(this.rawMaxValue, 5);

    this.js9posxElem.textContent = u.roundNumber(this.js9.x, 3);
    this.js9posyElem.textContent = u.roundNumber(this.js9.y, 3);

    let offsetx = this.canvasTargetRect.left - this.imageContainerTargetRect.left - this.indicatorWidth / 2;
    let offsety = this.canvasTargetRect.top - this.imageContainerTargetRect.top - this.indicatorHeight / 2;
    this.indicatorPos = {
      left: this.pos.x + offsetx,
      top: this.pos.y + offsety
    };

    Object.assign(this.indicatorElem.style, this.indicatorPos);
  }

  updateCalcs() {
    this.cpos.ptr = this.cpos.x * 4 + this.cpos.y * this.canvasImages.nx * 4;
    this.cpos.r = this.canvasData[this.cpos.ptr];
    this.cpos.g = this.canvasData[this.cpos.ptr + 1];
    this.cpos.b = this.canvasData[this.cpos.ptr + 2];
    let rawdataptr = this.cpos.x + this.cpos.y * this.canvasImages.nx;
    this.cpos.raw = this.rawData[rawdataptr];
    this.js9.x = this.cpos.x;
    this.js9.y = this.canvasImages.ny - this.cpos.y;
  }

  reset() {
    if (this.enabled) {
      this.setupIndicator();
      this.update();
    }
  }

  setupIndicator() {
    let x = this.canvasImages.nx / 2;
    let y = this.canvasImages.ny / 2;
    if (this.page.image.indicator) {
      x = this.page.image.indicator.x;
      y = this.page.image.indicator.y;
    }
    this.cpos.x = x;
    this.cpos.y = y;
    this.updatePosFromCpos();
  }

  connect(canvasImages) {
    this.setupConnect(canvasImages);
    this.bindCallbacks();
    this.startup();
    this.connected = true;
    if (this.enableWhenConnected) {
      this.enable();
      this.setupIndicator();
      this.update();
    }
  }

  connectUpdate(canvasImages) {
    this.setupConnect(canvasImages);
    if (this.inspectChecked()) {
      this.cpos.x = this.js9.x;
      this.cpos.y = this.canvasImages.ny - this.js9.y;
    }
    this.update();
  }

  setupConnect(canvasImages) {
    this.source = this.page.selectedSource;
    this.canvasImages = canvasImages;
    this.canvas = this.canvasImages.canvasRGB;
    this.canvasTargetRect = this.canvas.getBoundingClientRect();
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.canvasData = this.ctx.getImageData(0, 0, this.canvasImages.nx, this.canvasImages.ny).data;
    this.rawData = canvasImages.selectedSourceRawData;
    [this.rawMinValue, this.rawMaxValue] = u.forLoopMinMax(this.rawData);
  }

  inspectChecked() {
    return this.enabledElem.checked;
  }

  bindCallbacks() {
    [
      'listenerMouseMove',
      'listenerResize',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  startup() {
    this.mainEvents = [
      ['mousemove', this.listenerMouseMove],
      ['resize', this.listeneresize],
    ];
  }

  enable() {
    if (this.connected) {
      this.mainEvents.forEach((eventItem) => {
        this.canvas.addEventListener(eventItem[0], eventItem[1]);
      });
      this.canvas.classList.add('inspect');
      this.indicatorElem.classList.add('show');
      this.enabled = true;
    }
  }

  disable() {
    if (this.connected) {
      this.close();
      this.canvas.classList.remove('inspect');
      this.indicatorElem.classList.remove('show');
      this.enabled = false;
    }
  }

  close() {
    this.mainEvents.forEach((eventItem) => {
      this.canvas.removeEventListener(eventItem[0], eventItem[1]);
    });
  }

  getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  listenerResize() {}

  /// Event Handling ...

  pointerEvents(e) {
    this.pos.x = e.offsetX;
    this.pos.y = e.offsetY;
    this.updateCposFromPos();
  }

  updateCposFromPos() {
    let x = Math.round(this.pos.x * this.canvasImages.nx / this.width);
    let y = Math.round(this.pos.y * this.canvasImages.ny / this.height);
    this.cpos.x = x;
    this.cpos.y = y;
  }

  updatePosFromCpos() {
    let x = Math.round(this.cpos.x * this.width / this.canvasImages.nx);
    let y = Math.round(this.cpos.y * this.height / this.canvasImages.ny);
    this.pos.x = x;
    this.pos.y = y;
  }

  listenerMouseMove(e) {
    if (e.shiftKey) {
      this.canvas.classList.add('inspecting');
      this.pointerEvents(e);
      console.log(`mousemove: pos x: ${this.pos.x} y: ${this.pos.y}`);
      this.update();
    } else {
      this.canvas.classList.remove('inspecting');
    }
  }

  // crosshairCursor(visible) {
  //   if (visible) {
  //   } else {
  //   }
  // }

}

export default ImageInspect;
