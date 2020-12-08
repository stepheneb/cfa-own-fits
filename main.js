/*jshint esversion: 6 */

import request from './modules/request.js';
import router from './modules/router.js';
import events from './modules/events.js';
import images from './modules/images.js';
import checkBrowser from './modules/checkBrowser.js';

import logger from './modules/logger.js';
import utilities from './modules/utilities.js';

import layerHistogram from './modules/layerHistogram.js';

window.app = {};
window.defaultApp = {};

request({ url: "app.json" })
  .then(data => {
    defaultApp = setupNewApp(JSON.parse(data));
    app = setupNewApp(JSON.parse(data));
    router.addHashChangeListener();
    router.route();
    checkBrowser();
  })
  .catch(error => {
    console.log(error);
  });

let setupNewApp = newApp => {
  newApp.hashRendered = "start";
  newApp.splashRendered = false;
  newApp.pageNum = -1;
  newApp.categories.forEach(category => {
    category.pages.forEach(page => {
      if (page.image.selectedSource == undefined) {
        page.image.selectedSource = 0;
      }
      if (page.image.selectedMainLayers == undefined) {
        page.image.selectedMainLayers = "100";
      }
    });
  });
  return newApp;
};
