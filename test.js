/*jshint esversion: 8 */
/*global app, */

window.app = {};

(function start() {
  let images = [{
      src: './rawdata/HST_Lagoon/1300x1250/HST_Lagoon_f658Red.bin',
      nx: 1300,
      ny: 1250
    },
    {
      src: './rawdata/HST_Lagoon/2600x2500/HST_Lagoon_f658Red.bin',
      nx: 2600,
      ny: 2500
    },
    {
      src: './rawdata/m51/1192x1800/m51_optical_R.bin',
      nx: 1192,
      ny: 1800
    },
    {
      src: './rawdata/m51/2384x3600/m51_optical_R.bin',
      nx: 2384,
      ny: 3600
    }
  ];
  Object.assign(app, images[3]);
  fetch(app.src)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        return response.arrayBuffer();
      }
    })
    .then(arrayBuffer => {
      app.rawdata = new Float32Array(arrayBuffer);
      renderMainCanvas();
      createImageBitmap(app.imageData, 0, 0, app.nx, app.ny)
        .then(imageBitmap => {
          app.imageBitmap = imageBitmap;
          renderLayerCanvas(app.imageBitmap);
          scaling.enable(app.layer.canvas, app.imageBitmap);
        });
    })
    .catch(e => {
      console.log('There has been a problem with your fetch operation: ' + e.message);
    });
})();

function renderLayerCanvas(bitmap) {
  app.layer = {};
  let layer = app.layer;
  layer.canvas = document.getElementById('layer-image');
  // layer.canvas.setAttribute('width', `${layer.canvas.parentElement.clientWidth}`);
  // layer.canvas.setAttribute('height', `${layer.canvas.parentElement.clientHeight}`);

  layer.ctx = app.canvas.getContext('2d');
  layer.ctx.fillStyle = "rgba(0,0,0,255)";
  layer.ctx.imageSmoothingEnabled = true;
  layer.ctx.globalCompositeOperation = "source-over";
  layer.ctx.drawImage(bitmap, 0, 0);
}

function renderMainCanvas() {
  app.canvas = document.getElementById('main-image');
  app.ctx = app.canvas.getContext('2d');
  app.ctx.fillStyle = "rgba(0,0,0,255)";
  app.ctx.imageSmoothingEnabled = true;
  app.ctx.globalCompositeOperation = "source-over";
  app.imageData = app.ctx.createImageData(app.nx, app.ny);
  app.data = app.imageData.data;
  let min = 0;
  let max = 10;
  let range = max - min;
  let scale = 256 / range;
  let i, pixindex, x, y, val, scaledval;

  pixindex = 0;
  for (y = 0; y < app.ny; y++) {
    for (x = 0; x < app.nx; x++) {
      i = y * app.nx + x;
      val = app.rawdata[i];
      scaledval = val * scale - min;
      app.data[pixindex] = scaledval;
      app.data[pixindex + 3] = 255;
      pixindex += 4;
    }
  }
  app.canvas.width = app.nx;
  app.canvas.height = app.ny;
  app.ctx.putImageData(app.imageData, 0, 0);
  app.w = app.canvas.parentElement.offsetWidth;
  app.h = app.canvas.parentElement.offsetHeight;
}

let scaling = {};

