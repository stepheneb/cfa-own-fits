/*jshint esversion: 6 */
/*global app  */

let saveandsend = {};

saveandsend.render = (page, registeredCallbacks) => {
  let title = "Save + Send";
  let id = "save-and-send";
  let buttonId = `${id}-button`;
  let modalId = `${id}-modal`;
  let enterEmailButtonId = `${id}-enter-email-button`;

  //             <textarea id="keyboard" placeholder="Enter Text..."></textarea>

  let html = `
    <button id="${buttonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button" data-bs-toggle="modal" data-bs-target="#${modalId}">
      ${title}
    </button>`;

  let modalHtml = `
    <div class="modal fade save-and-send" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}-title">${page.category.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-3">
                <div class="salutation">Great Job!</div>
                <div class="about-your-image">
                  Here's your image of the <span class="image-name pe-2"> ${page.image.name}.</span>
                </div>
                <div class="context">
                  <p>${page.saveandsendtext}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              <div id="save-and-send-canvas-container" class="image-container"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-large btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  registeredCallbacks.push(callback);

  return [html, modalHtml];

  function callback() {
    let button = document.getElementById(buttonId);
    let modal = document.getElementById(modalId);

    button.addEventListener('click', () => {});

    modal.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
      page.canvasImages.renderSaveAndSend();
    });

    modal.addEventListener('shown.bs.modal', function () {});

    modal.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

  }

};

export default saveandsend;
