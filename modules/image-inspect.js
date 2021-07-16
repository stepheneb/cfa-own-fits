/*jshint esversion: 6 */

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
      raw: 0
    };
    this.enableWhenConnected = true;
    let js9posx = 569;
    let js9posy = 737;
    //val = 15.92
    this.js9 = {
      x: js9posx,
      y: js9posy,
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
      <svg id="${this.indicatorId}" xmlns="http://www.w3.org/2000/svg" width="${this.indicatorWidth}" height="${this.indicatorHeight}" fill="currentColor" class="show bi bi-brightness-high" viewBox="0 0 16 16">
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

    this.cposRawId = "image-inspect-cpos-raw";
    this.rawMinId = "image-inspect-raw-min";
    this.rawMaxId = "image-inspect-raw-max";

    this.js9posxId = "image-inspect-js9-posx";
    this.js9posyId = "image-inspect-js9-posy";
    this.js9RawId = "image-inspect-js9-raw";
    this.js9PtrId = "image-inspect-js9-ptr";

    html = `
      <div class="image-inspect">
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
        let elem = document.getElementById(id);
        if (elem) {
          elem.addEventListener('change', (e) => {
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
            <div class="pos">x: <span id="${that.cposRedId}"></span></div>
            <div class="pos">y: <span id="${that.cposGreenId}"></span></div>
            <div class="pos">y: <span id="${that.cposBlueId}"></span></div>
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
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">js9 value</div>
            <div class="pos"><span id="${that.js9RawId}"></span></div>
          </div>
          <div class="d-flex flex-row justify-content-start align-items-center">
            <div class="pos">js9 ptr</div>
            <div class="pos"><span id="${that.js9PtrId}"></span></div>
          </div>
        </div>
      `;

      function callback() {
        that.cposxElem = document.getElementById(that.cposxId);
        that.cposyElem = document.getElementById(that.cposyId);

        that.cposRedElem = document.getElementById(that.cposRedId);
        that.cposGreenElem = document.getElementById(that.cposGreenId);
        that.cposBlueElem = document.getElementById(that.cposBlueId);

        that.cposRawElem = document.getElementById(that.cposRawId);
        that.rawMinElem = document.getElementById(that.rawMinId);
        that.rawMaxElem = document.getElementById(that.rawMaxId);

        that.js9posxElem = document.getElementById(that.js9posxId);
        that.js9posyElem = document.getElementById(that.js9posyId);

        that.js9RawElem = document.getElementById(that.js9RawId);
        that.js9PtrElem = document.getElementById(that.js9PtrId);
      }
    }

  }

  update() {
    this.processScreenPos();

    this.cposxElem.textContent = u.roundNumber(this.cpos.x, 4);
    this.cposyElem.textContent = u.roundNumber(this.cpos.y, 4);

    this.cposRedElem.textContent = this.cpos.r;
    this.cposGreenElem.textContent = this.cpos.g;
    this.cposBlueElem.textContent = this.cpos.b;

    this.cposRawElem.textContent = u.roundNumber(this.cpos.raw, 3);
    this.rawMinElem.textContent = u.roundNumber(this.rawMinValue, 3);
    this.rawMaxElem.textContent = u.roundNumber(this.rawMaxValue, 3);

    this.js9posxElem.textContent = u.roundNumber(this.js9.x, 3);
    this.js9posyElem.textContent = u.roundNumber(this.js9.y, 3);
    this.js9RawElem.textContent = u.roundNumber(this.js9.raw, 3);
    this.js9PtrElem.textContent = this.js9.ptr;

    // this.indicatorPos = {
    //   left: this.pos.x + this.canvasTargetRect.left,
    //   top: this.pos.x + this.canvasTargetRect.top,
    // };
    let offsetx = this.canvasTargetRect.left - this.imageContainerTargetRect.left - this.indicatorWidth / 2;
    let offsety = this.canvasTargetRect.top - this.imageContainerTargetRect.top - this.indicatorHeight / 2;
    this.indicatorPos = {
      left: this.pos.x * this.width / this.canvasImages.nx + offsetx,
      top: this.pos.y * this.height / this.canvasImages.ny + offsety
    };

    Object.assign(this.indicatorElem.style, this.indicatorPos);

  }

  processScreenPos() {
    let x = Math.round(this.pos.x *= this.canvasImages.nx / this.width);
    let y = Math.round(this.pos.y *= this.canvasImages.ny / this.height);
    let cdataptr = x * 4 + y * this.canvasImages.ny * 4;
    this.cpos.x = x;
    this.cpos.y = y;
    this.cpos.r = this.canvasData[cdataptr];
    this.cpos.g = this.canvasData[cdataptr + 1];
    this.cpos.b = this.canvasData[cdataptr + 2];
    let rawdataptr = x + y * this.canvasImages.ny;
    this.cpos.raw = this.rawData[rawdataptr];
    this.js9.x = x;
    this.js9.y = this.canvasImages.ny - y;
    let range = this.source.max - this.source.min;
    this.js9.raw = this.cpos.raw / range * this.js9.max;
    this.js9.ptr = this.js9.x * 4 + ((this.canvasImages.ny - this.js9.y) * 4 * this.canvasImages.nx);
  }

  updateSource(source) {
    this.source = source;
  }

  connect(canvasImages) {
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
    this.bindCallbacks();
    this.startup();
    this.connected = true;
    if (this.enableWhenConnected) {
      this.enable();
      // this.pos.x = this.canvasImages.nx / 2 * this.width / this.canvasImages.nx;
      // this.pos.y = this.canvasImages.ny / 2 * this.height / this.canvasImages.ny;
      this.pos.x = this.js9.x * this.width / this.canvasImages.nx;
      this.pos.y = (this.canvasImages.ny - this.js9.y) * this.height / this.canvasImages.ny;

      this.update();
    }
  }

  bindCallbacks() {
    [
      'listenerMouseEnter',
      'listenerMouseMove',
      'listenerMouseLeave',
      'listenerResize',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  startup() {
    this.mainEvents = [
      ['mouseenter', this.listenerMouseEnter],
      ['mousemove', this.listenerMouseMove],
      ['mouseleave', this.listenerMouseLeave],
      ['resize', this.listeneresize],
    ];
  }

  enable() {
    if (this.connected) {
      this.mainEvents.forEach((eventItem) => {
        this.canvas.addEventListener(eventItem[0], eventItem[1]);
      });
    }
  }

  disable() {
    if (this.connected) {
      this.close();
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
    this.containerPos = {
      x: e.pageX,
      y: e.pageY
    };
    let pos = {
      x: e.pageX,
      y: e.pageY
    };
    let targetRect = e.target.getBoundingClientRect();
    pos.x -= targetRect.x;
    pos.y -= targetRect.y;
    return pos;
  }

  listenerMouseEnter(e) {
    if (e.shiftKey) {
      this.crosshairCursor(true);
      this.pos = this.pointerEvents(e);
      this.update();
    } else {
      this.crosshairCursor(false);
    }
    // console.log(`imageInspect.mouseenter: pos: ${this.pos.x}, ${this.pos.y}`);
  }

  listenerMouseMove(e) {
    if (e.shiftKey) {
      this.crosshairCursor(true);
      this.pos = this.pointerEvents(e);
      this.update();
    } else {
      this.crosshairCursor(false);
    }
    // console.log(`imageInspect.mousemove: pos: ${this.pos.x}, ${this.pos.y}`);
  }

  listenerMouseLeave(e) {
    if (e.shiftKey) {
      this.crosshairCursor(true);
      this.pos = this.pointerEvents(e);
      this.update();
    } else {
      this.crosshairCursor(false);
    }
    // console.log(`imageInspect.mouseleave: pos: ${this.pos.x}, ${this.pos.y}`);
  }

  crosshairCursor(visible) {
    if (visible) {
      this.canvas.classList.add('inspect');

    } else {
      this.canvas.classList.remove('inspect');
    }
  }

}

export default ImageInspect;
