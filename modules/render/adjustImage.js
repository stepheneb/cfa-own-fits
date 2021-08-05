/*jshint esversion: 8 */
/*global app */

import u from '../utilities.js';
import logger from '../logger.js';
import svg from './svg.js';

let adjustImage = {};

let stepSize = 0.05;

let brightness = () => {
  let min = 0;
  let max = 2;
  let val = 1;
  let html = `
    <div class='adjust-filter '>
      <label for='brightness'>Brightness</label>
      <div id='brightness-step-down' class='slider-icon step-down' data-step='down'>${svg.minusIcon}</div>
      <input type='range' id='brightness' name='brightness'  min='${min}' max='${max}' value='${val}' step='${stepSize}' oninput='brightnessvalue.value=value'/>
      <div id='brightness-step-up' class='slider-icon step-up'  data-step='up'>${svg.plusIcon}</div>
      <output id="brightnessvalue">${val}</output>
    </div>
  `;
  return html;
};

let contrast = () => {
  let min = 0;
  let max = 2;
  let val = 1;
  let html = `
    <div class='adjust-filter'>
      <label for='contrast'>Contrast</label>
      <div id='contrast-step-down' class='slider-icon step-down' data-step='down'>${svg.minusIcon}</div>
      <input type='range' id='contrast' name='contrast'  min='${min}' max='${max}' value='${val}' step='${stepSize}' oninput='contrastvalue.value=value'/>
      <div id='contrast-step-up' class='slider-icon step-up' data-step='up'>${svg.plusIcon}</div>
      <output id="contrastvalue">${val}</output>
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

adjustImage.processCallback = (page, renderFunc) => {
  let source = page.selectedSource;
  let debounceTime = 125;

  let brightnessElem = document.getElementById("brightness");
  let contrastElem = document.getElementById("contrast");

  let brightnessStepDownElem = document.getElementById("brightness-step-down");
  let brightnessStepUpElem = document.getElementById("brightness-step-up");
  let brightnessValueElem = document.getElementById("brightnessvalue");

  let contrastStepDownElem = document.getElementById("contrast-step-down");
  let contrastStepUpElem = document.getElementById("contrast-step-up");
  let contrastValueElem = document.getElementById("contrastvalue");

  const listenerDebounceBrightness = u.debounce((e) => {
    source = page.selectedSource;
    let brightness = e.target.valueAsNumber;
    source.brightness = brightness;
    renderFunc(page);
  }, debounceTime);

  const listenerDebounceContrast = u.debounce((e) => {
    source = page.selectedSource;
    source.contrast = e.target.valueAsNumber;
    renderFunc(page);
  }, debounceTime);

  const listenerBrightnessStep = (e) => {
    let source = page.selectedSource;
    let direction = e.target.dataset.step;
    let brightness = source.brightness;
    if (direction == 'up') {
      brightness += 0.05;
    } else {
      brightness -= 0.05;
    }
    brightness = Math.min(2, Math.max(0, brightness));
    source.brightness = brightness;
    brightnessElem.valueAsNumber = brightness;
    brightnessValueElem.innerText = u.roundNumber(brightness, 3);
    renderFunc(page);
  };

  const listenerContrastStep = (e) => {
    let source = page.selectedSource;
    let direction = e.target.dataset.step;
    let contrast = source.contrast;
    if (direction == 'up') {
      contrast += 0.05;
    } else {
      contrast -= 0.05;
    }
    contrast = Math.min(2, Math.max(0, contrast));
    source.contrast = contrast;
    contrastElem.valueAsNumber = contrast;
    contrastValueElem.innerText = u.roundNumber(contrast, 3);
    renderFunc(page);
  };

  brightnessElem.addEventListener('input', listenerDebounceBrightness);
  contrastElem.addEventListener('input', listenerDebounceContrast);

  brightnessStepDownElem.addEventListener('click', listenerBrightnessStep);
  brightnessStepUpElem.addEventListener('click', listenerBrightnessStep);

  contrastStepDownElem.addEventListener('click', listenerContrastStep);
  contrastStepUpElem.addEventListener('click', listenerContrastStep);

  // elem = document.getElementById("color-shift");
  // elem.addEventListener('input', () => {});

  let elem;
  elem = document.getElementById("scaling");
  if (elem) {
    elem.addEventListener('change', () => {
      source = page.selectedSource;
      source.scaling = event.target.value;
      renderFunc(page);
    });
  }
};

adjustImage.renderRGB = (page, registeredCallbacks) => {
  registeredCallbacks.push(callback);
  return `
    <div class='adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      ${brightness(page)}
      ${contrast(page)}
    </div>
  `;

  function callback(page) {
    adjustImage.processCallback(page, render);

    function render(page) {
      let source = page.selectedSource;
      adjustImage.renderRGBUpdate(page, source);
    }
  }
};

adjustImage.renderRGBUpdate = (page, source) => {
  let canvas = page.canvasImages.layerCanvasNamed(source.filter);
  page.canvasImages.renderCanvasLayer(source, canvas);
  page.canvasImages.renderCanvasRGB(page.type);
  page.canvasImages.renderPreview(source);
  if (app.dev) {
    logger.imageData(page.canvasImages, source);
    page.imageInspect.connectUpdate(page.canvasImages);
  }
  source.changed = false;
};

adjustImage.renderMasterpiece = (page, registeredCallbacks) => {
  registeredCallbacks.push(callback);
  return `
    <div class='adjust-layer'>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      ${brightness(page)}
      ${contrast(page)}
    </div>
  `;

  function callback(page) {
    adjustImage.processCallback(page, render);

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
    page.canvasImages.renderCanvasRGB(page.type);
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
