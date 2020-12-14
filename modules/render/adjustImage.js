/*jshint esversion: 6 */

import images from '../images.js';
import renderUtil from './util.js';
import logger from '../logger.js';

let adjustImage = {};

adjustImage.render = (page, registeredCallbacks) => {
  let source = renderUtil.getSelectedSource(page);
  let getId = effect => `adjust-layer-${effect}`;

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

  let contrast = page => {
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

  let colorShift = page => {
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
    let html = `
      <div id="scaling-control" class='row developer'>
        <div class='col-4'>
          <label>Scaling</label>
        </div>
        <div class="col-8">
          <form id="select-scaling" class="d-flex flex-row justify-content-start">
            <div class="select-scaling-label">
              <label for="select-scaling-linear">Linear</label>
            </div>
            <div class="select-scaling-radio">
              <input id="select-scaling-linear" type="radio" name="scaling" value="linear">
            </div>
            <div class="select-scaling-label">
              <label for="select-scaling-log">Log</label>
            </div>
            <div class="select-scaling-radio">
              <input id="select-scaling-log" type="radio" name="scaling" value="log">
            </div>
          </form>
        </div>
      </div>
    `;
    return html;
  };

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
      let source = renderUtil.getSelectedSource(page);
      let brightness = e.target.valueAsNumber;
      source.brightness = brightness;
      render(source);
    });

    elem = document.getElementById("contrast");
    elem.addEventListener('input', (e) => {
      let source = renderUtil.getSelectedSource(page);
      source.contrast = e.target.valueAsNumber;
      let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
      source.max = source.originalMax - contrastShift;
      source.min = Math.max(0, source.originalMin + contrastShift);
      render(source);
    });

    elem = document.getElementById("color-shift");
    elem.addEventListener('input', (e) => {});

    elem = document.getElementById("select-scaling");
    elem.addEventListener('change', (e) => {
      let source = renderUtil.getSelectedSource(page);
      source.scaling = event.target.value;
      render(source);
    });

    function render(source) {
      images.renderOffscreen(source, page.image.nx, page.image.ny);
      images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
      images.renderMain(page.image);
      logger.imageData(source);
    }
  }
};

adjustImage.update = page => {
  let source = renderUtil.getSelectedSource(page);
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let radios = document.getElementById("select-scaling").elements.scaling;
  radios.value = source.scaling;
};

export default adjustImage;
