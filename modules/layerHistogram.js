/*jshint esversion: 6 */

let updateLayerHistogram = (h, scaling) => {
  let canvas = document.getElementById("image-layer-histogram");
  let { width, height } = canvas.parentElement.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  let histogram = h.slice(1, h.length - 1);
  let bars = histogram.length;
  let columnWidth = width / bars;
  let barWidth = Math.floor(columnWidth - 1);
  let barHeight = 1;
  let data = histogram.map(row => row[1]);
  let maxCount = Math.max(...data);
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#bff5aa';
  for (var i = 0; i < bars; i++) {
    switch (scaling) {
    case "linear":
      barHeight = data[i] / maxCount * height * 0.9;
      break;
    case "log":
      barHeight = data[i] / maxCount * height * 0.9;
      break;
    }
    ctx.fillRect(i * columnWidth, height - barHeight, barWidth, barHeight);
  }
};

export { updateLayerHistogram };