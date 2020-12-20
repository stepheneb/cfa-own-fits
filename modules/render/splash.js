/*jshint esversion: 6 */
/*global app  */

// Splash page

import router from '../../router.js';
import renderMenu from './menu.js';

let splash = {};

splash.show = () => {
  let elem = document.getElementById('splash');
  if (!app.splashRendered) {
    elem.innerHTML = `
      <img src="images/splash.jpg"></img>
      <div id="splash-center" class="d-flex align-items-center justify-content-center">
        <div classs="col-12 h-100">
          <div class="title1 row justify-content-center">${app.splash.title1}</div>
          <div class="title2 row justify-content-center">${app.splash.title2}</div>
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
  elem.style.zIndex = "100";
  elem.style.display = "block";

  elem.addEventListener('click', splashListener);
  // router.pageRendered('splash');
};

splash.hide = () => {
  let elem = document.getElementById('splash');
  elem.style.display = "none";
};

let splashListener = () => {
  splash.hide();
  renderMenu.page();
};

export default splash;
