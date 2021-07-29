/*jshint esversion: 6 */

//
// Animate Images Over Time
//

let animate = {};

animate.render = (page, registeredCallbacks) => {
  let id = 'animate-player';
  let idControls = 'animate-controls';
  let stepBackId = 'animate-step-back';
  let playId = "animate-play";
  let pauseId = "animate-pause";
  let stepForwardId = "animate-step-forward";
  let previewImageBackNameId = "preview-image-back-name";
  let previewImageCenterNameId = "preview-image-center-name";
  let previewImageNextNameId = "preview-image-next-name";

  let html = `
    <div id='${id}'>
      <div class="row">
        <div class="col-4 m-0 p-0">
          <div class="animate-left px-2 mt-2 mb-2 pt-2 pb-2">
            <div id="preview-image-back-canvas-container" class="animate"></div>
          </div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageBackNameId}" class="px-2 pt- pb-1">name</div>
          </div>
        </div>
        <div class="col-4 animate-center px-2 pt-3 pb-2">
          <div id="preview-image-center-canvas-container" class="animate"></div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageCenterNameId}" class="px-2 pt-3 pb-1">name</div>
          </div>
        </div>
        <div class="col-4 m-0 p-0">
          <div class="animate-right px-2 mt-2 mb-2 pt-2 pb-2">
            <div id="preview-image-next-canvas-container" class="animate"></div>
          </div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageNextNameId}" class="px-2 pt- pb-1">name</div>
          </div>
        </div>
      </div>

      <div id="${idControls}" class="d-flex flex-row justify-content-evenly align-items-center">

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
    </div>
  `;

  registeredCallbacks.push(callback);

  return html;

  function callback() {
    let controls = document.getElementById(idControls);
    let stepBack = document.getElementById(stepBackId);
    let play = document.getElementById(playId);
    let pause = document.getElementById(pauseId);
    let stepForward = document.getElementById(stepForwardId);
    let previewImageBackName = document.getElementById(previewImageBackNameId);
    let previewImageCenterName = document.getElementById(previewImageCenterNameId);
    let previewImageNextName = document.getElementById(previewImageNextNameId);

    let stepDuration = (page.stepDuration || 250);

    let sources = page.canvasImages.rawdataSources;
    let len = sources.length;
    let layerNum = page.selectedSourceNumber;

    updateNames();

    stepBack.addEventListener('click', () => {
      animationStop();
      animationStep(-1);
    });

    play.addEventListener('click', () => {
      controls.classList.add('playing');
      animationStep(1);
      page.animate = setInterval(() => {
        animationStep(1);
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
      controls.classList.remove('playing');
      if (page.animate) {
        clearInterval(page.animate);
      }
    }

    function animationStep(step) {
      layerNum = newLayerNum(layerNum, step);
      page.image.selectedSourceNumber = layerNum;
      page.canvasImages.renderAnimatePreviews(page.selectedSource);
      page.canvasImages.renderCanvasRGB1(page.selectedSource);
      updateNames();
      // logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    }

    function newLayerNum(num, step) {
      num += step;
      if (num >= len) {
        num = 0;
      } else if (num < 0) {
        num = len - 1;
      }
      return num;
    }

    function updateNames() {
      previewImageBackName.innerText = `${page.title} ${newLayerNum(layerNum, -1)+1}`;
      previewImageCenterName.innerText = `${page.title} ${layerNum+1}`;
      previewImageNextName.innerText = `${page.title} ${newLayerNum(layerNum, 1)+1}`;
    }
  }
};

export default animate;