scaling.enable = function (canvas, imageBitmap) {
  let scaleButtonGroup = document.querySelector('div.scale');
  let [zoomInButton, zoomOutButton] = scaleButtonGroup.querySelectorAll('button');
  let touchinfo = document.querySelector('span.touchinfo');
  var
    ctx,
    scaling = false,
    scale = 1,
    maxScale,
    ratio,
    scaleFactor = 1.1,
    scaleDraw,
    imageWidth,
    imageHeight,
    distance,
    lastDistance = 0,
    canDrag = false,
    isDragging = false,
    startCoords = {
      x: 0,
      y: 0
    },
    last = {
      x: 0,
      y: 0
    },
    moveX = 0,
    moveY = 0,
    redraw,
    nx = imageBitmap.width,
    ny = imageBitmap.height,
    clientWidth, clientHeight,
    clientDimensions = {};

  function isTouchDevice() {
    return typeof window.ontouchstart !== "undefined";
  }

  function hideTouchTooltip() {
    if (touchinfo) {
      touchinfo.classList.add('hidden');
    }
  }

  function scaleCanvas() {
    if (scaling === "down") {
      scale = scale / scaleFactor;
      if (scale < 1) scale = 1;
    } else if (scaling === "up") {
      scale = scale * scaleFactor;
      if (scale > maxScale) scale = maxScale;
    }
    updateZoomButtons();
    redraw = requestAnimationFrame(canvasDraw);
  }

  function scaleCanvasTouch() {
    if (lastDistance > distance) {
      scale = scale / scaleFactor;
      if (scale < 1) scale = 1;
    } else if (lastDistance < distance) {
      scale = scale * scaleFactor;
      if (scale > maxScale) scale = maxScale;
    }

    redraw = requestAnimationFrame(canvasDraw);

    lastDistance = distance;
  }

  function canvasDraw() {
    imageWidth = imageBitmap.width * ratio * scale;
    imageHeight = imageBitmap.height * ratio * scale;

    var w = Math.min(clientDimensions.width, imageWidth);
    var h = Math.min(clientDimensions.height, imageHeight);

    canvas.width = w;
    canvas.height = h;

    var offsetX = (imageWidth - canvas.width) / 2,
      offsetY = (imageHeight - canvas.height) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (moveX > offsetX) {
      moveX = offsetX;
    }

    if (moveX < -(imageWidth - offsetX - canvas.width)) {
      moveX = -(imageWidth - offsetX - canvas.width);
    }

    if (moveY > offsetY) {
      moveY = offsetY;
    }

    if (moveY < -(imageHeight - offsetY - canvas.height)) {
      moveY = -(imageHeight - offsetY - canvas.height);
    }

    ctx.drawImage(
      imageBitmap,
      -offsetX + moveX,
      -offsetY + moveY,
      imageWidth,
      imageHeight
    );
  }

  function calcMaxScale() {
    maxScale = Math.min(imageBitmap.height / canvas.height, imageBitmap.width / canvas.width);
    ratio = 1 / maxScale;
  }

  function getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  function resizeCanvas(c) {
    resizeCanvas1(c);
    calcMaxScale();
    redraw = requestAnimationFrame(canvasDraw);
  }

  function resizeCanvas1(c) {
    // c.width = c.parentElement.clientWidth;
    // c.height = c.parentElement.clientHeight;

    clientDimensions = getWidthHeight(c);
    clientWidth = clientDimensions.width;
    clientHeight = clientDimensions.height;
    let sourceAspectRatio = nx / ny;
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
  }

  function resizeCanvas2() {
    // canvas.setAttribute('width', `${canvas.parentElement.clientWidth}`);
    // canvas.setAttribute('height', `${canvas.parentElement.clientHeight}`);
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    calcMaxScale();
    redraw = requestAnimationFrame(canvasDraw);
  }

  function updateZoomButtons() {
    zoomInButton.disabled = false;
    zoomOutButton.disabled = false;

    if (scale == maxScale) {
      zoomInButton.disabled = true;
    } else if (scale == 1) {
      zoomOutButton.disabled = true;
    }
  }

  /// Event Handling ...

  function buttonListener(e) {
    if (e.target.dataset.scale === 'down') {
      scaling = "down";
    } else {
      scaling = "up";
    }
    scaleDraw = requestAnimationFrame(scaleCanvas);
  }

  [zoomInButton, zoomOutButton].forEach(b => [
    b.addEventListener('click', buttonListener)
  ]);

  /*
      POINTER EVENTS
  */

  function pointerEvents(e) {
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

  function listenerMouseDownTouchStart(e) {
    var position = pointerEvents(e),
      touch;

    if (e.type === "touchstart" && touch.length === 2) {
      touch = e.originalEvent.touches || e.originalEvent.changedTouches;
      scaling = true;

      // Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
      lastDistance = Math.sqrt(
        (touch[0].clientX - touch[1].clientX) *
        (touch[0].clientX - touch[1].clientX) +
        (touch[0].clientY - touch[1].clientY) *
        (touch[0].clientY - touch[1].clientY)
      );
    } else {
      canDrag = true;
      isDragging = scaling = false;

      startCoords = {
        x: position.x - e.target.offsetLeft - last.x,
        y: position.y - e.target.offsetTop - last.y
      };
    }
  }

  canvas.addEventListener('mousedown', listenerMouseDownTouchStart);
  canvas.addEventListener('mousedown', listenerMouseDownTouchStart);

  function listenerMouseMoveTouchMove(e) {
    e.preventDefault();

    isDragging = true;

    if (isDragging && canDrag && scaling === false) {
      var position = pointerEvents(e),
        offset = e.type === "touchmove" ? 1.3 : 1;

      moveX = (position.x - e.target.offsetLeft - startCoords.x) * offset;
      moveY = (position.y - e.target.offsetTop - startCoords.y) * offset;

      redraw = requestAnimationFrame(canvasDraw);
    } else if (scaling === true) {
      if (e instanceof TouchEvent) {
        var touch = e.originalEvent.touches || e.originalEvent.changedTouches;

        //Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        distance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      }
      scaleDraw = requestAnimationFrame(scaleCanvasTouch);
    }

  }

  canvas.addEventListener('mousemove', listenerMouseMoveTouchMove);
  canvas.addEventListener('touchmove', listenerMouseMoveTouchMove);

  function listenerMouseUpTouchEnd(e) {
    var position = pointerEvents(e);

    canDrag = isDragging = scaling = false;

    last = {
      x: position.x - e.target.offsetLeft - startCoords.x,
      y: position.y - e.target.offsetTop - startCoords.y
    };

    cancelAnimationFrame(scaleDraw);
    cancelAnimationFrame(redraw);
  }

  canvas.addEventListener('mouseup', listenerMouseUpTouchEnd);
  canvas.addEventListener('touchend', listenerMouseUpTouchEnd);

  if (isTouchDevice()) {
    scaleFactor = 1.02;
    canvas.classList.add('touch');
    canvas.addEventListener('touchstart', hideTouchTooltip);
  } else {
    hideTouchTooltip();
  }

  window.addEventListener('resize', resizeCanvas);
  // Startup ...

  ctx = canvas.getContext('2d');

  resizeCanvas(canvas);

  updateZoomButtons();
};
