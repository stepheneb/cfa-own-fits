/*jshint esversion: 6 */

class Scaling {
  constructor(canvas, imageBitmap, previewZoomCanvas) {
    this.canvas = canvas;
    this.clientDimensions = {};
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.w = 0;
    this.h = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.queuedmoves = [];
    this.canvasDrawfinished = true;
    this.tick = false;

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

    this.lastMove = { x: 0, y: 0 };
    this.previewZoomLast = { x: 0, y: 0 };

    this.lastDraggedPos = {};
    this.lastDraggedPreviewZoomPos = {};

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
      'listenerMouseLeave',
      'listenerUpLeaveEnd',
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

      ['mouseleave', this.listenerMouseLeave],
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
    this.queueCanvasDraw();
    // this.redraw = requestAnimationFrame(this.canvasDraw);
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
    this.moveX = this.moveY = 0;
    this.updateZoomButtons();
    this.queueCanvasDraw();
    // this.redraw = requestAnimationFrame(this.canvasDraw);
  }

  scaleCanvasTouch() {
    if (this.lastDistance > this.distance) {
      this.scale = this.scale / this.scaleFactor;
      if (this.scale < 1) this.scale = 1;
    } else if (this.lastDistance < this.distance) {
      this.scale = this.scale * this.scaleFactor;
      if (this.scale > this.maxScale) this.scale = this.maxScale;
    }

    this.queueCanvasDraw();
    // this.redraw = requestAnimationFrame(this.canvasDraw);

    this.lastDistance = this.distance;
  }

  calcMainWidthsHeightsLimitMoves() {
    this.imageWidth = this.imageBitmap.width * this.ratio * this.scale;
    this.imageHeight = this.imageBitmap.height * this.ratio * this.scale;
    this.w = Math.min(this.clientDimensions.width, this.imageWidth);
    this.h = Math.min(this.clientDimensions.height, this.imageHeight);
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.offsetX = (this.imageWidth - this.canvas.width) / 2.01;
    this.offsetY = (this.imageHeight - this.canvas.height) / 2.01;

    let minMoveX = -(this.imageWidth - this.offsetX - this.w);
    let minMoveY = -(this.imageHeight - this.offsetY - this.h);

    if (this.moveX > this.offsetX) {
      this.moveX = this.offsetX;
    }

    if (this.moveX < minMoveX) {
      this.moveX = minMoveX;
    }

    if (this.moveY > this.offsetY) {
      this.moveY = this.offsetY;
    }

    if (this.moveY < minMoveY) {
      this.moveY = minMoveY;
    }
  }

  canvasDraw() {
    this.calcMainWidthsHeightsLimitMoves();
    console.log(`canvasDraw: move: ${this.moveX}, ${this.moveY}, offset: ${this.offsetX}, ${this.offsetY}`);
    this.ctx.drawImage(
      this.imageBitmap,
      -this.offsetX + this.moveX,
      -this.offsetY + this.moveY,
      this.imageWidth,
      this.imageHeight
    );
    if (this.previewZoomCanvas) {
      this.previewZoomCanvasDraw({
        sw: this.w / this.imageWidth,
        sh: this.h / this.imageHeight,
        sx: (this.offsetX - this.moveX) / this.imageWidth,
        sy: (this.offsetY - this.moveY) / this.imageHeight
      });
    }
    this.canvasDrawfinished = true;
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
    this.redraw = requestAnimationFrame(() => {
      setTimeout(() => {
        this.clientDimensions = this.getWidthHeight(this.canvas.parentElement);
        this.resizeCanvas(this.canvas);
        this.reCalculatePreviewZoomRect();
      });
    });
  }

