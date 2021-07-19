/*jshint esversion: 8 */
/*global app */

import u from '../utilities.js';
import logger from '../logger.js';

let adjustImage = {};

let stepSize = 0.05;

let brightness = () => {
  let min = 0;
  let max = 2;
  let val = 1;
  let html = `
    <div class='row adjust-filter'>
      <div class='col-4'>
        <label for='brightness'>Brightness</label>
      </div>
      <div class='col-8 adjust-layer'>
        <input type='range' id='brightness' name='brightness'  min='${min}' max='${max}' value='${val}' step='${stepSize}'>
      </div>
    </div>
  `;
  return html;
};

let contrast = () => {
  let min = 0;
  let max = 2;
  let val = 1;
  let html = `
    <div class=' row adjust-filter'>
      <div class='col-4'>
        <label for='contrast'>Contrast</label>
      </div>
      <div class='col-8'>
        <input type='range' id='contrast' name='contrast' min='${min}' max='${max}' value='${val}' step='${stepSize}'>
      </div>
    </div>
  `;
  return html;
};

// let colorShift = () => {
//   let html = `
//     <div class='row adjust-filter'>
//       <div class='col-4'>
//         <label for='color-shift'>Color Shift</label>
//       </div>
//       <div class='col-8'>
//         <input type='range' id='color-shift' name='color-shift' min='0' max='10' value='5' step='${stepSize} disabled>
//       </div>
//     </div>
//   `;
//   return html;
// };

let scaling = page => {
  let scale = page.selectedSource.scaling;

  function input(type) {
    var selected = scale == type ? 'checked' : '';
    return `<input id="scaling-${type}" type="radio" name="scaling" value="${type}" ${selected}>`;
  }

  let html = `
    <div id="scaling-control" class='row'>
      <div class='col-4 ps-0'>
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

adjustImage.renderScaling = page => {
  return `
    ${scaling(page)}
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
    </div>
  `;

  function callback() {
    let debounceTime = 125;

    const listenerDebounceBrightness = u.debounce((e) => {
      source = page.selectedSource;
      let brightness = e.target.valueAsNumber;
      source.brightness = brightness;
      render(source);
    }, debounceTime);

    const listenerDebounceContrast = u.debounce((e) => {
      source = page.selectedSource;
      source.contrast = e.target.valueAsNumber;
      render(source);
    }, debounceTime);

    let elem;
    elem = document.getElementById("brightness");
    elem.addEventListener('input', listenerDebounceBrightness);

    elem = document.getElementById("contrast");
    elem.addEventListener('input', listenerDebounceContrast);

    // elem = document.getElementById("color-shift");
    // elem.addEventListener('input', () => {});

    elem = document.getElementById("scaling");
    if (elem) {
      elem.addEventListener('change', () => {
        source = page.selectedSource;
        source.scaling = event.target.value;
        render(source);
      });
    }

    function render(source) {
      adjustImage.renderRGBUpdate(page, source);
    }
  }
};

adjustImage.renderRGBUpdate = (page, source) => {
  let canvas = page.canvasImages.layerCanvasNamed(source.filter);
  page.canvasImages.renderCanvasLayer(source, canvas);
  page.canvasImages.renderCanvasRGB();
  page.canvasImages.renderPreview(source);
  if (app.dev) {
    logger.imageData(page.canvasImages, source);
    page.imageInspect.connectUpdate(page.canvasImages);
  }
  source.changed = false;
};

adjustImage.renderMasterpiece = (page, registeredCallbacks) => {
  let source = page.selectedSource;
  registeredCallbacks.push(callback);
  return `
    <div class='control-collection adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      ${brightness(page)}
      ${contrast(page)}
    </div>
  `;

  function callback() {
    let debounceTime = 125;

    const listenerDebounceBrightness = u.debounce((e) => {
      let brightness = e.target.valueAsNumber;
      page.canvasImages.rawdataSources.forEach(source => {
        source.brightness = brightness;
      });
      render(page);
    }, debounceTime);

    const listenerDebounceContrast = u.debounce((e) => {
      let contrast = e.target.valueAsNumber;
      page.canvasImages.rawdataSources.forEach(source => {
        source.contrast = contrast;
      });
      render(page);
    }, debounceTime);

    let elem;
    elem = document.getElementById("brightness");
    elem.addEventListener('input', listenerDebounceBrightness);

    elem = document.getElementById("contrast");
    elem.addEventListener('input', listenerDebounceContrast);

    // elem = document.getElementById("color-shift");
    // elem.addEventListener('input', () => {});

    elem = document.getElementById("scaling");
    if (elem) {
      elem.addEventListener('change', (event) => {
        let scaling = event.target.value;
        page.canvasImages.rawdataSources.forEach(source => {
          source.scaling = scaling;
        });
        render(page);
      });

      elem.addEventListener('change', () => {
        source = page.selectedSource;
        source.scaling = event.target.value;
        render(page);
      });
    }

    // elem = document.getElementById("color-shift");
    // elem.addEventListener('input', () => {});

    function render(page) {
      adjustImage.renderMasterpieceUpdate(page);
    }
  }
};

adjustImage.renderMasterpieceUpdate = (page) => {
  page.canvasImages.spinner.show("running filter");
  page.redraw = requestAnimationFrame(() => {
    setTimeout(() => {
      render2().then(() => {
        page.canvasImages.spinner.hide();
      });
    });
  });
  async function render2() {
    let canvas;
    page.canvasImages.rawdataSources.forEach(source => {
      canvas = page.canvasImages.layerCanvasNamed(source.filter);
      page.canvasImages.renderCanvasLayer(source, canvas);
    });
    page.canvasImages.renderCanvasRGB();
    if (page.type == 'masterpiece') {
      page.canvasImages.renderMasterpiece();
      if (app.dev) {
        logger.imageData(page.canvasImages, page.canvasImages.selectedSource);
        page.imageInspect.connectUpdate(page.canvasImages);
      }
    }
  }
};

adjustImage.update = page => {
  let source = page.selectedSource;
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let scalingElem = document.getElementById("scaling");
  if (scalingElem) {
    let radios = document.getElementById("scaling").elements.scaling;
    radios.value = source.scaling;
  }
};

export default adjustImage;
