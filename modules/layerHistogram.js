/*jshint esversion: 6 */

let layerHistogram = {};

layerHistogram.canvasDataId = "image-layer-histogram-canvas";
layerHistogram.canvasRawDataId = "layer-histogram-rawdata-canvas";
layerHistogram.canvasTransformId = "layer-transform-canvas";

layerHistogram.canvasTitleId = "layer-histogram-title";
layerHistogram.rawDataTitleId = "layer-histogram-title-rawdata";
layerHistogram.transformTitleId = "layer-transform-title";

layerHistogram.render = () => {
  let html = `
    <div id="layer-histogram" class="layer-histogram">
      <header id="${layerHistogram.canvasTitleId}" class="mt-2"></header>
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
      <header id="${layerHistogram.rawDataTitleId}" class="mt-2"></header>
      <div class="col-12 histogram-container">
        <canvas id="${layerHistogram.canvasRawDataId}" data-scalingtype="linear"></canvas>
      </div>
    </div>
  `;
  return html;
};

layerHistogram.renderTransform = () => {
  let html = `
    <div id="layer-transform" class="layer-histogram">
      <header id="${layerHistogram.transformTitleId}" class="mt-2"></header>
      <div class="col-12 histogram-container">
        <canvas id="${layerHistogram.canvasTransformId}" data-scalingtype="linear"></canvas>
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
  layerHistogram.finishUpdate(h, source, canvas, 'linear');
};

layerHistogram.finishUpdate = (h, source, canvas) => {
  let histogram = [];
  let { width, height } = canvas.parentElement.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d');
  let scalingtype = canvas.dataset.scalingtype || source.scaling;
  switch (scalingtype) {
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
    switch (scalingtype) {
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

layerHistogram.updateTransform = (page) => {
  let source = page.selectedSource;
  let transform = page.canvasImages.brightnessContrastTransforms[page.selectedSource.name];
  let canvas = document.getElementById(layerHistogram.canvasTransformId);
  let title = document.getElementById(layerHistogram.transformTitleId);
  title.innerHTML = `Brightness/Contrast Transform: ${source.name}`;
  let { width, height } = canvas.parentElement.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#bff5aa';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#bff5aa';
  ctx.beginPath();
  let ybase = height - 2;
  let yheight = height - 4;
  let x = 0;
  let y = ybase - transform[0] * yheight / 254;
  ctx.moveTo(0, y);
  for (var i = 1; i < transform.length; i++) {
    x = i * width / 256;
    y = ybase - transform[i] * yheight / 256;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
};

export default layerHistogram;
