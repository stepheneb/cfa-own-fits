/*jshint esversion: 6 */
/*global app */

import u from '../utilities.js';

let renderDev = {};

renderDev.fullScreenButton = (containerId, epandedElement, registeredCallbacks, optionalFunc) => {
  if (app.dev == false) return '';
  let classStr = 'btn-tf';
  let flexClasses = "";
  if (containerId == "page-navigation") {
    flexClasses = "d-flex align-items-end";
  }
  let shortcid = u.shortenStr(containerId);
  let id = `${classStr}-${shortcid}`;

  let fsOpenCloseSVG = `
  <div id="${id}" class="${classStr} ps-1 pe-1 ${flexClasses}">
    <svg class="fsOpen show" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-fullscreen" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
    <svg class="fsClose" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-fullscreen-exit" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
    </svg>
  </div>
  `;

  registeredCallbacks.push(callback);
  return fsOpenCloseSVG;

  function callback() {
    let fsButton = document.getElementById(id);
    let elementToExpand = false;
    if (epandedElement.documentElement) {
      elementToExpand = epandedElement.documentElement;
    } else {
      if (u.isString(epandedElement)) {
        elementToExpand = document.querySelector(epandedElement);
      }
    }
    if (fsButton && elementToExpand) {
      let fsOpenList = document.querySelectorAll('svg.fsOpen');
      let fsCloseList = document.querySelectorAll('svg.fsClose');
      fsButton.addEventListener('click', () => {
        if (document.documentElement.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else {
            if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
            }
          }
          fsOpenList.forEach(fso => fso.classList.add('show'));
          fsCloseList.forEach(fsc => fsc.classList.remove('show'));
        } else {
          if (elementToExpand.requestFullscreen) {
            elementToExpand.requestFullscreen();
          } else {
            if (elementToExpand.webkitRequestFullscreen) {
              elementToExpand.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
          }
          fsCloseList.forEach(fsc => fsc.classList.add('show'));
          fsOpenList.forEach(fso => fso.classList.remove('show'));
        }
        if (optionalFunc) {
          optionalFunc();
        }
      });
    } else {
      console.log(`fsButton #${id} not found`);
    }
  }
};

renderDev.developerToolsButton = (containerId) => {
  if (app.dev == false) return '';
  let id = `btn-toggle-developer-tools-${containerId}`;
  let html = `
    <div  id="${id}" class="ps-1 pe-1">
      <button type="button" class="btn btn-outline-primary btn-small page-navigation-button" data-bs-toggle="offcanvas" data-bs-target="#developerToolsSideBar" aria-controls="developerToolsSideBar">DEV</button>
    </div>
  `;
  // registerCallback.push(renderedCallback);
  return html;

  // function renderedCallback(page) {
  // }
};

renderDev.developerToolsSideBar = () => {
  if (app.dev == false) return '';
  let html = `
    <div class="offcanvas offcanvas-end" tabindex="-1" id="developerToolsSideBar" data-bs-backdrop="false" aria-labelledby="offcanvasExampleLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasExampleLabel">Developer Tools</h5>
        <button type="button" class="btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close">X</button>
      </div>
      <div id="developerToolsSideBar-body" class="offcanvas-body"></div>
    </div>
  `;
  return html;
};

export default renderDev;
