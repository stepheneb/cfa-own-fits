/*jshint esversion: 6 */

//
// Glabal Event handling
//

let events = {};

events.setupGlobal = () => {
  let toggleFullscreenButton = document.getElementById('btn-toggle-fullscreen');
  if (toggleFullscreenButton) {
    toggleFullscreenButton.addEventListener('click', event => {
      if (document.documentElement.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else {
          if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
        }
      } else {
        const _element = document.documentElement;
        if (_element.requestFullscreen) {
          _element.requestFullscreen();
        } else {
          if (_element.webkitRequestFullscreen) {
            _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        }
      }
    });
  } else {
    console.log('btn-toggle-fullscreen not found');
  }
};

export default events;
