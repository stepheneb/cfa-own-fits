/*jshint esversion: 6 */

import cmap from './cmap.js';

let colorMaps = {};

colorMaps.render = (page, registeredCallbacks) => {
  let id, elem;
  let names = cmap.names();
  let cmapNameGroups = [];
  for (var i = 0; i < names.length; i += 2) {
    cmapNameGroups.push([names[i], names[i + 1]]);
  }

  let getId = cmap => `select-cmap-${cmap}`;
  let cmapsHtml = '';
  cmapNameGroups.forEach(row => {
    cmapsHtml += '<div class="row">';
    row.forEach(cmapName => {
      id = getId(cmapName);
      cmapsHtml += `
        <div class="col-6">
          <div id="${id}" class="row select-cmap" data-cmap="${cmapName}">
            <div class="canvas col-7 d-flex align-items-center" >
              <canvas id="${id}-canvas"></canvas>
            </div>
            <div class="label col-5 d-flex align-items-center">${cmapName}</div>
          </div>
        </div>
      `;
    });
    cmapsHtml += '</div>';
  });
  let html = `
    <div id="select-colormaps" class='color-maps'>
      <div class='title'>Color Maps</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Select a color range to add color to your image</div>
      ${cmapsHtml}
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    let gray = document.getElementById(getId('gray'));
    gray.classList.add('selected');
    cmapNameGroups.forEach(row => {
      row.forEach(cmapName => {
        id = getId(cmapName);
        elem = document.getElementById(id);
        elem.addEventListener('click', event => {
          event.stopPropagation();
          unselectAll();
          event.currentTarget.classList.add('selected');
          let id = event.currentTarget.dataset.cmap;
          page.image.cmapName = cmapName;
          page.canvasImages.scheduleCmap(cmapName);
          page.canvasImages.renderMasterpiece();
          console.log(`${id} clicked`);
        });
      });
    });
  }

  function unselectAll() {
    let container = document.getElementById('select-colormaps');
    container.querySelectorAll('.row.select-cmap').forEach(c => c.classList.remove('selected'));
  }
};

export default colorMaps;
