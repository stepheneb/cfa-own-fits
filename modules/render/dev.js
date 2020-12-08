/*jshint esversion: 6 */

let renderDev = {};

renderDev.fullScreenButton = () => {
  return `
    <div class="pl-1 pr-1 ml-auto">
      <button type="button" id="btn-toggle-fullscreen" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Full Screen</button>
    </div>
  `;
};

export default renderDev;
