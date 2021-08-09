/*jshint esversion: 8 */
/*global app  */
/*global bootstrap  */

import emailKeyboard from './email-keyboard.js';
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

  let modalId1 = `${id}-modal1`;
  let enterEmailButtonId = `${id}-enter-email-button`;

  let modalId2 = `${id}-modal2`;
  let sendEmailFormId = `${id}-send-email-form`;

  let modalId3 = `${id}-modal3`;

  function telescope() {
    return `
      <div class="image-container telescope">
        <img src='./images/micro-observatory.jpg'>
        <div class='label'>Our Telescope</div>
      </div>
      `;
  }

  function image() {
    return `
      <div class="image-container">
        <img src=${page.poster}>
        <div class='label'>${page.title}</div>
      </div>
      `;
  }

  let modalHtmls = `
    <div class="modal fade observation" id="${modalId1}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId1}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId1}-title">${page.category.title2}</h5>
            <button id="${modalId1}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body one">
            <div class="row">
              <div class="col-left d-flex flex-column justify-content-start">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of the <span class="image-name">${page.title}</span> tonight.
                </div>
                <div class="context">
                  <p>${page.observationtext}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
                <div class='column-middle-spacer'></div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              ${telescope()}
              ${image()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade observation" id="${modalId2}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId2}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId2}-title">${page.category.title2}</h5>
            <button id="${modalId2}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body two">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of the <span class="image-name pe-2"> ${page.title}</span> tonight.
                </div>
                <div class="context">
                  <p>${page.observationtext}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
              </div>
              <div id="enter-email" class="enter-email">
                <form id="${sendEmailFormId}" autocomplete="off">
                  <label for="email">Your Email:</label>
                  <div class='d-flex flex-row justify-content-between align-items-center'>
                    <input id="email" type="email"name="email" required minlength="4" maxlength="45" size="30" autocomplete="none"></input>
                    <input id="email-kiosk-id" type="hidden" name='kiosk_id' value="${app.kiosk_id}"></input>
                    <input id="email-observation" type="hidden" name='observation' value="${page.title}"></input>
                    <input id="email-date" type="hidden" name='datetime_when_user_made_request_at_kiosk' value="${new Date().toISOString()}"></input>
                    <input id="email-credential" type="hidden" name='credential' value="1114c7c1d689b28d3e21178c47136be21899050022084b856fea4277966f927"></input>
                    <button type="submit" class="btn btn-outline-primary btn-small page-navigation-button" autocomplete="none">
                      SEND EMAIL
                    </button>
                  </div>
                </form>
                ${emailKeyboard.render(page, registeredCallbacks)}
                <div class="simple-keyboard"></div>
              </div>
              ${telescope()}
              ${image()}
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="modal fade observation" id="${modalId3}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId3}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId3}-title">${page.category.title2}</h5>
            <button id="${modalId3}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body three">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">
                  We'll take your image of the <span class="image-name pe-2"> ${page.title}</span> tonight.
                </div>
                <div class="context">
                  <p>${page.observationtext}</p>
                </div>
              </div>
              <div class="thanks">
                <div class='salutation'>Thank You!</div>
                <div class='details'>
                  We will send your image to <span id="your-email">yourname@website.com</span>
                </div>
              </div>
              ${telescope()}
              ${image()}
            </div>
          </div>
        </div>
      </div>
    </div>

  `;

  registeredCallbacks.push(callback);

  return [modalHtmls, modalId3];

  function callback() {

    let modal1 = document.getElementById(modalId1);
    let modal2 = document.getElementById(modalId2);
    let modal3 = document.getElementById(modalId3);

    let modal1CloseButton = document.getElementById(modalId1 + '-button');
    let modal2CloseButton = document.getElementById(modalId2 + '-button');
    let modal3CloseButton = document.getElementById(modalId3 + '-button');

    let bsModal1 = new bootstrap.Modal(modal1, {});
    let bsModal2 = new bootstrap.Modal(modal2, {});
    let bsModal3 = new bootstrap.Modal(modal3, {});

    let enterEmailButton = document.getElementById(enterEmailButtonId);

    let sendEmailForm = document.getElementById(sendEmailFormId);

    let yourEmail = document.getElementById('your-email');

    modal1.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal2.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal3.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal1.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal2.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal3.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal1.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    modal2.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    modal3.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    bsModal1.show();

    enterEmailButton.addEventListener('click', () => {
      bsModal1.hide();
      bsModal2.show();
    });

    sendEmailForm.onsubmit = async (e) => {
      e.preventDefault();

      let email = document.getElementById('email');
      let formData = new FormData();
      formData.append("email", email.value);
      formData.append("kiosk_id", app.kiosk_id);
      formData.append("observation", page.title);
      formData.append("datetime_when_user_made_request_at_kiosk", new Date().toISOString());
      formData.append("credential", "1114c7c1d689b28d3e21178c47136be21899050022084b856fea4277966f927");

      // 'https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/requests/telescope.php
      // observation.postUrl = 'https://lweb.cfa.harvard.edu/smgphp/otherworlds/OE/telescope.php';
      //
      // const response = await fetch(observation.postUrl, {
      //   method: 'POST',
      //   mode: 'no-cors',
      //   body: formData
      // });
      //
      // alert(response);
      // let result = response.json();
      // displayAlert(result);

      // function displayAlert(result) {
      //   alert('message =' + result.message + ' \nkiosk_id = ' + result.kiosk_id + ' \nemail = ' + result.email + ' \nobservation = ' + result.observation + ' \ndatetime_when_user_made_request_at_kiosk = ' + result.datetime_when_user_made_request_at_kiosk + ' \ncredential = ' + result.credential);
      // }

      yourEmail.innerText = email.value;

      bsModal2.hide();
      bsModal3.show();

    };

    modal1CloseButton.addEventListener('click', hideAll);
    modal2CloseButton.addEventListener('click', hideAll);
    modal3CloseButton.addEventListener('click', hideAll);

    function hideAll() {
      bsModal1.hide();
      bsModal2.hide();
      bsModal3.hide();
    }

  }
};

export default observation;
