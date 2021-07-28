/*jshint esversion: 6 */
/*global app  */

let telescopes = {};

telescopes.updateVisibility = page => {
  let enabled = page.image.selectedMainLayers;
  let scopes = page.telescopes;
  let id, elem;
  visibilityOff(scopes);
  let count = Math.min(page.canvasImages.rawdataSources.length, 3);
  for (let i = 0; i < count; i++) {
    if (enabled[i] == '1') {
      let key = page.image.sources[i].telescope;
      let index = page.telescopes.findIndex(obj => obj.key == key);
      scopes[index].visible = true;
    }
  }
  scopes.forEach((scope) => {
    id = scope.key;
    elem = document.getElementById(id);
    if (scope.visible) {
      elem.style.display = "block";
    } else {
      elem.style.display = "none";
    }
  });

  function visibilityOff(scopes) {
    scopes.forEach((scope) => {
      scope.visible = false;
    });
  }
};

telescopes.render = (page, registeredCallbacks) => {
  let scopes = page.telescopes;
  let html = `<div>${app.telescopeData.prologue}</div>`;
  let modalHtml = '';
  let id, modalId;
  registeredCallbacks.push(callback);
  scopes.forEach(scope => {
    id = scope.key;
    modalId = `${id}-modal`;
    html += `
      <div id="${id}" class="telescope-container" data-bs-toggle="modal" data-bs-target="#${modalId}">
        <div class="about-telescope">${scope.name} Telescope</div>
        <div id="${scope.key}-container" class="telescope-image-container">
          <img src="${scope.image}"></img>
        </div>
      </div>
    `;

    modalHtml += `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}-title">About the ${scope.name} Telescope</h5>
              <div class="image-container">
                <img src="${scope.image}"></img>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="modal-body">
              ${scope.description}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-small btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  return [html, modalHtml];

  function callback(page) {
    telescopes.updateVisibility(page);
  }
};

export default telescopes;
