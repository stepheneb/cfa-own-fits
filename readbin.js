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

var
  sliderMaximumBrightness = 1024,
  sliderInitialBrightness = 512;

console.log(`Brightness min: 0, max: ${sliderMaximumBrightness}, initial value: ${sliderInitialBrightness}`);
// Red

var
  redRawData, redMin, redMax,
  redBrightness = sliderInitialBrightness,
  brightnessRedSlider = document.getElementById('brightness-red');

brightnessRedSlider.max = sliderMaximumBrightness;
brightnessRedSlider.value = redBrightness;

var oReqRed = new XMLHttpRequest();

oReqRed.open("GET", "rawdata/red.bin", true);
oReqRed.responseType = "arraybuffer";

oReqRed.onload = function (oEvent) {
  var arrayBuffer = oReqRed.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    redRawData = new Float32Array(arrayBuffer);
    [redMin, redMax] = forLoopMinMax(redRawData);
    console.log(`rawdata: red min: ${redMin}, max: ${redMax}`);
    [redMin, redMax] = [4, 10];
    console.log(`rendered limits: red min: ${redMin}, max: ${redMax}`);
    setupCanvas(canvasred, redRawData, redMin, redMax, 'red');

    brightnessRedSlider.addEventListener('input', e => {
      redBrightness = e.target.valueAsNumber;
      renderCanvasRed(canvasred, redRawData, redMin, redMax);
    });

    brightnessRedSlider.addEventListener('change', e => {
      renderCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
    });

    oReqGreen.send(null);
  }
};

oReqRed.send(null);

// Green

var
  greenRawData, greenMin, greenMax,
  greenBrightness = sliderInitialBrightness,
  brightnessGreenSlider = document.getElementById('brightness-green');

brightnessGreenSlider.max = sliderMaximumBrightness;
brightnessGreenSlider.value = greenBrightness;

var oReqGreen = new XMLHttpRequest();

oReqGreen.open("GET", "rawdata/green.bin", true);
oReqGreen.responseType = "arraybuffer";

oReqGreen.onload = function (oEvent) {
  var arrayBuffer = oReqGreen.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    greenRawData = new Float32Array(arrayBuffer);
    [greenMin, greenMax] = forLoopMinMax(greenRawData);
    console.log(`rawdata: green min: ${greenMin}, max: ${greenMax}`);
    [greenMin, greenMax] = [0, 64];
    console.log(`rendered limits: green min: ${greenMin}, max: ${greenMax}`);
    setupCanvas(canvasgreen, greenRawData, greenMin, greenMax, 'green');

    brightnessGreenSlider.addEventListener('input', e => {
      greenBrightness = e.target.valueAsNumber;
      renderCanvasGreen(canvasgreen, greenRawData, greenMin, greenMax);
    });

    brightnessGreenSlider.addEventListener('change', e => {
      renderCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
    });

    oReqBlue.send(null);
  }
};

// Blue

var
  blueRawData, blueMin, blueMax,
  blueBrightness = sliderInitialBrightness,
  brightnessBlueSlider = document.getElementById('brightness-blue');

brightnessBlueSlider.max = sliderMaximumBrightness;
brightnessBlueSlider.value = blueBrightness;

var oReqBlue = new XMLHttpRequest();

oReqBlue.open("GET", "rawdata/blue.bin", true);
oReqBlue.responseType = "arraybuffer";

oReqBlue.onload = function (oEvent) {
  var arrayBuffer = oReqBlue.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    blueRawData = new Float32Array(arrayBuffer);
    [blueMin, blueMax] = forLoopMinMax(blueRawData);
    console.log(`rawdata: blue min: ${blueMin}, max: ${blueMax}`);
    [blueMin, blueMax] = [0, 12];
    console.log(`rendered limits: blue min: ${blueMin}, max: ${blueMax}`);
    setupCanvas(canvasblue, blueRawData, blueMin, blueMax, 'blue');
    brightnessBlueSlider.addEventListener('input', e => {
      blueBrightness = e.target.valueAsNumber;
      renderCanvasBlue(canvasblue, blueRawData, blueMin, blueMax);
    });

    brightnessBlueSlider.addEventListener('change', e => {
      renderCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
    });

    showRGB();
  }
};

function restoreOriginalValues() {
  redBrightness = 128;
  brightnessRedSlider.value = redBrightness;
  greenBrightness = 128;
  brightnessGreenSlider.value = greenBrightness;
  blueBrightness = 128;
  brightnessBlueSlider.value = blueBrightness;
}

// RGB

function showRGB() {
  if (canvasrgb) {
    setupCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
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
    scrollToPage(pageNum);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      scrollToPage(pageNum);
    }
  }
}

startOverButton.addEventListener('click', event => {
  scrollToPage(1);
  restoreOriginalValues();
  renderCanvasRed(canvasred, redRawData, redMin, redMax);
  renderCanvasGreen(canvasgreen, greenRawData, greenMin, greenMax);
  renderCanvasBlue(canvasblue, blueRawData, blueMin, blueMax);
  renderCanvasRGB(canvasrgb, redRawData, redMin, redMax, greenRawData, greenMin, greenMax, blueRawData, blueMin, blueMax);
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
    backButton.disabled = true;
  } else {
    backButton.disabled = false;
  }
  if (pageNum == pageCount) {
    forwardButton.disabled = true;
  } else {
    forwardButton.disabled = false;
  }
}
