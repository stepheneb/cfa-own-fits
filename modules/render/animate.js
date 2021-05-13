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
  let previewImageNameId = "preview-image-name";

  let html = `
  <div class="row">
    <div class="col-4">
    </div>
    <div class="col-4 animate-center px-1 pt-3 pb-2">
      <div id="preview-image-canvas-container" class="animate"></div>
      <div class="d-flex justify-content-center">
        <div id="${previewImageNameId}" class="px-2 pt-3 pb-1">name</div>
      </div>
    </div>
    <div class="col-4"></div>
  </div>

    <div id="${id}" class="d-flex flex-row justify-content-evenly align-items-center">

      <div type="button" id="${stepBackId}" class="animate-control step back unselectable d-flex flex-row align-items-center">
        <div class="label">back</div>
        <div class="bi bi-skip-start-fill"></div>
      </div>

      <div id="${playId}" class="animate-control playpause unselectable">
        <i class="bi bi-play-circle"></i>
      </div>

      <div id="${pauseId}" class="animate-control playpause unselectable">
        <i class="bi bi-pause-circle"></i>
      </div>

      <div id="${stepForwardId}"  type="button" class="animate-control animate-control step next unselectable d-flex flex-row align-items-center">
        <div class="bi bi-skip-end-fill"></div>
        <div class="label">next</div>
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
    let previewImageName = document.getElementById(previewImageNameId);

    let stepDuration = (page.stepDuration || 250);

    let sources = page.canvasImages.rawdataSources;
    let len = sources.length;
    let layerNum = page.selectedSourceNumber;

    updateName();

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
      updateName();
      // logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    }

    function updateName() {
      previewImageName.innerText = `${page.title} ${layerNum+1}`;
    }
  }
};

export default animate;
