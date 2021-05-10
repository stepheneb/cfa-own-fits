/*jshint esversion: 6 */
/*global app  */

let saveandsend = {};

saveandsend.render = () => {
  let title = "Save + Send";
  let id = "save-and-send";
  let modalId = `${id}-modal`;

  let html = `
    <button id="${id}-button" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
      ${title}
    </button>`;

  let modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}-title">${title}/h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <textarea id="keyboard" placeholder="Enter Text..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-small btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  return [html, modalHtml];
};

export default saveandsend;
