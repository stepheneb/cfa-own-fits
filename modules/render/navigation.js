/*jshint esversion: 6 */

import renderDev from './dev.js';

let navigation = {};


navigation.page = (renderedCallbacks) => {
  let id = "page-navigation";
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${btnBack()}
      <div class="ps-1 pe-1 ms-auto">
        <div class="d-flex flex-row">
          ${renderDev.developerToolsButton(id, renderedCallbacks)}
          ${renderDev.fullScreenButton(id, document, renderedCallbacks)}
        </div>
      </div>

    </div>
  `;
};

navigation.menu = (renderedCallbacks) => {
  let id = "page-navigation";
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      <div class="ps-1 pe-1 ms-auto">
        <div class="d-flex flex-row">
          ${renderDev.fullScreenButton(id, document, renderedCallbacks)}
        </div>
      </div>
    </div>
  `;
};

let btnBack = () => {
  return `
    <div class="ps-1 pe-1">
      <button type="button" id="btn-back" class="btn btn-outline-primary btn-small page-navigation-button">&#9664 Back</button>
    </div>
  `;
};

export default navigation;
