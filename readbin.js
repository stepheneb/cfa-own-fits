/*jshint esversion: 6 */

var pageNum = 1,
  pageCount = 4,
  startOverButton = document.getElementById('btn-start-over'),
  backButton = document.getElementById('btn-back'),
  forwardButton = document.getElementById('btn-forward'),
  toggleFullscreenButton = document.getElementById('btn-toggle-fullscreen');

var canvasred = document.getElementById("canvasred"),
  canvasgreen = document.getElementById("canvasgreen"),
  canvasblue = document.getElementById("canvasblue"),
  canvasrgb = document.getElementById("canvasrgb");

var redRawData, redMin, redMax;
var greenRawData, greenMin, greenMax;
var blueRawData, blueMin, blueMax;

// Red

var oReqRed = new XMLHttpRequest();

oReqRed.open("GET", "rawdata/red.bin", true);
oReqRed.responseType = "arraybuffer";

oReqRed.onload = function (oEvent) {
  var arrayBuffer = oReqRed.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    redRawData = new Float32Array(arrayBuffer);
    [redMin, redMax] = forLoopMinMax(redRawData);
    [redMin, redMax] = [4, 24];
    setupCanvas(canvasred, redRawData, redMin, redMax, 'red');
    oReqGreen.send(null);

  }
};

oReqRed.send(null);

// Green

var oReqGreen = new XMLHttpRequest();

oReqGreen.open("GET", "rawdata/green.bin", true);
oReqGreen.responseType = "arraybuffer";

oReqGreen.onload = function (oEvent) {
  var arrayBuffer = oReqGreen.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    greenRawData = new Float32Array(arrayBuffer);
    [greenMin, greenMax] = forLoopMinMax(greenRawData);
    [greenMin, greenMax] = [0, 64];
    setupCanvas(canvasgreen, greenRawData, greenMin, greenMax, 'green');
    oReqBlue.send(null);
  }
};

// Blue

var oReqBlue = new XMLHttpRequest();

oReqBlue.open("GET", "rawdata/blue.bin", true);
oReqBlue.responseType = "arraybuffer";

oReqBlue.onload = function (oEvent) {
  var arrayBuffer = oReqBlue.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    blueRawData = new Float32Array(arrayBuffer);
    [blueMin, blueMax] = forLoopMinMax(blueRawData);
    [blueMin, blueMax] = [4, 24];
    setupCanvas(canvasblue, blueRawData, blueMin, blueMax, 'blue');
    showRGB();
  }
};

// RGB

function showRGB() {
  if (canvasrgb) {
    setupCanvas(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
  }
  scrollToPage(1);
}

const forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];

  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    min = (value < min) ? value : min;
    max = (value > max) ? value : max;
  }

  return [min, max];
};

document.addEventListener("keydown", function (e) {
  switch (e.key) {
  case 'Enter':
    toggleFullScreen();
    break;
  case 'ArrowRight':
    nextPage();
    break;
  case 'ArrowLeft':
    previousPage();
    break;
  }
}, false);

toggleFullscreenButton.addEventListener('click', event => {
  toggleFullScreen();
});

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

startOverButton.addEventListener('click', event => {
  scrollToPage(1);
});

backButton.addEventListener('click', event => {
  previousPage();
});

forwardButton.addEventListener('click', event => {
  nextPage();
});

function nextPage() {
  if (pageNum < pageCount) {
    scrollToPage(++pageNum);
  }
}

function previousPage() {
  if (pageNum > 1) {
    scrollToPage(--pageNum);
  }
}

function scrollToPage(num) {
  var p = document.getElementById('page-' + num);
  p.scrollIntoView(true);
  pageNum = num;
  updatePageNavigationButtonState();
}

function updatePageNavigationButtonState() {
  if (pageNum == 1) {
    startOverButton.disabled = true;
    backButton.disabled = true;
  } else {
    startOverButton.disabled = false;
    backButton.disabled = false;
  }
  if (pageNum == pageCount) {
    forwardButton.disabled = true;
  } else {
    forwardButton.disabled = false;
  }
}
