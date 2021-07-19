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
      if (category.type !== "observation") {
        if (page.image.selectedSourceNumber == undefined) {
          page.image.selectedSourceNumber = 0;
        }
        if (page.image.selectedMainLayers == undefined) {
          page.image.selectedMainLayers = "100";
        }
        page.image.sources.forEach(source => {
          source.defaultValues = {};
          let keys = ['max', 'min', 'brightness', 'contrast', 'scaling'];
          source.defaultValues.keys = keys;
          for (let key of keys) {
            source.defaultValues[key] = source[key];
          }
        });
      }
    });
  });
  return newApp;
};
