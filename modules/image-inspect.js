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
    return html;

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

    this.js9posxElem.textContent = u.roundNumber(this.js9.x, 3);
    this.js9posyElem.textContent = u.roundNumber(this.js9.y, 3);
    this.js9RawElem.textContent = u.roundNumber(this.js9.raw, 3);
    this.js9PtrElem.textContent = this.js9.ptr;

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
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.canvasData = this.ctx.getImageData(0, 0, this.canvasImages.nx, this.canvasImages.ny).data;
    this.rawData = canvasImages.selectedSourceRawData;
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
