/*jshint esversion: 6 */

class Scaling {
  constructor(canvas, imageBitmap, previewZoomCanvas) {
    this.canvas = canvas;
    this.clientDimensions = {};

    this.imageBitmap = imageBitmap;
    this.previewZoomCanvas = previewZoomCanvas;
    this.pzcZoomRectDisplayed = false;
    this.pzcClientWidth = null;
    this.pzcClientHeight = null;

    this.mainEvents = null;
    this.previewZoomEvents = null;
    this.bindCallbacks();
    this.setupButtons();
    this.touchinfo = document.querySelector('span.touchinfo');
    this.ctx = this.canvas.getContext('2d');
    this.nx = imageBitmap.width;
    this.ny = imageBitmap.height;
    this.scale = 1;
    this.maxScale = 0;
    this.ratio = 0;
    this.scaleFactor = 1.1;
    this.scaleDraw = null;
    this.distance = 0;

    this.zp = null;

    this.lastDistance = 0;
    this.previewZoomLastDistance = 0;

    this.scaling = false;
    this.previewZoomScaling = false;

    this.dragStarted = false;
    this.previewZoomDragStarted = false;

    this.isDragging = false;
    this.previewZoomIsDragging = false;

    this.startCoords = { x: 0, y: 0 };
    this.previewZoomStartCoords = { x: 0, y: 0 };

    this.last = { x: 0, y: 0 };
    this.previewZoomLast = { x: 0, y: 0 };

    this.moveX = 0;
    this.previewZoomMoveX = 0;

    this.moveY = 0;
    this.previewZoomMoveY = 0;

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
      'listenerMouseOverZoomRect',
      'listenerMouseMoveZoomRect',
      'listenerMouseOutZoomRect',
      'listenerZoom',
      'previewZoomListenerMouseDownTouchStart',
      'previewZoomListenerMouseMoveTouchMove',
      'previewZoomListenerMouseLeave',
      'previewZoomListenerMouseUpTouchEnd'
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
      this.handleResize();
    });

    // Startup ...

    this.setupButtons();
    this.handleResize();
    this.updateZoomButtons();
    this.showTouchTooltip();

    this.mainEvents = [
      ['mousedown', this.listenerMouseDownTouchStart],
      ['touchstart', this.listenerMouseDownTouchStart],

      ['mousemove', this.listenerMouseMoveTouchMove],
      ['touchmove', this.listenerMouseMoveTouchMove],

      ['mouseleave', this.listenerMouseUpTouchEnd],
      ['mouseup', this.listenerMouseUpTouchEnd],
      ['touchend', this.listenerMouseUpTouchEnd],

      ['wheel', this.listenerZoom]
    ];

    this.mainEvents.forEach((eventItem) => {
      this.canvas.addEventListener(eventItem[0], eventItem[1]);
    });

    this.previewZoomEvents = [
      ['mousedown', this.previewZoomListenerMouseDownTouchStart],
      ['touchstart', this.previewZoomListenerMouseDownTouchStart],

      ['mousemove', this.previewZoomListenerMouseMoveTouchMove],
      ['touchmove', this.previewZoomListenerMouseMoveTouchMove],

      ['mouseleave', this.previewZoomListenerMouseLeave],
      ['mouseup', this.previewZoomListenerMouseUpTouchEnd],
      ['touchend', this.previewZoomListenerMouseUpTouchEnd],

      ['mouseover', this.listenerMouseOverZoomRect],
      ['mousemove', this.listenerMouseMoveZoomRect],
      ['mouseout', this.listenerMouseOutZoomRect],

    ];

    if (this.previewZoomCanvas) {
      this.previewZoomEvents.forEach((eventItem) => {
        this.previewZoomCanvas.addEventListener(eventItem[0], eventItem[1]);
      });
    }
  }

  close() {
    this.mainEvents.forEach((eventItem) => {
      this.canvas.removeEventListener(eventItem[0], eventItem[1]);
    });

    if (this.previewZoomCanvas) {
      this.previewZoomEvents.forEach((eventItem) => {
        this.previewZoomCanvas.removeEventListener(eventItem[0], eventItem[1]);
      });
    }
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
    // console.log(' ');
    // console.log(`wheel listener: ${e.deltaX}, ${e.deltaY}`);

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
      // console.log(`pan dx, dy: ${dx}, ${dy}`);
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

    // console.log(`canvasDraw: ${this.moveX}, ${this.moveY}`);
    this.ctx.drawImage(
      this.imageBitmap,
      -offsetX + this.moveX,
      -offsetY + this.moveY,
      imageWidth,
      imageHeight
    );
    if (this.previewZoomCanvas) {
      this.previewZoomCanvasDraw({
        sw: w / imageWidth,
        sh: h / imageHeight,
        sx: (offsetX - this.moveX) / imageWidth,
        sy: (offsetY - this.moveY) / imageHeight
      });
    }
  }

  previewZoomCanvasDraw(zp) {
    this.zp = zp;
    const ctx = this.previewZoomCanvas.getContext('2d');
    const pzcW = this.previewZoomCanvas.width;
    const pczH = this.previewZoomCanvas.height;
    ctx.clearRect(0, 0, pzcW, pczH);
    if (this.canDrag()) {
      this.pzcZoomRectDisplayed = true;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 4;
      this.zx = zp.sx * pzcW;
      this.zy = zp.sy * pczH;
      this.zwidth = pzcW * zp.sw;
      this.zheight = pczH * zp.sh;
      ctx.strokeRect(this.zx, this.zy, this.zwidth, this.zheight);
    } else {
      this.pzcZoomRectDisplayed = false;
    }
  }

  calcMaxScale() {
    this.maxScale = Math.min(this.imageBitmap.height / this.canvas.height, this.imageBitmap.width / this.canvas.width);
    this.ratio = 1 / this.maxScale;
  }

  getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  handleResize() {
    this.resizeCanvas(this.canvas);
    this.reCalculatePreviewZoomRect();
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
      POINTER EVENTS for main scaling canvas
  */

  canDrag() {
    return this.scale > 1;
  }

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
    }
    this.dragStarted = true;
    this.isDragging = this.scaling = false;

    this.startCoords = {
      x: position.x - this.last.x,
      y: position.y - this.last.y
      // x: position.x,
      // y: position.y
    };

    console.log(['start', this.startCoords]);
  }

  listenerMouseMoveTouchMove(e) {
    e.preventDefault();

    if (this.canDrag() && this.dragStarted) {
      this.isDragging = true;
    }

    if (this.isDragging && this.canDrag() && this.scaling === false) {
      var position = this.pointerEvents(e),
        offset = e.type === "touchmove" ? 1.3 : 1;

      this.moveX = (position.x - this.startCoords.x) * offset;
      this.moveY = (position.y - this.startCoords.y) * offset;

      console.log(['move', this.moveX, this.moveY]);

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

  listenerMouseLeave(e) {
    var position = this.pointerEvents(e);

    if (this.dragStarted || this.isDragging) {
      this.last = {
        x: position.x - this.startCoords.x,
        y: position.y - this.startCoords.y
      };
    }

    this.dragStartedStarted = this.isDragging = this.scaling = false;

    console.log(['leave', this.last]);

    cancelAnimationFrame(this.scaleDraw);
    cancelAnimationFrame(this.redraw);
  }

  listenerMouseUpTouchEnd(e) {
    var position = this.pointerEvents(e);

    if (this.dragStarted || this.isDragging) {
      this.last = {
        x: position.x - this.startCoords.x,
        y: position.y - this.startCoords.y
      };
    }

    this.dragStarted = this.isDragging = this.scaling = false;

    console.log(['end', this.last]);

    cancelAnimationFrame(this.scaleDraw);
    cancelAnimationFrame(this.redraw);
  }

  /*
      POINTER EVENTS for preview zoom canvas
  */

  previewZoomPointerEvents(e) {
    const rect = this.previewZoomCanvas.getBoundingClientRect();
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

      pos.x = e.clientX - rect.left;
      pos.y = e.clientY - rect.top;
    }
    return pos;
  }

  inZoomRect(pos) {
    let inside = false;
    let inColumn = false;
    let inRow = false;
    let zx, zy, zw, zh = 0;
    if (this.pzcZoomRectDisplayed) {
      zx = this.zp.sx * this.pzcClientWidth;
      zy = this.zp.sy * this.pzcClientHeight;
      zw = this.zp.sw * this.pzcClientWidth;
      zh = this.zp.sh * this.pzcClientHeight;
      inRow = pos.y >= zy && pos.y <= (zy + zh);
      inColumn = pos.x >= zx && pos.x <= (zx + zw);
      inside = inColumn && inRow;
    }
    return inside;
  }

  listenerMouseOverZoomRect() {
    this.overPreviewZoom = true;
  }

  listenerMouseMoveZoomRect(e) {
    const rect = this.previewZoomCanvas.getBoundingClientRect();
    var pos = {};
    if (this.overPreviewZoom) {
      pos.x = e.clientX - rect.left;
      pos.y = e.clientY - rect.top;
      if (this.inZoomRect(pos)) {
        this.previewZoomCanvas.classList.add('overzoomrect');
      } else {
        this.previewZoomCanvas.classList.remove('overzoomrect');
      }
    }
  }

  listenerMouseOutZoomRect() {
    this.previewZoomCanvas.classList.remove('overzoomrect');
    this.overPreviewZoom = false;
  }

  reCalculatePreviewZoomRect() {
    if (this.previewZoomCanvas) {
      let rect = this.previewZoomCanvas.getBoundingClientRect();
      this.pzcClientWidth = rect.width;
      this.pzcClientHeight = rect.height;
      this.scaleToMoveX = this.clientDimensions.width / this.pzcClientWidth;
      this.scaleToMoveY = this.clientDimensions.height / this.pzcClientHeight;
      // this.scaleToMoveX = this.canvas.width / this.pzcClientWidth;
      // this.scaleToMoveY = this.canvas.height / this.pzcClientHeight;
    }
  }

  applyScaleToMoveX(px) {
    this.scaleToMoveX = this.canvas.width / this.pzcClientWidth;
    return px * -4 * this.scaleToMoveX;
  }

  applyScaleToMoveY(py) {
    this.scaleToMoveY = this.canvas.height / this.pzcClientHeight;
    return py * -4 * this.scaleToMoveY;
  }

  previewZoomListenerMouseDownTouchStart(e) {
    var pos = this.previewZoomPointerEvents(e),
      touch;

    if (this.inZoomRect(pos)) {
      if (e.type === "touchstart" && touch.length === 2) {
        // touch = e.originalEvent.touches || e.originalEvent.changedTouches;
        touch = e.touches || e.changedTouches;
        this.scaling = true;

        // Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        this.previewZoomLastDistance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      } else {
        this.previewZoomCanDrag = true;
      }
      this.previewZoomDragStarted = true;
      this.previewZoomIsDragging = this.previewZoomScaling = false;

      this.previewZoomStartCoords = {
        x: pos.x - this.previewZoomLast.x,
        y: pos.y - this.previewZoomLast.y
      };

      this.startCoords = {
        x: this.applyScaleToMoveX(this.previewZoomStartCoords.x),
        y: this.applyScaleToMoveY(this.previewZoomStartCoords.y)
      };

      console.log(['start', this.previewZoomStartCoords]);

    }
  }

  previewZoomListenerMouseMoveTouchMove(e) {
    e.preventDefault();
    var pos = this.previewZoomPointerEvents(e),
      offset = e.type === "touchmove" ? 1.3 : 1;

    if (this.canDrag() && this.previewZoomDragStarted) {
      this.previewZoomIsDragging = true;
    }

    if (this.previewZoomIsDragging && this.canDrag() && this.scaling === false) {

      if (this.inZoomRect(pos)) {

        this.previewZoomMoveX = (pos.x - this.previewZoomStartCoords.x) * offset;
        this.previewZoomMoveY = (pos.y - this.previewZoomStartCoords.y) * offset;

        // this.redraw = requestAnimationFrame(this.canvasDraw);
        console.log(['move', this.previewZoomMoveX, this.previewZoomMoveY]);

        let moveX = this.applyScaleToMoveX(this.previewZoomMoveX);
        let moveY = this.applyScaleToMoveY(this.previewZoomMoveY);
        console.log(['move', moveX, moveY]);

        this.moveX = moveX;
        this.moveY = moveY;
        this.redraw = requestAnimationFrame(this.canvasDraw);
      }
    } else if (this.scaling === true) {
      if (e instanceof TouchEvent) {
        var touch = e.originalEvent.touches || e.originalEvent.changedTouches;

        //Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        this.previewZoomDistance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      }
      // this.scaleDraw = requestAnimationFrame(this.scaleCanvasTouch);
      console.log(['move', this.previewZoomMoveX, this.previewZoomMoveY, this.previewZoomDistance]);
    }
  }

  pzlLeaveEnd(e) {
    e.preventDefault();
    var pos = this.previewZoomPointerEvents(e);

    if (this.previewZoomDragStarted || this.previewZoomIsDragging) {

      this.previewZoomLast = {
        // x: position.x - e.target.offsetLeft - this.previewZoomStartCoords.x,
        // y: position.y - e.target.offsetTop - this.previewZoomStartCoords.y
        x: pos.x - this.previewZoomStartCoords.x,
        y: pos.y - this.previewZoomStartCoords.y
      };
      console.log(['end', this.previewZoomLast]);

      this.last = {
        x: this.applyScaleToMoveX(this.previewZoomLast.x),
        y: this.applyScaleToMoveY(this.previewZoomLast.y)
      };

      this.previewZoomIsDragging = false;
      cancelAnimationFrame(this.scaleDraw);
      cancelAnimationFrame(this.redraw);
    }
    this.previewZoomDragStarted = this.previewZoomIsDragging = false;
  }

  previewZoomListenerMouseLeave(e) {
    this.pzlLeaveEnd(e);
  }

  previewZoomListenerMouseUpTouchEnd(e) {
    this.pzlLeaveEnd(e);
  }

}

export default Scaling;
