/*jshint esversion: 6 */

import images from '../images.js';
import cmap from './cmap.js';
import renderUtil from './util.js';

let colorMaps = {};

colorMaps.render = (page, registeredCallbacks) => {
  let id, elem;
  let image = page.image;
  let names = cmap.names();
  let cmaps = [];
  for (var i = 0; i < names.length; i += 2) {
    cmaps.push([names[i], names[i + 1]]);
  }

  // let cmaps = [
  //   ['grey', 'plasma'],
  //   ['rainbow', 'firesky'],
  //   ['inferno', 'watermelon'],
  //   ['bluegreen', 'red'],
  //   ['cool', 'green'],
  //   ['magma', 'blue'],
  // ];
  let getId = cmap => `select-cmap-${cmap}`;
  let cmapsHtml = '';
  cmaps.forEach(row => {
    cmapsHtml += '<div class="row">';
    row.forEach(cmap => {
      id = getId(cmap);
      cmapsHtml += `
        <div class="col-6">
          <div id="${id}" class="row select-cmap" data-cmap="${cmap}">
            <div class="label col-4 d-flex align-items-center">${cmap}</div>
            <div class="canvas col-8 d-flex align-items-center" >
              <canvas id="${id}-canvas"></canvas>
            </div>
          </div>
        </div>
      `;
    });
    cmapsHtml += '</div>';
  });
  let html = `
    <div class='control-collection color-maps'>
      <div class='title'>Color Maps</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Select a color range to add color to your image</div>
      ${cmapsHtml}
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    cmaps.forEach(row => {
      row.forEach(cmap => {
        id = getId(cmap);
        elem = document.getElementById(id);
        elem.addEventListener('click', event => {
          event.stopPropagation();
          let id = event.currentTarget.dataset.cmap;
          image.cmap = cmap;
          images.renderMainMasterpiece(image);
          console.log(`${id} clicked`);
        });
      });
    });
  }
};

export default colorMaps;