  resizeCanvas(c) {
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
    let pos = {
      x: 0,
      y: 0
    };
    let targetRect = e.target.getBoundingClientRect();

    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove"
    ) {
      pos.x = e.pageX - targetRect.x;
      pos.y = e.pageY - targetRect.y;
    }
    return pos;
  }

  listenerMouseDownTouchStart(e) {
    var pos = this.pointerEvents(e),
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
      x: pos.x - this.lastMove.x,
      y: pos.y - this.lastMove.y
    };

    this.lastDraggedPos.x = pos.x;
    this.lastDraggedPos.y = pos.y;

    console.log(['start: startCoords:', this.startCoords.x, this.startCoords.y, ', pos: ', pos.x, pos.y, ', lastStart: ', this.lastMove.x, this.lastMove.y, ', dragStarted: ', this.dragStarted]);
  }

  listenerMouseMoveTouchMove(e) {
    e.preventDefault();
    let pos = this.pointerEvents(e);
    let offset = e.type === "touchmove" ? 1.3 : 1;

    if (!this.dragStarted && !this.scaling) {
      return;
    }

    if (this.canDrag() && this.dragStarted) {
      this.isDragging = true;
    }

    if (this.isDragging && !this.scaling) {
      this.moveX = (pos.x - this.startCoords.x) * offset;
      this.moveY = (pos.y - this.startCoords.y) * offset;

      this.calcMainWidthsHeightsLimitMoves();

      this.lastDraggedPos.x = pos.x;
      this.lastDraggedPos.y = pos.y;

      // this.redraw = requestAnimationFrame(this.canvasDraw);
      this.queueCanvasDraw();

      console.log(['move', this.moveX, this.moveY]);

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

  // queueCanvasDraw() {
  //   this.redraw = requestAnimationFrame(this.canvasDraw);
  //   // if (!this.tick) {
  //   //   this.redraw = requestAnimationFrame(() => {
  //   //     this.canvasDraw();
  //   //     this.tick = false;
  //   //   });
  //   //   this.tick = true;
  //   // }
  // }

  queueCanvasDraw() {
    this.redraw = requestAnimationFrame(this.canvasDraw);
    // this.queuedmoves.push([this.moveX, this.moveY]);
    // if (this.canvasDrawfinished) {
    //   this.redraw = requestAnimationFrame(() => {
    //     this.canvasDraw();
    //     this.canvasDrawfinished = true;
    //   });
    //   this.canvasDrawfinished = false;
    // }
  }

  listenerUpLeaveEnd(name) {
    if (this.dragStarted || this.isDragging) {
      this.lastMove = {
        x: this.moveX,
        y: this.moveY
      };
    }
    this.dragStarted = this.isDragging = this.scaling = false;
    cancelAnimationFrame(this.scaleDraw);
    cancelAnimationFrame(this.redraw);
    this.redraw = requestAnimationFrame(this.canvasDraw);
    console.log([name, 'lastMove: ', this.lastMove.x, this.lastMove.y]);
  }

  listenerMouseLeave(e) {
    e.preventDefault();
    this.listenerUpLeaveEnd('leave');
  }

  listenerMouseUpTouchEnd(e) {
    // var pos = this.pointerEvents(e);
    e.preventDefault();
    this.listenerUpLeaveEnd('up-end');
  }

  /*
      POINTER EVENTS for preview zoom canvas
  */

  previewZoomPointerEvents(e) {
    let pos = {
      x: 0,
      y: 0
    };
    let targetRect = e.target.getBoundingClientRect();

    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove"
    ) {
      pos.x = e.pageX - targetRect.x;
      pos.y = e.pageY - targetRect.y;
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
      // this.scaleToMoveX = this.clientDimensions.width / this.pzcClientWidth;
      // this.scaleToMoveY = this.clientDimensions.height / this.pzcClientHeight;
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

      this.lastDraggedPreviewZoomPos.x = pos.x;
      this.lastDraggedPreviewZoomPos.y = pos.y;

      console.log(['start', pos.x, pos.y]);
    } else {
      console.log(['start-out', pos.x, pos.y]);
    }
  }

  previewZoomListenerMouseMoveTouchMove(e) {
    e.preventDefault();
    var pos = this.previewZoomPointerEvents(e),
      offset = e.type === "touchmove" ? 1.3 : 1;

    if (this.canDrag() && this.previewZoomDragStarted) {
      this.previewZoomIsDragging = true;
    }

    if (this.previewZoomIsDragging && this.canDrag()) {

      if (this.inZoomRect(pos)) {

        this.previewZoomMoveX = (pos.x - this.previewZoomStartCoords.x) * offset;
        this.previewZoomMoveY = (pos.y - this.previewZoomStartCoords.y) * offset;

        this.lastDraggedPreviewZoomPos.x = pos.x;
        this.lastDraggedPreviewZoomPos.y = pos.y;

        // console.log(['move-in-rect', this.previewZoomMoveX, this.previewZoomMoveY]);

        let moveX = this.applyScaleToMoveX(this.previewZoomMoveX);
        let moveY = this.applyScaleToMoveY(this.previewZoomMoveY);
        // console.log(['move', moveX, moveY]);

        this.moveX = moveX;
        this.moveY = moveY;
        // this.redraw = requestAnimationFrame(this.canvasDraw);
        this.queueCanvasDraw();
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
      // console.log(['move', this.previewZoomMoveX, this.previewZoomMoveY, this.previewZoomDistance]);
    } else {
      this.pzlUpEndLeave('move-touch-out', pos);
    }
  }

  pzlUpEndLeave(name, pos) {
    if (this.previewZoomDragStarted || this.previewZoomIsDragging) {
      this.previewZoomLast = {
        x: pos.x - this.previewZoomStartCoords.x,
        y: pos.y - this.previewZoomStartCoords.y
      };
      // console.log([name, this.previewZoomLast]);

      this.lastMove = {
        x: this.applyScaleToMoveX(this.previewZoomLast.x),
        y: this.applyScaleToMoveY(this.previewZoomLast.y)
      };

      cancelAnimationFrame(this.scaleDraw);
      cancelAnimationFrame(this.redraw);
    }
    this.previewZoomDragStarted = this.previewZoomIsDragging = false;
  }

  previewZoomListenerMouseLeave(e) {
    e.preventDefault();
    this.pzlUpEndLeave('up-end', this.lastDraggedPreviewZoomPos);
  }

  previewZoomListenerMouseUpTouchEnd(e) {
    // var pos = this.previewZoomPointerEvents(e);
    e.preventDefault();
    this.pzlUpEndLeave('up-end', this.lastDraggedPreviewZoomPos);
  }

}

export default Scaling;
