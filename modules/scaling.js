/*jshint esversion: 6 */

class Scaling {
  constructor(canvas, imageBitmap) {
    this.canvas = canvas;
    this.imageBitmap = imageBitmap;
    this.bindCallbacks();
    this.setupButtons();
    this.touchinfo = document.querySelector('span.touchinfo');
    this.ctx = this.canvas.getContext('2d');
    this.clientDimensions = {};
    this.nx = imageBitmap.width;
    this.ny = imageBitmap.height;
    this.scaling = false;
    this.scale = 1;
    this.maxScale = 0;
    this.ratio = 0;
    this.scaleFactor = 1.1;
    this.scaleDraw = null;
    this.distance = 0;
    this.lastDistance = 0;
    this.canDrag = false;
    this.isDragging = false;
    this.startCoords = { x: 0, y: 0 };
    this.last = { x: 0, y: 0 };
    this.moveX = 0;
    this.moveY = 0;
    this.redraw = null;
    this.dxOld = 0;
    this.dyOld = 0;
    this.startup();
  }

  update(im) {
    this.imageBitmap = im;
    this.canvasDraw();
  }

  bindCallbacks() {
    [
      'canvasDraw',
      'scaleCanvas',
      'scaleCanvasTouch',
      'buttonListener',
      'listenerMouseDownTouchStart',
      'listenerMouseMoveTouchMove',
      'listenerMouseUpTouchEnd',
      'listenerZoom'
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  setupButtons() {
    [this.zoomInButton, this.zoomOutButton, this.zoomResetButton] = document.querySelectorAll('div.scale button');
    this.zoomInButton.addEventListener('click', this.buttonListener);
    this.zoomOutButton.addEventListener('click', this.buttonListener);
    this.zoomResetButton.addEventListener('click', this.buttonListener);
  }

  startup() {
    if (this.isTouchDevice()) {
      this.scaleFactor = 1.02;
      this.canvas.classList.add('touch');
      this.canvas.addEventListener('touchstart', this.hideTouchTooltip);
    } else {
      this.hideTouchTooltip();
    }

    window.addEventListener('resize', () => {
      this.resizeCanvas(this.canvas);
    });

    // Startup ...

    this.setupButtons();
    this.resizeCanvas(this.canvas);
    this.updateZoomButtons();
    this.showTouchTooltip();

    this.canvas.addEventListener('mousedown', this.listenerMouseDownTouchStart);
    this.canvas.addEventListener('touchstart', this.listenerMouseDownTouchStart);

    this.canvas.addEventListener('mousemove', this.listenerMouseMoveTouchMove);
    this.canvas.addEventListener('touchmove', this.listenerMouseMoveTouchMove);

    this.canvas.addEventListener('mouseup', this.listenerMouseUpTouchEnd);
    this.canvas.addEventListener('touchend', this.listenerMouseUpTouchEnd);

    this.canvas.addEventListener('wheel', this.listenerZoom);
  }

  close() {
    this.canvas.removeEventListener('mousedown', this.listenerMouseDownTouchStart);
    this.canvas.removeEventListener('touchstart', this.listenerMouseDownTouchStart);

    this.canvas.removeEventListener('mousemove', this.listenerMouseMoveTouchMove);
    this.canvas.removeEventListener('touchmove', this.listenerMouseMoveTouchMove);

    this.canvas.removeEventListener('mouseup', this.listenerMouseUpTouchEnd);
    this.canvas.removeEventListener('touchend', this.listenerMouseUpTouchEnd);

    this.canvas.removeEventListener('wheel', this.listenerZoom);
  }

  isTouchDevice() {
    return typeof window.ontouchstart !== "undefined";
  }

  hideTouchTooltip() {
    if (this.touchinfo) {
      this.touchinfo.classList.add('hidden');
    }
  }

  showTouchTooltip() {
    if (this.isTouchDevice() && this.touchinfo) {
      this.touchinfo.classList.remove('hidden');
    } else {
      this.touchinfo.classList.add('hidden');
    }
  }

  listenerZoom(e) {
    e.preventDefault();
    var dx = 0;
    var dy = 0;
    console.log(' ');
    console.log(`wheel listener: ${e.deltaX}, ${e.deltaY}`);

    if (e.ctrlKey) {
      // zoom
      dy = e.deltaY;
      if (window.ui.os == 'Windows' && (window.ui.browser == 'Chrome' || window.ui.browser == 'Edge')) {
        dy /= 20;
      }
      this.scale = this.scale * (1 - dy / 100);
      if (this.scale < 1) this.scale = 1;
      if (this.scale > this.maxScale) this.scale = this.maxScale;
      this.updateZoomButtons();
    } else {
      // pan
      switch (window.ui.os) {
      case 'Windows':
        switch (window.ui.browser) {
        case 'Edge':
          dx = e.deltaX * 0.25;
          dy = e.deltaY * 0.25;
          break;
        case 'Chrome':
          if (e.shiftKey) {
            dx = e.deltaY * 0.25;
          } else {
            dy = e.deltaY * 0.25;
          }
          break;
        case 'Firefox':
          dx = e.deltaX * 10;
          dy = e.deltaY * 10;
          break;
        }
        break;
      case 'Mac OS X':
        switch (window.ui.browser) {
        case 'Chrome':
          dx = e.deltaX;
          dy = e.deltaY;
          break;
        case 'Firefox':
          dx = e.deltaX * 0.5;
          dy = e.deltaY * 0.5;
          break;
        }
        break;
      case 'Linux':
        switch (window.ui.browser) {
        case 'Chrome':
          dx = e.deltaX;
          dy = e.deltaY;
          break;
        case 'Firefox':
          dx = e.deltaX;
          dy = e.deltaY;
          break;
        }
        break;
      }
      console.log(`pan dx, dy: ${dx}, ${dy}`);
      dx = Math.sign(dx) * Math.min(24, Math.abs(dx));
      dy = Math.sign(dy) * Math.min(24, Math.abs(dy));

      dx = this.dxOld + (dx - this.dxOld * 0.5);
      dy = this.dyOld + (dy - this.dyOld * 0.5);

      this.moveX += dx;
      this.moveY += dy;
      this.dxOld = dx;
      this.dxOld = dx;

    }
    this.redraw = requestAnimationFrame(this.canvasDraw);
  }

  scaleCanvas() {
    switch (this.scaling) {
    case 'zoomout':
      this.scale = this.scale / this.scaleFactor;
      if (this.scale < 1) this.scale = 1;
      break;
    case 'zoomin':
      this.scale = this.scale * this.scaleFactor;
      if (this.scale > this.maxScale) this.scale = this.maxScale;
      break;
    case 'zoomreset':
      this.scale = 1;
      break;
    }
    this.updateZoomButtons();
    this.redraw = requestAnimationFrame(this.canvasDraw);
  }

  scaleCanvasTouch() {
    if (this.lastDistance > this.distance) {
      this.scale = this.scale / this.scaleFactor;
      if (this.scale < 1) this.scale = 1;
    } else if (this.lastDistance < this.distance) {
      this.scale = this.scale * this.scaleFactor;
      if (this.scale > this.maxScale) this.scale = this.maxScale;
    }

    this.redraw = requestAnimationFrame(this.canvasDraw);

    this.lastDistance = this.distance;
  }

  canvasDraw() {
    let imageWidth = this.imageBitmap.width * this.ratio * this.scale;
    let imageHeight = this.imageBitmap.height * this.ratio * this.scale;
    let w = Math.min(this.clientDimensions.width, imageWidth);
    let h = Math.min(this.clientDimensions.height, imageHeight);

    this.canvas.width = w;
    this.canvas.height = h;

    var offsetX = (imageWidth - this.canvas.width) / 2,
      offsetY = (imageHeight - this.canvas.height) / 2;

    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.moveX > offsetX) {
      this.moveX = offsetX;
    }

    if (this.moveX < -(imageWidth - offsetX - this.canvas.width)) {
      this.moveX = -(imageWidth - offsetX - this.canvas.width);
    }

    if (this.moveY > offsetY) {
      this.moveY = offsetY;
    }

    if (this.moveY < -(imageHeight - offsetY - this.canvas.height)) {
      this.moveY = -(imageHeight - offsetY - this.canvas.height);
    }

    console.log(`canvasDraw: ${this.moveX}, ${this.moveY}`);
    this.ctx.drawImage(
      this.imageBitmap,
      -offsetX + this.moveX,
      -offsetY + this.moveY,
      imageWidth,
      imageHeight
    );
  }

  calcMaxScale() {
    this.maxScale = Math.min(this.imageBitmap.height / this.canvas.height, this.imageBitmap.width / this.canvas.width);
    this.ratio = 1 / this.maxScale;
  }

  getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  resizeCanvas(c) {
    this.clientDimensions = this.getWidthHeight(c);
    let { clientWidth, clientHeight } = this.clientDimensions;

    clientWidth = this.clientDimensions.width;
    clientHeight = this.clientDimensions.height;
    let sourceAspectRatio = this.nx / this.ny;
    let destinationAspectRatio = clientWidth / clientHeight;
    let resizeW, resizeH;
    if (destinationAspectRatio >= sourceAspectRatio) {
      resizeH = clientHeight;
      resizeW = clientHeight * sourceAspectRatio;
    } else {
      resizeW = clientWidth;
      resizeH = clientWidth / sourceAspectRatio;
    }
    c.width = resizeW;
    c.height = resizeH;
    this.calcMaxScale();
    this.redraw = requestAnimationFrame(this.canvasDraw);
  }

  updateZoomButtons() {
    this.zoomInButton.disabled = false;
    this.zoomOutButton.disabled = false;
    this.zoomResetButton.disabled = false;
    if (this.scale == this.maxScale) {
      this.zoomInButton.disabled = true;
    }
    if (this.scale == 1) {
      this.zoomOutButton.disabled = true;
      this.zoomResetButton.disabled = true;
    }
  }

  /// Event Handling ...

  buttonListener(e) {
    this.scaling = e.currentTarget.dataset.scale;
    this.scaleDraw = requestAnimationFrame(this.scaleCanvas);
  }

  /*
      POINTER EVENTS
  */

  pointerEvents(e) {
    var pos = {
      x: 0,
      y: 0
    };

    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove"
    ) {
      pos.x = e.pageX;
      pos.y = e.pageY;
    }

    return pos;
  }

