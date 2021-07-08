/*jshint esversion: 6 */
/*global app  */

import layerHistogram from './layerHistogram.js';
import u from './utilities.js';

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
  if (app.dev) {
    let data = canvasImage.selectedSourcePixelData;
    let h = u.histogram(data, 64, 0, 256);
    let [min, max] = u.forLoopMinMax(data);
    let str = `
      Histogram (canvas uint8Data): name: ${source.name}, min: ${min}, max: ${max}
      hmin: ${u.roundNumber(source.min, 4)}, hmax: ${u.roundNumber(source.max, 4)}
      brightness: ${u.roundNumber(source.brightness, 4)}
      contrast: ${u.roundNumber(source.contrast, 4)}
      scaling: ${source.scaling}
    `;
    print(str);
    printTable(h);
    layerHistogram.update(h, source);
  }
};

logger.rawData = (canvasImage, source) => {
  if (app.dev) {
    let rawdata = canvasImage.rawDataForSource(source);
    let h = u.histogram(rawdata, 30, source.min, source.max);
    let [min, max] = u.forLoopMinMax(rawdata);
    print(`Histogram (raw data): name: ${source.name}, min: ${u.roundNumber(min, 3)}, max: ${u.roundNumber(max, 3)}, hmin: ${u.roundNumber(source.min, 4)}, hmax: ${u.roundNumber(source.max, 4)}, contrast: ${u.roundNumber(source.contrast, 4)}`);
    printTable(h);
  }
};

export default logger;
