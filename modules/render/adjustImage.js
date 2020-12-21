/*jshint esversion: 8 */

import logger from '../logger.js';

let adjustImage = {};

let brightness = page => {
  let html = `
    <div class='row adjust-filter'>
      <div class='col-4'>
        <label for='brightness'>Brightness</label>
      </div>
      <div class='col-8 adjust-layer'>
        <input type='range' id='brightness' name='brightness'  min='0' max='${page.image.maximumBrightness}' value='${page.image.maximumBrightness / 2}'
          step='0.05'>
      </div>
    </div>
  `;
  return html;
};

let contrast = () => {
  let html = `
    <div class=' row adjust-filter'>
      <div class='col-4'>
        <label for='contrast'>Contrast</label>
      </div>
      <div class='col-8'>
        <input type='range' id='contrast' name='contrast' min='0.04' max='1.96' value='1' step='0.01'>
      </div>
    </div>
  `;
  return html;
};

let colorShift = () => {
  let html = `
    <div class='row adjust-filter'>
      <div class='col-4'>
        <label for='color-shift'>Color Shift</label>
      </div>
      <div class='col-8'>
        <input type='range' id='color-shift' name='color-shift' min='0' max='10' value='5' disabled>
      </div>
    </div>
  `;
  return html;
};

let scaling = page => {
  let scale = page.selectedSource.scaling;

  function input(type) {
    var selected = scale == type ? 'checked' : '';
    return `<input id="scaling-${type}" type="radio" name="scaling" value="${type}" ${selected}>`;
  }

  let html = `
    <div id="scaling-control" class='row developer'>
      <div class='col-4'>
        <label>Scaling</label>
      </div>
      <div class="col-8">
        <form id="scaling" class="d-flex flex-row justify-content-start">
          <div class="scaling-label">
            <label for="scaling-linear">Linear</label>
          </div>
          <div class="scaling-radio">
            ${input('linear')}
          </div>
          <div class="scaling-label">
            <label for="scaling-log">Log</label>
          </div>
          <div class="scaling-radio">
            ${input('log')}
          </div>
        </form>
      </div>
    </div>
  `;
  return html;

};

let html = page => {
  return `
    <div class='control-collection adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      ${brightness(page)}
      ${contrast(page)}
      ${colorShift(page)}
      ${scaling(page)}
    </div>
  `;
};

adjustImage.renderRGB = (page, registeredCallbacks) => {
  let source = page.selectedSource;

  registeredCallbacks.push(callback);
  return `
    <div class='control-collection adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      ${brightness(page)}
      ${contrast(page)}
      ${colorShift(page)}
      ${scaling(page)}
    </div>
  `;

  function callback() {
    let elem;

    elem = document.getElementById("brightness");
    elem.addEventListener('input', (e) => {
      source = page.selectedSource;
      let brightness = e.target.valueAsNumber;
      source.brightness = brightness;
      render(source);
    });

    elem = document.getElementById("contrast");
    elem.addEventListener('input', (e) => {
      source = page.selectedSource;
      source.contrast = e.target.valueAsNumber;
      let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
      source.max = source.originalMax - contrastShift;
      source.min = Math.max(0, source.originalMin + contrastShift);
      render(source);
    });

    elem = document.getElementById("color-shift");
    elem.addEventListener('input', () => {});

    elem = document.getElementById("scaling");
    elem.addEventListener('change', () => {
      source = page.selectedSource;
      source.scaling = event.target.value;
      render(source);
    });

    function render(source) {
      let canvas = page.canvasImages.layerCanvasNamed(source.filter);
      page.canvasImages.renderCanvasLayer(source, canvas);
      page.canvasImages.renderCanvasRGB();
      page.canvasImages.renderPreview(source);
      logger.imageData(page.canvasImages, source);
    }
  }
};

adjustImage.renderMasterpiece = (page, registeredCallbacks) => {
  registeredCallbacks.push(callback);
  return html(page);

  function callback() {
    let elem;

    elem = document.getElementById("brightness");
    elem.addEventListener('input', (e) => {
      let brightness = e.target.valueAsNumber;
      page.canvasImages.rawdataSources.forEach(source => {
        source.brightness = brightness;
      });
      render(page);
    });

    elem = document.getElementById("contrast");
    elem.addEventListener('input', (e) => {
      let contrast = e.target.valueAsNumber;
      page.canvasImages.rawdataSources.forEach(source => {
        source.contrast = contrast;
        let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
        source.max = source.originalMax - contrastShift;
        source.min = Math.max(0, source.originalMin + contrastShift);
      });
      render(page);
    });

    elem = document.getElementById("color-shift");
    elem.addEventListener('input', () => {});

    elem = document.getElementById("scaling");
    elem.addEventListener('change', (event) => {
      let scaling = event.target.value;
      page.canvasImages.rawdataSources.forEach(source => {
        source.scaling = scaling;
      });
      render(page);
    });

    function render(page) {
      page.canvasImages.spinner.show("running filter");
      page.redraw = requestAnimationFrame(() => {
        setTimeout(() => {
          render2().then(() => {
            page.canvasImages.spinner.hide();
          });
        });
      });

    }

    async function render2() {
      let canvas;
      page.canvasImages.rawdataSources.forEach(source => {
        canvas = page.canvasImages.layerCanvasNamed(source.filter);
        page.canvasImages.renderCanvasLayer(source, canvas);
      });
      page.canvasImages.renderCanvasRGB();
      if (page.type == 'masterpiece') {
        page.canvasImages.renderMasterpiece();
        logger.imageData(page.canvasImages, page.canvasImages.selectedSource);
      }
    }
  }
};

adjustImage.update = page => {
  let source = page.selectedSource;
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let radios = document.getElementById("scaling").elements.scaling;
  radios.value = source.scaling;
};

export default adjustImage;
