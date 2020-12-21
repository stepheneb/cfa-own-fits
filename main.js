/*jshint esversion: 6 */
/*global app defaultApp */

import router from './router.js';
import request from './modules/request.js';

window.app = {};
window.defaultApp = {};

request({ url: "app.json" })
  .then(data => {
    Object.assign(defaultApp, setupNewApp(JSON.parse(data)));
    Object.assign(app, setupNewApp(JSON.parse(data)));
    app.logger = true;
    router.addHashChangeListener();
    router.route();
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
      if (page.image.selectedSourceNumber == undefined) {
        page.image.selectedSourceNumber = 0;
      }
      if (page.image.selectedMainLayers == undefined) {
        page.image.selectedMainLayers = "100";
      }
      page.image.sources.forEach(source => {
        source.originalRange = source.max - source.min;
        source.originalMax = source.max;
        source.originalMin = source.min;
      });
    });
  });
  return newApp;
};
