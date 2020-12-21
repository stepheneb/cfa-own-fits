/*jshint esversion: 6 */

//
// Glabal Event handling
//

import logger from './logger.js';

let events = {};

events.setupGlobal = (page) => {
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('layer-histogram');

  if (!targetNode) return;

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, attributeOldValue: true };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
      } else if (mutation.type === 'attributes') {
        console.log('The ' + mutation.attributeName + ' attribute was modified.');
        if (mutation.attributeName === 'class') {
          if (mutation.target.classList.contains('show')) {
            logger.imageData(page.canvasImages, page.canvasImages.selectedSource);
          }
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
