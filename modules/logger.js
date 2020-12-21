/*jshint esversion: 6 */
/*global app  */

import layerHistogram from './layerHistogram.js';
import utilities from './utilities.js';

let logger = {};

let print = msg => {
  if (app.logger) {
    console.log(msg);
  }
};

let printTable = msg => {
  if (app.logger) {
    console.table(msg);
  }
};

logger.imageData = (canvasImage, source) => {
  let data = canvasImage.selectedSourcePixelData;
  let h = utilities.histogram(data, 64, 0, 256);
  let [min, max] = utilities.forLoopMinMax(data);
  let str = `
    Histogram (canvas uint8Data): name: ${source.name}, min: ${min}, max: ${max}
    hmin: ${utilities.roundNumber(source.min, 4)}, hmax: ${utilities.roundNumber(source.max, 4)}
    brightness: ${utilities.roundNumber(source.brightness, 4)}
    contrast: ${utilities.roundNumber(source.contrast, 4)}
    scaling: ${source.scaling}
  `;
  print(str);
  printTable(h);
  layerHistogram.update(h, source.scaling);
};

logger.rawData = (canvasImage, source) => {
  let rawdata = canvasImage.rawDataForSource(source);
  let h = utilities.histogram(rawdata, 30, source.min, source.max);
  let [min, max] = utilities.forLoopMinMax(rawdata);
  print(`Histogram (raw data): name: ${source.name}, min: ${utilities.roundNumber(min, 3)}, max: ${utilities.roundNumber(max, 3)}, hmin: ${utilities.roundNumber(source.min, 4)}, hmax: ${utilities.roundNumber(source.max, 4)}, contrast: ${utilities.roundNumber(source.contrast, 4)}`);
  printTable(h);
};

export default logger;
