/*jshint esversion: 8 */

//
// Image fetching and rendering ...
//

import Filter from './filter.js';
import Scaling from './scaling.js';
import Spinner from './spinner.js';
import cmap from './render/cmap.js';
import utilities from './utilities.js';
import logger from './logger.js';

class CanvasImages {
  constructor(image, ctype) {
    this.image = image;
    this.type = ctype;
    this.name = image.name;
    this.size = image.size;
    this.about = image.about;
    this.dimensions = image.dimensions;
    this.sources = image.sources;
    // Object.assign(this, image);
    this.nx = this.dimensions[this.size].nx;
    this.ny = this.dimensions[this.size].ny;
    this.rawdata = [];
    this.layerCanvases = [];
    this.rgbCanvas = null;
    this.previewCanvas = null;
    this.filters = [];
    this.mainContainer = document.getElementById('main-image-canvas-container');
    this.previewContainer = document.getElementById('preview-image-canvas-container');
    this.spinner = new Spinner('loading-spinner');
    this.load();
  }

  // getters for data in image object managed by the Page instance

  get selectedSourceNumber() {
    return this.image.selectedSourceNumber;
  }

  get maximumBrightness() {
    return this.image.maximumBrightness;
  }

  get selectedMainLayers() {
    return this.image.selectedMainLayers;
  }

  // raw float32 data

  get selectedSourceRawData() {
    return this.rawdata[this.selectedSourceNumber];
  }

  rawDataForSource(s) {
    let filter = s.filter;
    let index = this.sources.findIndex(source => source.filter == filter);
    return this.rawdata[index];
  }

  // return source objects

  get rawdataSources() {
    return this.sources.filter(s => s.type == 'rawdata');
  }

  get selectedSource() {
    return this.sources[this.selectedSourceNumber];
  }

  sourceNamed(filter) {
    return this.sources.find(s => s.filter == filter);
  }

  get sourceRGB() {
    return this.sources.find(s => s.type == 'composite');
  }

  // return canvas elements

  layerCanvasNamed(filter) {
    return this.layerCanvases.find(c => c.classList.contains(filter));
  }

  get canvasRGB() {
    return this.rgbCanvas;
  }

  // return uint8 data

  uint8FromCanvas(c) {
    return c.getContext('2d').getImageData(0, 0, this.nx, this.ny).data;
  }

  uint8FromSource(s) {
    return this.layerCanvasNamed(s.filter).getContext('2d').getImageData(0, 0, this.nx, this.ny).data;
  }

  get selectedSourcePixelData() {
    return this.uint8FromCanvas(this.layerCanvases[this.selectedSourceNumber]);
  }

  get pixelDataRed() {
    return this.uint8FromCanvas(this.layerCanvases[0]);
  }

  get pixelDataGreen() {
    return this.uint8FromCanvas(this.layerCanvases[1]);
  }

  get pixelDataBlue() {
    return this.uint8FromCanvas(this.layerCanvases[2]);
  }

  get pixelDataRGB() {
    return this.uint8FromCanvas(this.rgbCanvas);
  }

  // get element inside dimensions

  getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  close() {
    this.scaling.close();
  }

  load() {
    this.spinner.show("load images");
    this.fetch();
  }

  fetch() {
    let spinner = this.spinner;
    let rawdata;
    let rawDataSources = this.sources.filter(s => s.type == 'rawdata');
    Promise.all(
      rawDataSources.map(source => fetch(source.path[this.size]))
    ).then(responses => {
      return Promise.all(responses.map(response => response.arrayBuffer()));
    }).then(arrayBuffers => {
      arrayBuffers.map((arrayBuffer) => {
        rawdata = new Float32Array(arrayBuffer);
        this.rawdata.push(rawdata);
      });
      this.rawdataSources.forEach(source => logger.rawData(this, source));
      switch (this.type) {
      case 'rgb':
      case 'multi-wave':
        this.initializeMainCanvases();
        this.initializePreviewCanvas(this.selectedSource);

        break;
      case 'masterpiece':
        this.initializeMainCanvases();
        this.addScalingLayer();
        break;
      }
      this.spinner.hide("then imageBufferItems");
    }).catch(function (e) {
      spinner.cancel("fetchError");
      console.log('Error fetchAllRawDataImages operation: ' + e.message);
    });
  }

