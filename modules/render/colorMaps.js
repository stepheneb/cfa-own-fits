/*jshint esversion: 6 */

import renderUtil from './util.js';

let colorMaps = {};

colorMaps.render = (page, registeredCallbacks) => {
  let id, elem;
  let cmaps = [
    ['grey', 'plasma'],
    ['rainbow', 'firesky'],
    ['inferno', 'watermelon'],
    ['bluegreen', 'red'],
    ['cool', 'green'],
    ['magma', 'blue'],
  ];
  let getId = cmap => `select-cmap-${cmap}`;
  let cmapsHtml = '';
  cmaps.forEach(row => {
    cmapsHtml += '<div class="row select-cmap">';
    row.forEach(cmap => {
      id = getId(cmap);
      cmapsHtml += `
        <div id="${id}" class="col-6 d-flex align-items-center" data-cmap="${id}">
          <div>${cmap}</div>
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
          console.log(`${id} clicked`);
        });
      });
    });
  }
};

export default colorMaps;
