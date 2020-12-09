/*jshint esversion: 6 */

//
// Glabal Event handling
//

import layerHistogram from './layerHistogram.js';
import renderUtil from './render/util.js';
import logger from './logger.js';

let events = {};

events.setupGlobal = () => {
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('layer-histogram');

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, attributeOldValue: true };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
      } else if (mutation.type === 'attributes') {
        console.log('The ' + mutation.attributeName + ' attribute was modified.');
        if (mutation.attributeName === 'class') {
          let a = 1;
          if (mutation.target.classList.contains('show')) {
            let elem = document.querySelector('#content>.activity-page');
            let pageContainer = document.querySelector('#content>.activity-page');
            let { pagename, categorytype } = pageContainer.dataset;
            let category = app.categories.find(cat => cat.type === categorytype);
            let page = category.pages.find(p => p.name === pagename);
            logger.imageData(renderUtil.getSelectedSource(page));
          }
          // if (targetNode.classList.contains("show")) {
          //   // layerHistogram.render(renderUtil.getSelectedSource(page))
          // }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // pass in the target node, as well as the observer options
  observer.observe(targetNode, config);
};

export default events;
