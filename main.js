/*jshint esversion: 6 */

import request from './modules/request.js';
import { images } from './modules/images.js';

import { logger } from './modules/logging.js';

import { utilities } from './modules/utilities.js';

import { imageLayerHistogram } from './modules/layerHistogram.js';

let app = {};

request({ url: "app.json" })
  .then(data => {
    app = setupNewApp(JSON.parse(data));
    router();
  })
  .catch(error => {
    console.log(error);
  });

let setupNewApp = newApp => {
  newApp.hashRendered = "start";
  newApp.splashRendered = false;
  newApp.pageNum = -1;
  newApp.categories.forEach(category => {
    category.pages.forEach(page => {
      if (page.image.selectedSource == undefined) {
        page.image.selectedSource = 0;
      }
      if (page.image.selectedMainLayers == undefined) {
        page.image.selectedMainLayers = "100";
      }
    });
  });
  return newApp;
};

let getSelectedSource = page => {
  return page.image.sources[page.image.selectedSource];
};

// router

let router = () => {
  let hash = window.location.hash;
  if (hash != app.hashRendered) {
    let match = hash.match(/#(?<action>menu|run)(\/((?<category>[\w-]+)))?(\/((?<page>[\w-]+)))?/);
    if (match) {
      let actionName = match.groups.action;
      let categoryName = match.groups.category;
      let pageName = match.groups.page;
      if (actionName == 'menu') {
        renderActivityMenuPage(categoryName);
      } else if (actionName == 'run') {
        routeToRenderActivityPage(categoryName, pageName);
      } else {
        showSplashPage();
      }
    } else {
      showSplashPage();
    }
  }
};

window.addEventListener('hashchange', event => {
  router();
});

let routeToRenderActivityPage = (categoryType, pageName) => {
  let category = false;
  let page = false;
  category = app.categories.find(c => c.type == categoryType);
  if (category) {
    page = category.pages.find(p => p.name == pageName);
  }

  if (category && page) {
    renderActivityPage(category, page);
  } else {
    window.location.hash = "menu";
  }
};

// Splash page

let showSplashPage = () => {
  let splash = document.getElementById('splash');
  if (app.splashRendered == false) {
    splash.innerHTML = `
      <img src="images/splash.jpg"></img>
      <div id="splash-center" class="d-flex align-items-center justify-content-center">
        <div classs="col-12 h-100">
          <div class="title1 row justify-content-center">${app.splash.title1}</div>
          <div class="title2 row justify-content-center">${app.splash.title2}</div>
        </div>
      </div>
      <div id="splash-footer" class="fixed-bottom d-flex flex-row justify-content-center">
        <div class="pl-1 pr-1">
          <div class="start text align-self-center p-2">${app.splash.begin}</div>
        </div>
      </div>
    `;
    app.splashRendered = true;
  }
  splash.style.zIndex = "100";
  splash.style.display = "block";

  splash.addEventListener('click', splashListener);
  window.location.hash = '';
  app.hashRendered = window.location.hash;
};

let hideSplash = () => {
  let splash = document.getElementById('splash');
  splash.style.display = "none";
};

let splashListener = e => {
  hideSplash();
  renderActivityMenuPage();
};

// Activity Menu page

let renderActivityMenuPage = (categoryType) => {
  let hash = "menu";
  let category = false;
  category = app.categories.find(c => c.type == categoryType);
  if (category) {
    hash = `menu/${category.type}`;
  }

  let html = renderActivityMenuPageHeader(app);
  html += `
      <div class="activity-category-menu">
        ${renderActivityCategoryMenu(app)}
      </div>

      ${renderActivityCategoryPagesMenu(app)}

      ${renderMenuPageButtons()}
    `;
  document.getElementById("content").innerHTML = html;

  if (category) {
    renderMenuCategoryPages(category);
  }

  let addMenuCategoryListener = (category) => {
    let id = `menu-category-${category.type}`;
    document.getElementById(id).addEventListener('click', event => {
      renderMenuCategoryPages(category);
    });
  };

  app.categories.forEach(addMenuCategoryListener);

  let addSVGCloseMenuCategoryPagesListener = (category) => {
    let id = `svg-close-menu-${category.type}-pages`;
    document.getElementById(id).addEventListener('click', event => {
      renderMenuCategoryPages(category);
    });
  };

  app.categories.forEach(addSVGCloseMenuCategoryPagesListener);

  let addStartPageListener = (category, page) => {
    let id = `open-page-${category.type}-${page.name}`;
    document.getElementById(id).addEventListener('click', event => {
      renderActivityPage(category, page);
    });
  };

  app.categories.forEach((category) => {
    category.pages.forEach((page) => {
      addStartPageListener(category, page);
    });
  });

  setupEventHandlers();
  checkBrowserFeatureCapability();
  hideSplash();
  app.hashRendered = hash;
  window.location.hash = hash;
};

let renderActivityMenuPageHeader = app => {
  return `
    <div class='row menu-page-header'>
      <div class='col-8'>
        <div class='title'>${app.title}</div>
        <div class='subtitle'>${app.subtitle}</div>
      </div>
    </div>
  `;
};

let renderActivityCategoryMenu = app => {
  let html = `
      <div class="row">
    `;
  let categories = app.categories;
  let categoryCount = categories.length;
  for (var i = 0; i < categoryCount; i++) {
    let category = categories[i];
    let type = category.type;
    html += `
        <div class="category col-2"  id="menu-category-${type}" data-num="${i}">
          <img src="${category.menuimage}"></img>
          <div class="menu-activity-category-title">
            <header class="menu-activity-category-title">${category.title}</header>
          </div>
        </div>
      `;
  }
  html += `
      </div>
    `;
  return html;
};

let renderMenuCategoryPages = (category) => {
  var elem, categoryPagesElement;
  let hash = "";
  let categories = app.categories;
  let selectedCategory = category;
  let type = selectedCategory.type;
  let categoryElements = document.getElementsByClassName('category');
  let selectedCategoryElement = document.getElementById(`menu-category-${type}`);
  if (selectedCategoryElement.classList.contains("selected")) {
    for (category of categories) {
      elem = document.getElementById(`menu-category-${category.type}`);
      categoryPagesElement = document.getElementById(`menu-category-${category.type}-pages`);
      elem.classList.remove("selected", "not-selected");
      categoryPagesElement.classList.remove("selected");
      hash = `menu`;
    }
  } else {
    for (category of categories) {
      elem = document.getElementById(`menu-category-${category.type}`);
      categoryPagesElement = document.getElementById(`menu-category-${category.type}-pages`);
      if (elem == selectedCategoryElement) {
        elem.classList.add("selected");
        elem.classList.remove("not-selected");
        categoryPagesElement.classList.add("selected");
        hash = `menu/${category.type}`;
      } else {
        elem.classList.add("not-selected");
        elem.classList.remove("selected");
        categoryPagesElement.classList.remove("selected");
      }
    }
  }
  app.hashRendered = hash;
  window.location.hash = hash;
};

let renderActivityCategoryPagesMenu = app => {
  let html = '';
  app.categories.forEach((category, i) => {
    let type = category.type;
    let id = `menu-category-${type}-pages`;
    let svgCloseId = `svg-close-menu-${type}-pages`;
    let title = category.title;
    let subtitle = category.subtitle;
    let pages = category.pages;
    html += `
      <div id="${id}" class="menu-category-pages">
        <svg id="${svgCloseId}">
          <circle />
          <line x1="40%" y1="35%" x2="60%" y2="65%"/>
          <line x1="60%" y1="35%" x2="40%" y2="65%"/>
        </svg>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
          <div class="action">${app.action}</div>

        </div>
        <div class="body">
          ${renderMenuCategoryPageCollection(category)}
        </div>
      </div>
    `;
  });
  return html;
};

let renderMenuCategoryPageCollection = category => {
  let html = '';
  let type = category.type;
  category.pages.forEach((page) => {
    var id = `open-page-${category.type}-${page.name}`;
    html += `
      <div id="${id}" class="menu-category-page">
        <img src="images/page-images/${type}-${page.name}.jpg"></img>
        <div class="name">${page.image.name}</div>
        <div class="telescope">${page.image.about.telescope}</div>
      </div>
    `;
  });
  return html;
};

// Test for browser features

let checkBrowserFeatureCapability = () => {
  if (typeof OffscreenCanvas != "function") {
    alert("This browser doesn't support the OffscreenCanvas() function. \nPlease try again with Chrome, Edge or Opera.");
    return false;
  } else {
    return true;
  }
};

// Activity page

let renderActivityPage = (category, page) => {
  hideSplash();
  window.location.hash = `run/${category.type}/${page.name}`;
  renderPage(page);
  setupEventHandlers();
  page.image.destinations = {
    main: {
      canvas: document.getElementById("main-image-canvas")
    },
    preview: {
      canvas: document.getElementById('image-layer-preview'),
      img: document.getElementById('image-layer-preview')
    }
  };
  images.init(page.image, page.image.destinations.preview);
  if (checkBrowserFeatureCapability()) {
    images.get(page);
    controllerImageSelectFilterLayerToAdjust(page);
    controllerImageAdjustFilterLayer(page);
    updateImageAdjustFilterLayer(page);
    controllerImageSelectMainLayer(page);
  }
  document.getElementById('btn-back').addEventListener('click', event => {
    window.location.hash = `menu/${category.type}`;
  });
  app.hashRendered = window.location.hash;
};

//
// Component rendering ...
//

let renderPage = page => {
  let html = `
    <div id='page-1' class='activity-page'>
      ${renderPageHeader(page)}

      <div class='row'>
        <div class='col-3'>
          ${renderImageSelectFilterLayerToAdjust(page)}
          ${renderImageLayerPreview(page)}
          ${renderImageAdjustFilterLayer(page)}
        </div>
        <div class='col-7'>
          ${renderMainImageContent(page)}
        </div>
        <div class='col-2'>
          ${renderImageAboutTelescope(page)}
          ${imageLayerHistogram.render(getSelectedSource(page))}
        </div>
      </div>
    </div>
    ${renderPageNavigation()}
  `;
  document.getElementById("content").innerHTML = html;
};

let renderPageHeader = page => {
  return `
    <div class='row page-header'>
      <div class='col-6'>
        <div class='page-title'>${page.title}</div>
        <div class='page-subtitle'>${page.subtitle}</div>
      </div>
    </div>
  `;
};

let controllerImageSelectFilterLayerToAdjust = (page) => {
  let layerNum = page.image.selectedSource;
  let elem = document.getElementById("image-select-filter-layer-to-adjust");
  elem.addEventListener('change', (e) => {
    let i = Number(event.target.value);
    selectImageFilterLayerToAdjust(page, i);
  });
  if (typeof layerNum == 'number') {
    elem.querySelector(`[value='${layerNum}']`).checked = true;
    page.image.selectedSource = layerNum;
  }
};

let selectImageFilterLayerToAdjust = (page, layerNum) => {
  page.image.selectedSource = layerNum;
  let source = page.image.sources[layerNum];
  images.renderOffscreen(source, page.image.nx, page.image.ny);
  images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
  updateImageAdjustFilterLayer(page);
  logger.imageData(source);
};

let renderImageSelectFilterLayerToAdjust = page => {
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.selectfiltertext}</div>
      <form id="image-select-filter-layer-to-adjust">
        ${renderRadioButtons(page)}
      </form>
    </div>
  `;

  function renderRadioButtons(page) {
    let sources = page.image.sources;
    let html = '';
    for (var i = 0; i < sources.length; i++) {
      let source = sources[i];
      if (source.type == "rawdata") {
        html += `
              <div class='row'>
                <div class='select-filter-radio'>
                  <input id='select-rgb-${i}' type='radio' name='select-rgb' value='${i}'>
                </div>
                <div class='select-filter-label'>
                  <label for='select-rgb-${i}'>${source.name}</label>
                </div>
              </div>
            `;
      }
    }
    return html;
  }
};

let renderImageLayerPreview = page => {
  return `
    <div id="preview-image-canvas-container" class="row d-flex justify-content-center">
      <canvas id='image-layer-preview'></canvas>
    </div>
  `;
};

let renderImageAboutTelescope = page => {
  return `
    <div>${page.image.about.prologue}</div>
    <div class="about-telescope">${page.image.about.telescope} Telescope</div>
    <canvas class='image-about-telescope'></canvas>
  `;
};

let controllerImageAdjustFilterLayer = page => {

  let elemBrightness = document.getElementById("brightness");
  elemBrightness.addEventListener('input', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    let brightness = e.target.valueAsNumber;
    source.brightness = brightness;
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

  let elemContrast = document.getElementById("contrast");
  elemContrast.addEventListener('input', (e) => {
    let source = getSelectedSource(page);
    source.contrast = e.target.valueAsNumber;
    let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
    source.max = source.originalMax - contrastShift;
    source.min = Math.max(0, source.originalMin + contrastShift);
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

  let elemScaling = document.getElementById("select-scaling");
  elemScaling.addEventListener('change', (e) => {
    let source = getSelectedSource(page);
    source.scaling = event.target.value;
    images.renderOffscreen(source, page.image.nx, page.image.ny);
    images.copyOffscreenToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    images.renderMain(page.image);
    logger.imageData(source);
  });

};

let updateImageAdjustFilterLayer = page => {
  let source = getSelectedSource(page);
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let elemScaling = document.getElementById("select-scaling");
  let radios = elemScaling.elements.scaling;
  radios.value = source.scaling;
};

let renderImageAdjustFilterLayer = page => {
  let source = getSelectedSource(page);;
  return `
    <div class='control-collection'>
      <div class='control-collection-text'><span class="solid-right-arrow">&#11157</span>${page.adjustimagetext}</div>
      <div class='row'>
        <div class='col-4'>
          <label class="pl-2" for='brightness'>Brightness</label>
        </div>
        <div class='col-8'>
          <input type='range' id='brightness' name='brightness'  min='0' max='${page.image.maximumBrightness}' value='${page.image.maximumBrightness / 2}'
            step='0.05'>
        </div>
      </div>

      <div class=' row'>
        <div class='col-4'>
          <label class="pl-2" for='contrast'>Contrast</label>
        </div>
        <div class='col-8'>
          <input type='range' id='contrast' name='contrast' min='0.04' max='1.96' value='1' step='0.01'>
        </div>
      </div>

      <div class='row'>
        <div class='col-4'>
          <label class="pl-2" for='color-shift'>Color Shift</label>
        </div>
        <div class='col-8'>
          <input type='range' id='color-shift' name='color-shift' min='0' max='10' value='5' disabled>
        </div>
      </div>

      <div class='row'>
        <div class='col-4'>
          <label class="pl-2">Scaling</label>
        </div>
        <form id="select-scaling" class="d-flex flex-row justify-content-start">
          <div class="select-scaling-label">
            <label for="select-scaling-linear">Linear</label>
          </div>
          <div class="select-scaling-radio">
            <input id="select-scaling-linear" type="radio" name="scaling" value="linear">
          </div>
          <div class="select-scaling-label">
            <label for="select-scaling-log">Log</label>
          </div>
          <div class="select-scaling-radio">
            <input id="select-scaling-log" type="radio" name="scaling" value="log">
          </div>
        </form>
      </div>
    </div>
  `;
};

let renderMainImageContent = page => {
  return `
    <div class='main-image-content'>
      <div id="main-image-canvas-container" class="row d-flex justify-content-center">
        <canvas id='main-image-canvas'></canvas>
      </div>
      ${renderUnderMainImageRow(page)}
    </div>
  `;
};

let controllerImageSelectMainLayer = page => {
  let elem = document.getElementById("image-select-main-layer");
  elem.addEventListener('change', (e) => {
    let checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"'));
    page.image.selectedMainLayers = checkboxes.map(elem => elem.checked ? '1' : '0').join('');
    images.renderMain(page.image);
  });
};

let renderUnderMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start mt-2">
      <div class="pr-4"><span class="solid-right-arrow">&#11157</span> Combine to reveal a full-color image</div>
      <form id="image-select-main-layer">
        <div class="d-flex flex-row justify-content-start">
          ${renderUnderMainImageLayerSelectors(page)}
        </div>
      </form>
      <div class="image-name pl-2 pr-2 ml-auto">
        ${page.image.name}
      </div>
    </div>
  `;
};

