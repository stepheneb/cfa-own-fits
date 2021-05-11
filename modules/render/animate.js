/*jshint esversion: 6 */

//
// Animate Images Over Time
//

let animate = {};

animate.render = (page, registeredCallbacks) => {
  let id = 'animate-controls';
  let stepBackId = 'animate-step-back';
  let playId = "animate-play";
  let pauseId = "animate-pause";
  let stepForwardId = "animate-step-forward";

  let html = `
    <div id="${id}" class="d-flex flex-row justify-content-evenly align-items-center">

      <div id="${stepBackId}" class="animate-control">
        <i class="bi bi-skip-start"></i>
      </div>

      <div id="${playId}" class="animate-control">
        <i class="bi bi-play-circle"></i>
      </div>

      <div id="${pauseId}" class="animate-control">
        <i class="bi bi-pause-circle"></i>
      </div>

      <div id="${stepForwardId}" class="animate-control">
        <i class="bi bi-skip-end"></i>
      </div>
    </div>
  `;

  registeredCallbacks.push(callback);

  return html;

  function callback() {
    let container = document.getElementById(id);
    let stepBack = document.getElementById(stepBackId);
    let play = document.getElementById(playId);
    let pause = document.getElementById(pauseId);
    let stepForward = document.getElementById(stepForwardId);

    let stepDuration = 250;

    let sources = page.canvasImages.rawdataSources;
    let len = sources.length;
    let layerNum = page.selectedSourceNumber;

    stepBack.addEventListener('click', () => {
      animationStop();
      animationStep(-1);
    });

    play.addEventListener('click', () => {
      container.classList.add('playing');
      animationStep(1);
      page.animate = setInterval(() => {
        animationStep(-1);
      }, stepDuration);
    });

    pause.addEventListener('click', () => {
      animationStop();
    });

    stepForward.addEventListener('click', () => {
      animationStop();
      animationStep(1);
    });

    function animationStop() {
      container.classList.remove('playing');
      if (page.animate) {
        clearInterval(page.animate);
      }
    }

    function animationStep(step) {
      layerNum += step;
      if (layerNum >= len) {
        layerNum = 0;
      } else if (layerNum < 0) {
        layerNum = len - 1;
      }
      page.image.selectedSourceNumber = layerNum;
      page.canvasImages.renderPreview(page.selectedSource);
      page.canvasImages.renderCanvasRGB1(page.selectedSource);
      // logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    }
  }
};

export default animate;
