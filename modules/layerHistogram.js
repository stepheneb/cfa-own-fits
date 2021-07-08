/*jshint esversion: 6 */

let layerHistogram = {};

layerHistogram.render = () => {
  let html = `
    <div id="layer-histogram" class="layer-histogram">
      <div id="layer-histogram-title" class="mt-2">Image Layer Histogram</div>
      <div id="image-layer-histogram-container" class="col-12">
        <canvas id="image-layer-histogram"></canvas>
      </div>
    </div>
  `;
  return html;
};

layerHistogram.update = (h, source) => {
  let histogram = [];
  let canvas = document.getElementById("image-layer-histogram");
  let { width, height } = canvas.parentElement.getBoundingClientRect();
  let title = document.getElementById('layer-histogram-title');
  title.innerHTML = `Image Layer Histogram: ${source.name}`;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

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
