/*jshint esversion: 6 */
/*global app  */

let telescopes = {};

telescopes.render = page => {
  let telescopes = page.telescopes;
  let html = `<div>${app.telescopeData.prologue}</div>`;
  let modalHtml = '';
  let id, modalId;
  telescopes.forEach(telescope => {
    id = telescope.key;
    modalId = `${id}-modal`;
    html += `
      <div id="${id}" class="telescope-container" data-bs-toggle="modal" data-bs-target="#${modalId}">
        <div class="about-telescope">${telescope.name} Telescope</div>
        <div id="${telescope.key}-container" class="telescope-image-container">
          <img src="${telescope.image}"></img>
        </div>
      </div>
    `;

    modalHtml += `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}-title">About the ${telescope.name} Telescope</h5>
              <div class="image-container">
                <img src="${telescope.image}"></img>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="modal-body">
              ${telescope.description}
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
};

export default telescopes;
