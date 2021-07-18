/*jshint esversion: 6 */

let layerHistogram = {};

layerHistogram.canvasDataId = "image-layer-histogram-canvas";
layerHistogram.canvasRawDataId = "layer-histogram-rawdata-canvas";

layerHistogram.canvasTitleId = "layer-histogram-title";
layerHistogram.rawDataTitleId = "layer-histogram-title-rawdata";

layerHistogram.render = () => {
  let html = `
    <div id="layer-histogram" class="layer-histogram">
      <div id="${layerHistogram.canvasTitleId}" class="mt-2">Image Layer Histogram</div>
      <div class="col-12 histogram-container">
        <canvas id="${layerHistogram.canvasDataId}"></canvas>
      </div>
    </div>
  `;
  return html;
};

layerHistogram.renderRawData = () => {
  let html = `
    <div id="layer-histogram-rawdata" class="layer-histogram">
      <div id="${layerHistogram.rawDataTitleId}" class="mt-2">Raw Data Histogram</div>
      <div class="col-12 histogram-container">
        <canvas id="${layerHistogram.canvasRawDataId}"></canvas>
      </div>
    </div>
  `;
  return html;
};

layerHistogram.update = (h, source) => {
  let canvas = document.getElementById(layerHistogram.canvasDataId);
  let title = document.getElementById(layerHistogram.canvasTitleId);
  title.innerHTML = `Image Layer Histogram: ${source.name}`;
  layerHistogram.finishUpdate(h, source, canvas);
};

layerHistogram.updateRawData = (h, source) => {
  let canvas = document.getElementById(layerHistogram.canvasRawDataId);
  let title = document.getElementById(layerHistogram.rawDataTitleId);
  title.innerHTML = `Raw Data Histogram: ${source.name}`;
  layerHistogram.finishUpdate(h, source, canvas);
};

layerHistogram.finishUpdate = (h, source, canvas) => {
  let histogram = [];
  let { width, height } = canvas.parentElement.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d');
  switch (source.scaling) {
  case "linear":
    histogram = h.slice(1, h.length - 1);
    break;
  case "log":
    histogram = h.slice(0, h.length - 1);
    break;
  }

  let bars = histogram.length;
  let columnWidth = width / bars;
  let barWidth = Math.floor(columnWidth - 1);
  let barHeight = 1;
  let data = histogram.map(row => row[1]);
  let maxCount = Math.max(...data);
  let log10MaxCount = Math.log10(maxCount);
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#bff5aa';
  for (var i = 0; i < bars; i++) {
    switch (source.scaling) {
    case "linear":
      barHeight = data[i] / maxCount * height * 0.9;
      break;
    case "log":
      barHeight = (Math.log10(Math.max(data[i], 1)) - 1) / log10MaxCount * height * 0.9;
      break;
    }
    ctx.fillRect(i * columnWidth, height - barHeight, barWidth, barHeight);
  }
};

export default layerHistogram;
