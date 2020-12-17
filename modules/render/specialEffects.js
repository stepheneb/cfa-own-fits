/*jshint esversion: 6 */

import Filter from '../filter.js';

let specialEffects = {};

specialEffects.render = (page, registeredCallbacks) => {
  let id, elem;
  let formId = 'special-effects';
  let effectsHtml = '';
  let getId = effect => `select-effect-${effect}`;
  let filters = Filter.filters;
  let keys = Object.keys(filters);
  let rowCount = 2;
  let filterRows = keys.reduce((all, one, i) => {
    const ch = Math.floor(i / rowCount);
    all[ch] = [].concat((all[ch] || []), one);
    return all;
  }, []);
  filterRows.forEach(row => {
    effectsHtml += '<div class="row special-effects">';
    row.forEach(key => {
      // filter = filters[key];
      // name = filter.name;
      id = getId(key);
      effectsHtml += `
        <div id='${id}' class="effect col-6 d-flex align-items-center" data-effect="${key}">
          <input type='checkbox' name='select-effect' value='${id}'>
          <label for='${id}'>${key}</label>
        </div>
      `;
    });
    effectsHtml += '</div>';
  });
  let html = `
    <div class='control-collection special-effects'>
      <div class='title'>Special Effects</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Try an effect to enhance your image</div>
      <form id="${formId}">
        ${effectsHtml}
      </form>
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    elem = document.getElementById(formId);
    elem.addEventListener('change', (e) => {
      let isChecked = e.target.checked;
      unCheckAll();
      if (isChecked) {
        e.target.checked = true;
      }
      let checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]'));
      let filters = checkboxes.filter(c => c.checked)
        .map(c => c.parentElement.dataset.effect);

      page.canvasImages.scheduleFilters(filters);
      if (filters.length > 0) {
        page.canvasImages.renderMasterpiece();
      } else {
        page.canvasImages.renderCanvasRGB();
        page.canvasImages.renderMasterpiece();
      }
    });
  }

  function unCheckAll() {
    let container = document.getElementById('special-effects');
    container.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
  }

};

export default specialEffects;
