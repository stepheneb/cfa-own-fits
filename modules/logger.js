/*jshint esversion: 6 */

import layerHistogram from './layerHistogram.js';
import utilities from './utilities.js';

let logger = {};

logger.imageData = source => {
  let h = utilities.histogram(source.uint8Data, 64, 0, 256);
  let [min, max] = utilities.forLoopMinMax(source.uint8Data);
  let str = `
    Histogram (canvas uint8Data): name: ${source.name}, min: ${min}, max: ${max}
    hmin: ${utilities.roundNumber(source.min, 4)}, hmax: ${utilities.roundNumber(source.max, 4)}
    brightness: ${utilities.roundNumber(source.brightness, 4)}
    contrast: ${utilities.roundNumber(source.contrast, 4)}
    scaling: ${source.scaling}
  `;
  console.log(str);
  console.table(h);
  layerHistogram.update(h, source.scaling);
};

logger.rawData = source => {
  let h = utilities.histogram(source.rawdata, 30, source.min, source.max);
  let [min, max] = utilities.forLoopMinMax(source.rawdata);
  console.log(`Histogram (raw data): name: ${source.name}, min: ${utilities.roundNumber(min, 3)}, max: ${utilities.roundNumber(max, 3)}, hmin: ${utilities.roundNumber(source.min, 4)}, hmax: ${utilities.roundNumber(source.max, 4)}, contrast: ${utilities.roundNumber(source.contrast, 4)}`);
  console.table(h);
};

export default logger;