  addScalingLayer() {
    let canvas = this.canvasRGB;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);

    createImageBitmap(imageData, 0, 0, this.nx, this.ny)
      .then(imageBitmap => {
        let c = document.createElement("canvas");
        c.id = 'scaling-image-canvas';
        c.classList = 'scaling-image-canvas';
        this.initializeCanvas(c);
        this.mainContainer.append(c);
        this.scalingCanvas = c;
        this.scaling = new Scaling(c, imageBitmap);
      });
  }

  updateScalingLayer() {
    let canvas = this.canvasRGB;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    createImageBitmap(imageData, 0, 0, this.nx, this.ny)
      .then(imageBitmap => {
        this.scaling.update(imageBitmap);
      });
  }

  renderCanvasImageLayer(c, bitmap) {
    let ctx = c.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
  }

  initializeMainCanvases() {
    // let rawdata;
    let canvas;
    this.rawdataSources.forEach((s) => {
      canvas = this.appendMainCanvas(this.mainContainer, s.filter);
      this.layerCanvases.push(canvas);
      this.renderCanvasLayer(s);
    });
    this.rgbCanvas = this.appendMainCanvas(this.mainContainer, 'rgb');
    this.renderCanvasRGB();
  }

  initializePreviewCanvas(source) {
    let c = document.createElement("canvas");
    c.id = 'preview-image-canvas';
    c.classList = 'preview-image-canvas';
    this.initializeCanvas(c);
    this.previewContainer.append(c);
    this.previewCanvas = c;
    c.width = this.nx;
    c.height = this.ny;
    this.renderPreview(source);
    return c;
  }

  appendMainCanvas(container, filter) {
    let c = document.createElement("canvas");
    c.id = `main-image-canvas-${filter}`;
    c.classList = `main-image-canvas ${filter}`;
    this.initializeCanvas(c);
    c.width = this.nx;
    c.height = this.ny;
    container.append(c);
    return c;
  }

  appendLayerCanvas(container, prefix, filter) {
    let c = document.createElement("canvas");
    c.id = `${prefix}-image-canvas-${filter}`;
    c.classList = `${prefix}-image-canvas ${filter}`;
    this.initializeCanvas(c);
    container.append(c);
    this.resizeCanvas(c);
    return c;
  }

  initializeCanvas(c) {
    let ctx = c.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,255)";
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = "source-over";
    return c;
  }

  resizeCanvas(c) {
    // c.width = c.parentElement.clientWidth;
    // c.height = c.parentElement.clientHeight;

    let { width, height } = this.getWidthHeight(c);
    let sourceAspectRatio = this.nx / this.ny;
    let destinationAspectRatio = width / height;
    let resizeW, resizeH;
    if (destinationAspectRatio >= sourceAspectRatio) {
      resizeH = height;
      resizeW = height * sourceAspectRatio;
    } else {
      resizeW = width;
      resizeH = width / sourceAspectRatio;
    }
    c.width = resizeW;
    c.height = resizeH;
    return c;
  }

  moveToTop(container, name) {
    let c = container.querySelector(`.${name}`);
    container.removeChild(c);
    container.appendChild(c);
  }

  renderCanvasLayer(source) {
    let canvas = this.layerCanvasNamed(source.filter);
    let startTime = performance.now();
    let rawdata = this.rawDataForSource(source);
    let min = source.min;
    let max = source.max;
    let range = max - min;
    let scale;
    let i, pixindex, x, y, val, scaledval;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    let pixeldata = imageData.data;

    let renderLinearLayer = () => {
      scale = source.brightness * 256 / range;
      switch (source.filter) {
      case 'red':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = val * scale - min;
            pixeldata[pixindex] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'green':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = val * scale - min;
            pixeldata[pixindex + 1] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'blue':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = val * scale - min;
            pixeldata[pixindex + 2] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'gray':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = val * scale - min;
            pixeldata[pixindex] = scaledval;
            pixeldata[++pixindex] = scaledval;
            pixeldata[++pixindex] = scaledval;
            pixeldata[++pixindex] = 255;
            ++pixindex;
          }
        }
        break;
      }
    };

    let renderLogLayer = () => {
      scale = source.brightness * 256 / Math.log(range + 1);
      switch (source.filter) {
      case 'red':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = Math.log(val + 1) * scale;
            pixeldata[pixindex] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'green':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = Math.log(val + 1) * scale;
            pixeldata[pixindex + 1] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'blue':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = Math.log(val + 1) * scale;
            pixeldata[pixindex + 2] = scaledval;
            pixeldata[pixindex + 3] = 255;
            pixindex += 4;
          }
        }
        break;
      case 'gray':
        pixindex = 0;
        for (y = 0; y < this.ny; y++) {
          for (x = 0; x < this.nx; x++) {
            i = y * this.nx + x;
            val = rawdata[i];
            scaledval = Math.log(val + 1) * scale;
            pixeldata[pixindex] = scaledval;
            pixeldata[++pixindex] = scaledval;
            pixeldata[++pixindex] = scaledval;
            pixeldata[++pixindex] = 255;
            ++pixindex;
          }
        }
        break;
      }
    };
    switch (source.scaling) {
    case 'linear':
      renderLinearLayer();
      break;
    case 'log':
      renderLogLayer();
      break;
    }
    let renderTime = performance.now();
    ctx.putImageData(imageData, 0, 0);
    console.log(`images.renderCanvas: name: ${source.name}, filter: ${source.filter}: render: ${utilities.roundNumber(renderTime  - startTime, 4)}`);
  }

  renderCanvasRGB() {
    var len = this.layerCanvases.length;
    if (len == 1) {
      this.renderCanvasRGB1(this.sources[0]);
    }
    if (len == 3) {
      this.renderCanvasRGB3();
    }
  }

  renderCanvasRGB1(source) {
    let canvas = this.canvasRGB;
    let startTime = performance.now();

    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    let pixeldata = imageData.data;

    let pixelDataSource = this.uint8FromSource(source);

    let len = pixelDataSource.length;
    let i;

    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixelDataSource[i];
      pixeldata[i + 1] = pixelDataSource[i + 1];
      pixeldata[i + 2] = pixelDataSource[i + 2];
      pixeldata[i + 3] = 255;
    }
    let renderTime = performance.now();
    ctx.putImageData(imageData, 0, 0);
    console.log(`renderMain: ${utilities.roundNumber(this.selectedMainLayers, 4)}: render: ${utilities.roundNumber(renderTime - startTime, 4)}`);
  }

  renderCanvasRGB3() {
    let canvas = this.canvasRGB;
    let startTime = performance.now();

    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    let pixeldata = imageData.data;

    let pixeldataRed = this.pixelDataRed;
    let pixeldataGreen = this.pixelDataGreen;
    let pixeldataBlue = this.pixelDataBlue;

    let len = pixeldataRed.length;
    let i;

    switch (this.selectedMainLayers) {
    case '000': // No layers
      for (i = 0; i < len; i += 4) {
        pixeldata[i] = 0;
        pixeldata[i + 1] = 0;
        pixeldata[i + 2] = 0;
        pixeldata[i + 3] = 255;
      }
      break;
    case '100': // Red
      pixeldata.set(pixeldataRed);
      break;
    case '010': // Green
      pixeldata.set(pixeldataGreen);
      break;
    case '001': // Blue
      pixeldata.set(pixeldataBlue);
      break;
    case '110': // Red, Green
      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 2] = 0;
        pixeldata[i + 3] = 255;
      }
      break;
    case '011': // Green, Blue
      for (i = 0; i < len; i += 4) {
        pixeldata[i] = 0;
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 2] = pixeldataBlue[i + 2];
        pixeldata[i + 3] = 255;
      }
      break;
    case '101': // Red, blue
      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = 0;
        pixeldata[i + 2] = pixeldataBlue[i + 2];
        pixeldata[i + 3] = 255;
      }
      break;
    case '111': // Red, Green, Blue
      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 2] = pixeldataBlue[i + 2];
        pixeldata[i + 3] = 255;
      }
      break;
    }
    let renderTime = performance.now();
    ctx.putImageData(imageData, 0, 0);
    console.log(`renderMain: ${utilities.roundNumber(this.selectedMainLayers, 4)}: render: ${utilities.roundNumber(renderTime - startTime, 4)}`);
  }

  renderMasterpiece() {
    var len = this.layerCanvases.length;
    if (len == 1) {
      this.renderMasterpiece1(this.sources[0]);
    }
    if (len == 3) {
      this.renderMasterpiece3();
    }
  }

  renderMasterpiece1(source) {
    if (!this.cmapName) {
      this.cmapName = 'gray';
    }
    let colormap = cmap.data[this.cmapName];
    let index;
    let colorR, colorG, colorB;

    // let startTime = performance.now();
    let canvas = this.canvasRGB;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    let pixeldata = imageData.data;

    let pixelDataSource = this.uint8FromSource(source);

    let len = pixelDataSource.length;
    for (var i = 0; i < len; i += 4) {
      index = pixelDataSource[i];
      colorR = colormap[index][0];
      colorG = colormap[index][1];
      colorB = colormap[index][2];

      pixeldata[i] = colorR;
      pixeldata[i + 1] = colorG;
      pixeldata[i + 2] = colorB;
    }
    ctx.putImageData(imageData, 0, 0);
    this.spinner.show("running filter");
    this.redraw = requestAnimationFrame(() => {
      setTimeout(() => {
        this.runFilters().then(() => {
          this.updateScalingLayer();
          this.spinner.hide();
        });
      });
    });
    // let renderTime = performance.now();
  }

  renderMasterpiece3() {
    if (!this.cmapName) {
      this.cmapName = 'gray';
    }
    let colormap = cmap.data[this.cmapName];
    let indexR, indexG, indexB;
    let colorR, colorG, colorB;

    // let startTime = performance.now();
    let canvas = this.canvasRGB;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);
    let pixeldata = imageData.data;

    let pixeldataRed = this.pixelDataRed;
    let pixeldataGreen = this.pixelDataGreen;
    let pixeldataBlue = this.pixelDataBlue;

    let len = pixeldataRed.length;
    for (var i = 0; i < len; i += 4) {
      indexR = pixeldataRed[i];
      colorR = colormap[indexR][0];

      indexG = pixeldataGreen[i + 1];
      colorG = colormap[indexG][1];

      indexB = pixeldataBlue[i + 2];
      colorB = colormap[indexB][2];

      pixeldata[i] = colorR;
      pixeldata[i + 1] = colorG;
      pixeldata[i + 2] = colorB;
    }

    ctx.putImageData(imageData, 0, 0);

    this.spinner.show("running filter");
    this.redraw = requestAnimationFrame(() => {
      setTimeout(() => {
        this.runFilters().then(() => {
          this.updateScalingLayer();
          this.spinner.hide();
        });
      });
    });
    // let renderTime = performance.now();
  }

  scheduleCmap(cmapName) {
    this.cmapName = cmapName;
  }

  scheduleFilters(filters) {
    this.filters = filters;
  }

  async runFilters() {
    let rgbsource = this.canvasRGB;
    let ctx = rgbsource.getContext('2d');
    let imageData = ctx.getImageData(0, 0, this.nx, this.ny);

    if (this.filters.length > 0) {
      this.filters.forEach(filter => {
        Filter.filters[filter].filter(imageData);
        ctx.putImageData(imageData, 0, 0);
      });
    }
  }

  renderColorMaps() {
    let id, canvas;
    let [nx, ny] = [256, 16];
    let colormaps = cmap.names().map(name => {
      id = `select-cmap-${name}-canvas`;
      canvas = document.getElementById(id);
      return [name, canvas];
    });

    colormaps.forEach(([name, canvas]) => {
      init(canvas, nx, ny);
      render(canvas, name, nx, ny);
    });

    function init(canvas, nx, ny) {
      canvas.ctx = canvas.getContext('2d');
      canvas.ctx.fillStyle = "rgb(0,0,0)";
      canvas.ctx.imageSmoothingEnabled = true;
      canvas.ctx.globalCompositeOperation = "source-over";
      canvas.width = nx;
      canvas.height = ny;
    }

    function render(canvas, name, nx, ny) {
      let imageData = canvas.ctx.createImageData(nx, ny);
      let uint8Data = imageData.data;
      let colormap = cmap.data[name];
      let pixindex = 0;
      const alpha = 255;
      var x, y;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          uint8Data[pixindex] = colormap[x][0];
          uint8Data[++pixindex] = colormap[x][1];
          uint8Data[++pixindex] = colormap[x][2];
          uint8Data[++pixindex] = alpha;
          pixindex++;
        }
      }
      canvas.ctx.putImageData(imageData, 0, 0);
    }
  }

  renderPreview(source) {
    let sourceCanvas = this.layerCanvasNamed(source.filter);
    let sourceCtx = sourceCanvas.getContext('2d');
    let imageData = sourceCtx.getImageData(0, 0, this.nx, this.ny);
    let ctx = this.previewCanvas.getContext('2d');
    createImageBitmap(imageData, 0, 0, this.nx, this.ny)
      .then(imageBitmap => {
        ctx.drawImage(imageBitmap, 0, 0);
      });
  }

  renderPalettes() {
    let id, canvas, name;
    let [nx, ny] = [256, 16];
    let sources = this.rawdataSources;
    let palettes = sources.map((source, i) => {
      name = source.filter;
      id = `palette-${name}-${i}`;
      canvas = document.getElementById(id);
      return [name, canvas];
    });

    palettes.forEach(([name, canvas]) => {
      init(canvas, nx, ny);
      render(canvas, name, nx, ny);
    });

    function init(canvas, nx, ny) {
      canvas.ctx = canvas.getContext('2d');
      canvas.ctx.fillStyle = "rgb(0,0,0)";
      canvas.ctx.imageSmoothingEnabled = true;
      canvas.ctx.globalCompositeOperation = "source-over";
      canvas.width = nx;
      canvas.height = ny;
    }

    function render(canvas, name, nx, ny) {
      let imageData = canvas.ctx.createImageData(nx, ny);
      let uint8Data = imageData.data;
      let pixindex = 0;
      let color = 0;
      const alpha = 255;
      var x, y;
      switch (name) {
      case 'red':
        for (y = 0; y < ny; y++) {
          color = 0;
          for (x = 0; x < nx; x++) {
            uint8Data[pixindex] = color;
            uint8Data[++pixindex] = 0;
            uint8Data[++pixindex] = 0;
            uint8Data[++pixindex] = alpha;
            pixindex++;
            color++;
          }
        }
        break;
      case 'green':
        for (y = 0; y < ny; y++) {
          color = 0;
          for (x = 0; x < nx; x++) {
            uint8Data[pixindex] = 0;
            uint8Data[++pixindex] = color;
            uint8Data[++pixindex] = 0;
            uint8Data[++pixindex] = alpha;
            pixindex++;
            color++;
          }
        }
        break;
      case 'blue':
        for (y = 0; y < ny; y++) {
          color = 0;
          for (x = 0; x < nx; x++) {
            uint8Data[pixindex] = 0;
            uint8Data[++pixindex] = 0;
            uint8Data[++pixindex] = color;
            uint8Data[++pixindex] = alpha;
            pixindex++;
            color++;
          }
        }
        break;
      case 'gray':
        for (y = 0; y < ny; y++) {
          color = 0;
          for (x = 0; x < nx; x++) {
            uint8Data[pixindex] = color;
            uint8Data[++pixindex] = color;
            uint8Data[++pixindex] = color;
            uint8Data[++pixindex] = alpha;
            pixindex++;
            color++;
          }
        }
        break;
      }
      canvas.ctx.putImageData(imageData, 0, 0);
    }
  }
}

export default CanvasImages;