let renderUnderMainImageLayerSelectors = page => {
  let sources = page.image.sources;
  let html = '';
  for (var i = 0; i < sources.length; i++) {
    let source = sources[i];
    let checkedState = page.image.selectedMainLayers[i] == "1" ? "checked" : "";
    if (source.type == "rawdata") {
      let name = source.name;
      html += `
            <div class="select-layer-label">
              <label for='select-layer-${name}'>${name}</label>
            </div>
            <div class="select-layer-checkbox">
              <input type='checkbox' id='select-layer-${name}' name='select-layer-${name}' ${checkedState} value='0'>
            </div>
          `;
    }
  }
  return html;
};

let renderPageNavigation = () => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${renderPageNavigationButtonBack()}
      ${renderPageNavigationButtonFullScreen()}
    </div>
  `;
};

let renderMenuPageButtons = () => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${renderPageNavigationButtonFullScreen()}
    </div>
  `;
};

let renderPageNavigationButtonBack = () => {
  return `
    <div class="pl-1 pr-1">
      <button type="button" id="btn-back" class="btn btn-outline-primary btn-small page-navigation-button">&#9664 Back</button>
    </div>
  `;
};

let renderPageNavigationButtonFullScreen = () => {
  return `
    <div class="pl-1 pr-1 ml-auto">
      <button type="button" id="btn-toggle-fullscreen" class="btn btn-outline-primary btn-small page-navigation-button">Toggle Full Screen</button>
    </div>
  `;
};

//
// Event handling
//

let setupEventHandlers = () => {
  let toggleFullscreenButton = document.getElementById('btn-toggle-fullscreen');
  if (toggleFullscreenButton) {
    toggleFullscreenButton.addEventListener('click', event => {
      if (document.documentElement.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else {
          if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
        }
      } else {
        const _element = document.documentElement;
        if (_element.requestFullscreen) {
          _element.requestFullscreen();
        } else {
          if (_element.webkitRequestFullscreen) {
            _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        }
      }
    });
  } else {
    console.log('btn-toggle-fullscreen not found');
  }
};
