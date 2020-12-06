/*jshint esversion: 6 */

import { updateLayerHistogram } from './layerHistogram.js';
import { forLoopMinMax, roundNumber, histogram } from './utilities.js';

let consoleLogCanvasDataHistogram = source => {
  let h = histogram(source.uint8Data, 64, 0, 256);
  let [min, max] = forLoopMinMax(source.uint8Data);
  let str = `
    Histogram (canvas uint8Data): name: ${source.name}, min: ${min}, max: ${max}
    hmin: ${roundNumber(source.min, 4)}, hmax: ${roundNumber(source.max, 4)}
    brightness: ${roundNumber(source.brightness, 4)}
    contrast: ${roundNumber(source.contrast, 4)}
    scaling: ${source.scaling}
  `;
  console.log(str);
  console.table(h);
  updateLayerHistogram(h, source.scaling);
};

let consoleLogRawDataHistogram = source => {
  let h = histogram(source.rawdata, 30, source.min, source.max);
  let [min, max] = forLoopMinMax(source.rawdata);
  console.log(`Histogram (raw data): name: ${source.name}, min: ${roundNumber(min, 3)}, max: ${roundNumber(max, 3)}, hmin: ${roundNumber(source.min, 4)}, hmax: ${roundNumber(source.max, 4)}, contrast: ${roundNumber(source.contrast, 4)}`);
  console.table(h);
};

export { consoleLogCanvasDataHistogram, consoleLogRawDataHistogram };
