/*jshint esversion: 6 */

import renderUtil from './util.js';

let specialEffects = {};

specialEffects.render = (page, registeredCallbacks) => {
  let id, elem;
  let effects = [
    ['lighten', 'reduce noise'],
    ['blur', 'emboss'],
    ['sharpen', 'invert']
  ];
  let effectsHtml = '';
  let getId = effect => `select-effect-${effect}`;
  effects.forEach(row => {
    effectsHtml += '<div class="row special-effects">';
    row.forEach(effect => {
      id = getId(effect);
      effectsHtml += `
        <div id='${id}' class="col-6 d-flex align-items-center" data-effect="${id}">
          <input type='checkbox' name='select-effect' value='${id}' disabled>
          <label for='${id}'>${effect}</label>
        </div>
      `;
    });
    effectsHtml += '</div>';
  });
  let html = `
    <div class='control-collection special-effects'>
      <div class='title'>Special Effects</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Try an effect to enhance your image</div>
      ${effectsHtml}
      </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback() {
    effects.forEach(row => {
      row.forEach(effect => {
        id = getId(effect);
        elem = document.getElementById(id);
        elem.addEventListener('change', event => {
          event.stopPropagation();
          let id = event.currentTarget.dataset.effect;
          console.log(`${id} clicked`);
        });
      });
    });
  }
};

export default specialEffects;
