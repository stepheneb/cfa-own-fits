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
    this.posxId = "image-inspect-posx";
    this.posyId = "image-inspect-posy";

    this.cposxId = "image-inspect-cposx";
    this.cposyId = "image-inspect-cposy";

    this.cposRedId = "image-inspect-cpos-red";
    this.cposGreenId = "image-inspect-cpos-green";
    this.cposBlueId = "image-inspect-cpos-blue";

    this.cposPtrId = "image-inspect-cpos-ptr";

    this.layerNameId = "image-inspect-layer";
    this.cposRawId = "image-inspect-cpos-raw";
    this.rawMinId = "image-inspect-raw-min";
    this.rawMaxId = "image-inspect-raw-max";

    this.js9posxId = "image-inspect-js9-posx";
    this.js9posyId = "image-inspect-js9-posy";
    this.js9RawId = "image-inspect-js9-raw";

    this.imageStatsId = 'image-stats';

    html = `
      <div class="image-inspect">
        ${imageStats(page, registeredCallbacks)}
        <div class="d-flex flex-row justify-content-start align-items-center">
          <div class="pos">${renderReset(page, registeredCallbacks)}</div>
          <div class="pos">${renderCopySource(page, registeredCallbacks)}</div>
        </div>
        ${layerHistogram.render(page.selectedSource)}
        ${adjustImage.renderScaling(page)}
        ${checkbox(page, registeredCallbacks)}
        ${position(page, registeredCallbacks)}
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

    function imageStats(page, registeredCallbacks) {
      registeredCallbacks.push(callback);
      return `
        <div id = "${that.imageStatsId}"></div>
      `;

      function callback(page) {
        let { nx, ny } = page.image.dimensions[page.image.size];
        let elem = document.getElementById(that.imageStatsId);
        let html = "";
        let source = page.selectedSource;
        let original = source.original;
        if (original) {
          html += `
              <div>Original: <a href="${original.path}" target="_blank" download>${u.getLastItem(original.path)}</a></div>
            `;
        }

        html += `
            <div>Image size: ${nx} x ${ny}</div>
            ${layerHistogram.renderRawData(that.page.selectedSource)}
            <header>Settings</header>
            <div class="data">
              <div class="d-flex flex-row justify-content-start align-items-center">
                <div class="pos">min: </div>
                <div class="pos">${u.roundNumber(source.min, 3)}</div>
              </div>
              <div class="d-flex flex-row justify-content-start align-items-center">
                <div class="pos">max: </div>
                <div class="pos">${u.roundNumber(source.max, 4)}</div>
              </div>
              <div class="d-flex flex-row justify-content-start align-items-center">
                <div class="pos">brightness: </div>
                <div class="pos">${u.roundNumber(source.brightness, 3)}</div>
              </div>
              <div class="d-flex flex-row justify-content-start align-items-center">
                <div class="pos">contrast: </div>
                <div class="pos">${u.roundNumber(source.contrast, 3)}</div>
              </div>
              <div class="d-flex flex-row justify-content-start align-items-center">
                <div class="pos">filter: </div>
                <div class="pos">${source.filter}</div>
              </div>
            </div>
          `;
        elem.innerHTML = html;

      }
    }

    function renderReset(page, registeredCallbacks) {
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

    function renderCopySource(page, registeredCallbacks) {
      let id = 'btn-clipboard';
      let tooltip = `Copy JSON for source layer '${that.page.selectedSource.name}' to clipboard`;
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
            let text = JSON.stringify(page.selectedSource, null, 2);
            var type = "text/plain";
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

    function checkbox(page, registeredCallbacks) {
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

    function position(page, registeredCallbacks) {
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
            <div class="pos">min: <span id="${that.rawMinId}"></span></div>
            <div class="pos">max: <span id="${that.rawMaxId}"></span></div>
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
        that.rawMinElem = document.getElementById(that.rawMinId);
        that.rawMaxElem = document.getElementById(that.rawMaxId);

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
    this.cposRawElem.textContent = u.roundNumber(this.cpos.raw, 3);
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
    // let range = this.source.max - this.source.min;
    // this.js9.raw = this.cpos.raw / range * this.js9.max;
  }

  connect(canvasImages) {
    this.setupConnect(canvasImages);
    this.bindCallbacks();
    this.startup();
    this.connected = true;
    if (this.enableWhenConnected) {
      this.enable();
      // this.cpos.x = this.js9.x;
      // this.cpos.y = this.canvasImages.ny - this.js9.y;
      // this.pos.x = this.js9.x * this.width / this.canvasImages.nx;
      // this.pos.y = (this.canvasImages.ny - this.js9.y) * this.height / this.canvasImages.ny;
      // this.pos.x = this.js9.x * this.width / this.canvasImages.nx;
      // this.pos.y = (this.canvasImages.ny - this.js9.y) * this.height / this.canvasImages.ny;
      // this.updateCposFromPos();

      let x = this.canvasImages.nx / 2;
      let y = this.canvasImages.ny / 2;
      if (this.page.image.indicator) {
        x = this.page.image.indicator.x;
        y = this.page.image.indicator.y;
      }
      this.cpos.x = x;
      this.cpos.y = y;
      this.updatePosFromCpos();
      this.update();
    }
  }

  connectUpdate(canvasImages) {
    this.setupConnect(canvasImages);
    if (this.inspectChecked()) {
      this.cpos.x = this.js9.x;
      this.cpos.y = this.canvasImages.ny - this.js9.y;
      // this.update();
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
