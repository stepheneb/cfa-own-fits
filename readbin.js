/*jshint esversion: 6 */

var canvasred = document.getElementById("canvasred"),
  canvasgreen = document.getElementById("canvasgreen"),
  canvasblue = document.getElementById("canvasblue");

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
    setupCanvas(canvasred, redRawData, redMin, redMax);
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
    setupCanvas(canvasgreen, greenRawData, greenMin, greenMax);
  }
};

oReqGreen.send(null);

// Blue

var oReqBlue = new XMLHttpRequest();

oReqBlue.open("GET", "rawdata/blue.bin", true);
oReqBlue.responseType = "arraybuffer";


oReqBlue.onload = function (oEvent) {
  var arrayBuffer = oReqBlue.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    blueRawData = new Float32Array(arrayBuffer);
    [blueMin, blueMax] = forLoopMinMax(blueRawData);
    setupCanvas(canvasblue, blueRawData, blueMin, blueMax);
  }
};

oReqBlue.send(null);

const forLoopMinMax = (array) => {
  let min = array[0], max = array[0];

  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    min = (value < min) ? value : min;
    max = (value > max) ? value : max;
  }

  return [min, max];
};
