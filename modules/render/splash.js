/*jshint esversion: 6 */
/*global app  */

// Splash page

import router from '../../router.js';
import renderMenu from './menu.js';

let splash = {};

let splashElem = document.getElementById('splash');
let splash2Elem = document.getElementById('splash2');

splash.show = () => {
  let splashElem = document.getElementById('splash');
  if (!app.splashRendered) {
    splashElem.innerHTML = `
      <img src="images/splash.jpg"></img>
      <div id="splash-center">
        <div class="title-container">
          <div class="title1">${app.splash.title1}</div>
          <div class="title2">${app.splash.title2}</div>
        </div>
      </div>
      <div id="splash-footer" class="fixed-bottom d-flex flex-row justify-content-center">
        <div class="ps-1 pe-1">
          <div class="start text align-self-center p-2">${app.splash.begin}</div>
        </div>
      </div>
    `;
    app.splashRendered = true;
    splashElem.style.zIndex = "100";
    splashElem.style.display = "block";

    splashElem.addEventListener('click', splashListener);
  }
  // router.pageRendered('splash');

  let splash2ContentId = 'splash2-content';
  let splash2ContinueID = 'splash2-continue';
  let splash2ContentHtml = `
    <div id="${splash2ContentId}">
      <div class='title'>${app.splash2.title}</div>
      <div class='intro'>${app.splash2.intro}</div>
      <button id="${splash2ContinueID}" type="submit" class="col-3 btn btn-outline-primary btn-small page-navigation-button">
        ${app.splash2.continue}
      </button>
    </div>
    `;

  let splash2Elem = document.getElementById('splash2');
  if (!app.splash2Rendered) {
    splash2Elem.innerHTML = `
      <img src="images/splash2.jpg"></img>
      ${splash2ContentHtml}
    `;
    app.splash2Rendered = true;
  }
  splash2Elem.style.zIndex = "50";
  splash2Elem.style.display = "block";

  let splash2ContinueButton = document.getElementById(splash2ContinueID);
  splash2ContinueButton.addEventListener('click', splash2Listener);

  let elem = document.getElementById('splash');
  if (!app.splashRendered) {
    elem.innerHTML = `
      <img src="images/splash.jpg"></img>
      <div id="splash-center">
        <div class="title-container">
          <div class="title1">${app.splash.title1}</div>
          <div class="title2">${app.splash.title2}</div>
        </div>
      </div>
      <div id="splash-footer" class="fixed-bottom d-flex flex-row justify-content-center">
        <div class="ps-1 pe-1">
          <div class="start text align-self-center p-2">${app.splash.begin}</div>
        </div>
      </div>
    `;
    app.splashRendered = true;
  }

};

let splashListener = () => {
  splash.hide(splashElem);
};

let splash2Listener = () => {
  splash.hide(splash2Elem);
  renderMenu.page();
};

splash.hide = (elem) => {
  elem.style.display = "none";
};

splash.hideAll = () => {
  splashElem.style.display = "none";
  splash2Elem.style.display = "none";
};

splash.showSplash2 = () => {
  router.updateHash('');
  splash2Elem.style.display = "block";
  splashElem.style.display = "none";
};

export default splash;