  listenerMouseDownTouchStart(e) {
    var position = this.pointerEvents(e),
      touch;

    if (e.type === "touchstart" && touch.length === 2) {
      // touch = e.originalEvent.touches || e.originalEvent.changedTouches;
      touch = e.touches || e.changedTouches;
      this.scaling = true;

      // Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
      this.lastDistance = Math.sqrt(
        (touch[0].clientX - touch[1].clientX) *
        (touch[0].clientX - touch[1].clientX) +
        (touch[0].clientY - touch[1].clientY) *
        (touch[0].clientY - touch[1].clientY)
      );
    } else {
      this.canDrag = true;
    }
    this.isDragging = this.scaling = false;

    this.startCoords = {
      x: position.x - e.target.offsetLeft - this.last.x,
      y: position.y - e.target.offsetTop - this.last.y
    };
  }

  listenerMouseMoveTouchMove(e) {
    e.preventDefault();

    this.isDragging = true;

    if (this.isDragging && this.canDrag && this.scaling === false) {
      var position = this.pointerEvents(e),
        offset = e.type === "touchmove" ? 1.3 : 1;

      this.moveX = (position.x - e.target.offsetLeft - this.startCoords.x) * offset;
      this.moveY = (position.y - e.target.offsetTop - this.startCoords.y) * offset;

      this.redraw = requestAnimationFrame(this.canvasDraw);
    } else if (this.scaling === true) {
      if (e instanceof TouchEvent) {
        var touch = e.originalEvent.touches || e.originalEvent.changedTouches;

        //Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        this.distance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      }
      this.scaleDraw = requestAnimationFrame(this.scaleCanvasTouch);
    }

  }

  listenerMouseUpTouchEnd(e) {
    var position = this.pointerEvents(e);

    this.canDrag = this.isDragging = this.scaling = false;

    this.last = {
      x: position.x - e.target.offsetLeft - this.startCoords.x,
      y: position.y - e.target.offsetTop - this.startCoords.y
    };

    cancelAnimationFrame(this.scaleDraw);
    cancelAnimationFrame(this.redraw);
  }

}

export default Scaling;
