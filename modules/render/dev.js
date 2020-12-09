/*jshint esversion: 6 */

import u from '../utilities.js';

let renderDev = {};

renderDev.fullScreenButton = (containerId, epandedElement, registerCallback) => {
  let id = `btn-toggle-fullscreen-${containerId}`;

  let fsOpenCloseSVG = `
  <div id="${id}" class="pl-1 pr-1 flex">
    <svg class="fsOpen show" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-fullscreen" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
    <svg class="fsClose" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-fullscreen-exit" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
    </svg>
  </div>
  `;

  registerCallback.push(renderedCallback);
  return fsOpenCloseSVG;

  function renderedCallback() {
    let elem = document.getElementById(id);
    let elementToExpand = false;
    if (epandedElement.documentElement) {
      elementToExpand = epandedElement.documentElement;
    } else {
      if (u.isString(epandedElement)) {
        elementToExpand = document.querySelector(epandedElement);
      }
    }
    if (elem && elementToExpand) {
      let fsOpen = elem.querySelector('svg.fsOpen');
      let fsClose = elem.querySelector('svg.fsClose');
      elem.addEventListener('click', event => {
        if (document.documentElement.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else {
            if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
            }
          }
          fsOpen.classList.add('show');
          fsClose.classList.remove('show');
        } else {
          if (elementToExpand.requestFullscreen) {
            elementToExpand.requestFullscreen();
          } else {
            if (elementToExpand.webkitRequestFullscreen) {
              elementToExpand.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
          }
          fsClose.classList.add('show');
          fsOpen.classList.remove('show');
        }
      });
    } else {
      console.log(`elem #${id} not found`);
    }
  }
};

renderDev.developerToolsButton = (containerId, registerCallback) => {
  let id = `btn-toggle-developer-tools-${containerId}`;
  let html = `
    <div class="pl-1 pr-1">
      <button type="button" id="${id}" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Advanced Tools</button>
    </div>
  `;
  registerCallback.push(renderedCallback);
  return html;

  function renderedCallback() {
    let btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', event => {
        document.querySelectorAll('.developer').forEach(elem => elem.classList.toggle('show'));
      });
    } else {
      console.log(`elem #${id} not found`);
    }
  }
};

export default renderDev;
