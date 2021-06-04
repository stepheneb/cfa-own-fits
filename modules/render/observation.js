/*jshint esversion: 6 */
/*global app  */
/*global bootstrap  */

let observation = {};

observation.render = (page, registeredCallbacks) => {
  // let title = "Take your own image tonight";
  let id = "observation";
  let modalId = `${id}-modal`;
  let enterEmailButtonId = `${id}-enter-email-button`;
  let sendEmailButtonId = `${id}-send-email-button`;

  //             <textarea id="keyboard" placeholder="Enter Text..."></textarea>

  let modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}-title">${page.category.title2}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-3">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of <span class="image-name pe-2"> ${page.title} </span> tonight.
                </div>
                <div class="context">
                  <p>${page.observationtext}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              <div id="enter-email" class="col-6 enter-email">
                <form class="row" autocomplete="off" action="https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/requests/telescope.php" method="POST">
                  <label for="email">Your Email:</label>
                  <input id="email" type="email" class="col-9" name="email" required minlength="4" maxlength="45" size="30" autocomplete="none"></input>
                  <input id="email-kiosk-id" type="hidden" name='kiosk_id' value="${app.kiosk_id}"></input>
                  <input id="email-observation" type="hidden" name='observation' value="${page.title}"></input>
                  <input id="email-date" type="hidden" name='datetime_when_user_made_request_at_kiosk' value="${new Date().toISOString()}"></input>
                  <input id="email-credential" type="hidden" name='credential' value="1114c7c1d689b28d3e21178c47136be21899050022084b856fea4277966f927"></input>
                  <button id="${sendEmailButtonId}" type="submit" class="col-3 btn btn-outline-primary btn-small page-navigation-button" autocomplete="none">
                    SEND EMAIL
                  </button>
                </form>
              </div>
              <div id="observation-image-container" class="image-container">
                <img src=${page.poster}>
              </div>
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

  return [modalHtml, modalId];

  function callback() {
    let modal = document.getElementById(modalId);

    modal.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal.addEventListener('shown.bs.modal', function () {});

    modal.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    new bootstrap.Modal(modal, {}).show();
  }

};

export default observation;
