/*jshint esversion: 8 */
/*global app  */
/*global bootstrap  */

import u from '../utilities.js';

let observation = {};

observation.active = (page) => {
  let start = Number.parseInt(page.startdate);
  let end = Number.parseInt(page.enddate);
  let now = u.getMonthDayNow();
  if (app.now) {
    now = Number.parseInt(app.now);
  }
  let visible = false;
  if (start < end) {
    visible = now >= start && now <= end;
  } else {
    visible = (now >= start && now <= 1231) || (now <= end);
  }
  return visible;
};

observation.render = (page, registeredCallbacks) => {
  // let title = "Take your own image tonight";
  let id = "observation";
  let modalId = `${id}-modal`;
  let enterEmailButtonId = `${id}-enter-email-button`;
  let sendEmailButtonId = `${id}-send-email-button`;
  let sendEmailFormId = `${id}-send-email-form`;

  let modalHtmls = `
    <div class="modal fade observation" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
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
              <div class="col-left">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of the <span class="image-name">${page.title}</span> tonight.
                </div>
                <div class="context">
                  <p>${page.observationtext}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              <div class="image-container telescope">
                <img src='./images/micro-observatory.jpg'>
                <div class='label'>Our Telescope</div>
              </div>
              <div class="image-container">
                <img src=${page.poster}>
                <div class='label'>${page.title}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-large btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade observation" id="${modalId}2" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}2-title">${page.category.title2}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-3">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of the <span class="image-name pe-2"> ${page.title}</span> tonight.
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
                <form id="${sendEmailFormId}" class="row" autocomplete="off">
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
              <div class="image-container">
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

  return [modalHtmls, modalId];

  function callback() {
    let modal = document.getElementById(modalId);
    let sendEmailForm = document.getElementById(sendEmailFormId);

    modal.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal.addEventListener('shown.bs.modal', function () {});

    modal.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    new bootstrap.Modal(modal, {}).show();

    sendEmailForm.onsubmit = async (e) => {
      e.preventDefault();

      let email = document.getElementById('email');
      let formData = new FormData();
      formData.append("email", email.value);
      formData.append("kiosk_id", app.kiosk_id);
      formData.append("observation", page.title);
      formData.append("datetime_when_user_made_request_at_kiosk", new Date().toISOString());
      formData.append("credential", "1114c7c1d689b28d3e21178c47136be21899050022084b856fea4277966f927");

      let response = await fetch('https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/requests/telescope.php', {
        method: 'POST',
        mode: "cors",
        body: formData
      });

      let result = response.ok;

      alert(result);
    };
  }
};

export default observation;
