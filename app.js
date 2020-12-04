/*jshint esversion: 6 */

// XMLHttpRequest wrapper using callbacks
let request = obj => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(obj.method || "GET", obj.url);
    if (obj.headers) {
      Object.keys(obj.headers).forEach(key => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(obj.body);
  });
};

let app = {};
let hashRendered = "start";
let splashRendered = false;
let pageNum = -1;

let spinner = (function (e) {
  var elem = e;
  var count = 0;
  this.show = function (mesg) {
    elem.classList.remove("hide");
    count++;
    log("show", `count: ${count}, ${mesg}`);
  };
  this.hide = function (mesg) {
    if (count > 1) {
      count--;
      log("hide", `count: ${count}, ${mesg}`);
    } else {
      count = 0;
      elem.classList.add("hide");
      log("hide", `count: ${count}, ${mesg}`);
    }
  };
  this.cancel = function (mesg) {
    count = 0;
    elem.classList.add("hide");
    log("cancel", mesg);
  };

  function log(name, mesg) {
    if (mesg) {
      console.log(`spinner.${name}: ${mesg}`);
    }
  }
  return this;
})(document.getElementById("loading-spinner"));

let showSpinner = (mesg) => {
  let spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hide");
  if (mesg) {
    console.log(`showSpinner: ${mesg}`);
  }
};

let hideSpinner = (mesg) => {
  let spinner = document.getElementById("loading-spinner");
  spinner.classList.add("hide");
  if (mesg) {
    console.log(`hideSpinner: ${mesg}`);
  }
};

spinner.hide("startup");

request({ url: "app.json" })
  .then(data => {
    app = JSON.parse(data);
    hashRendered = "start";
    router();
  })
  .catch(error => {
    console.log(error);
  });

// router

let router = () => {
  let hash = window.location.hash;
  if (hash != hashRendered) {
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

window.addEventListener('hashchange', event => {
  router();
});

// Splash page

let showSplashPage = () => {
  let splash = document.getElementById('splash');
  if (splashRendered == false) {
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
    splashRendered = true;
  }
  splash.style.zIndex = "100";
  splash.style.display = "block";

  splash.addEventListener('click', splashListener);
  window.location.hash = '';
  hashRendered = window.location.hash;
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
  hashRendered = hash;
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
  hasRendered = hash;
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
  page.image.selectedSource = 0;
  page.image.selectedMainLayers = '100';
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
  initializeCanvasDestinations(page.image);
  initializeCanvas(page.image.destinations.preview);
  if (checkBrowserFeatureCapability()) {
    getImages(page);
    controllerImageSelectFilterLayerToAdjust(page, 0);
    controllerImageAdjustFilterLayer(page);
    updateImageAdjustFilterLayer(page);
    controllerImageSelectMainLayer(page);
  }
  document.getElementById('btn-back').addEventListener('click', event => {
    window.location.hash = `menu/${category.type}`;
  });
  hashRendered = window.location.hash;
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

let controllerImageSelectFilterLayerToAdjust = (page, layerNum) => {
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
  renderOffscreenCanvas(page.image.sources[layerNum], page.image.nx, page.image.ny);
  copyOffscreenCanvasToPreview(page.image.sources[layerNum], page.image.destinations.preview, page.image.nx, page.image.ny);
  consoleLogHistogram(page.image.sources[layerNum]);
  updateImageAdjustFilterLayer(page);
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
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    renderMainLayers(page.image);
  });

  let elemContrast = document.getElementById("contrast");
  elemContrast.addEventListener('input', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    source.contrast = e.target.valueAsNumber;
    let contrastShift = (source.originalRange * source.contrast - source.originalRange) / 2;
    source.max = source.originalMax - contrastShift;
    source.min = Math.max(0, source.originalMin + contrastShift);
    consoleLogHistogram(source);
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    renderMainLayers(page.image);
  });

  let elemScaling = document.getElementById("select-scaling");
  elemScaling.addEventListener('change', (e) => {
    let source = page.image.sources[page.image.selectedSource];
    source.scaling = event.target.value;
    renderOffscreenCanvas(source, page.image.nx, page.image.ny);
    copyOffscreenCanvasToPreview(source, page.image.destinations.preview, page.image.nx, page.image.ny);
    renderMainLayers(page.image);
  });

};

let updateImageAdjustFilterLayer = page => {
  let source = page.image.sources[page.image.selectedSource];
  document.getElementById("brightness").value = source.brightness;
  document.getElementById("contrast").value = source.contrast;
  let elemScaling = document.getElementById("select-scaling");
  let radios = elemScaling.elements.scaling;
  radios.value = source.scaling;
};

let renderImageAdjustFilterLayer = page => {
  let source = page.image.sources[page.image.selectedSource];
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
    renderMainLayers(page.image);
  });
};

let renderUnderMainImageRow = page => {
  return `
    <div class="d-flex flex-row justify-content-start">
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
    let checkedState = "checked";
    if (source.type == "rawdata") {
      let name = source.name;
      if (i > 0) {
        checkedState = "";
      }
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
// Image fetching and rendering ...
//

let getImages = page => {
  // get inital image layer, render offscreen and copy to main canvas
  let source = page.image.sources[0];
  addRawDataSourceAttributes(source);
  fetchRawDataForImage(page, source, renderFuncfetchRawDataForImageFirstSource);
  // step through rest of image layers and fetch all rawdata images
  for (var s = 1; s < page.image.sources.length; s++) {
    source = page.image.sources[s];
    switch (source.type) {
    case 'rawdata':
      fetchRawDataForImage(page, source, renderFuncfetchRawDataForImageSubsequentSource);
      break;
    case 'composite':
      spinner.show("initializeOffscreenCanvas");
      initializeOffscreenCanvas(source, page.image.nx, page.image.ny);
      spinner.hide("initializeOffscreenCanvas");
      break;
    }
  }
};

let fetchRawDataForImage = (page, source, renderFunc) => {
  spinner.show("fetchRawDataForImage");
  fetch(source.path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        return response.arrayBuffer();
      }
    })
    .then(arrayBuffer => {
      source.rawdata = new Float32Array(arrayBuffer);
      addRawDataSourceAttributes(source);
      consoleLogHistogram(source);
      renderFunc(page.image, source, page.image.nx, page.image.ny);
      spinner.hide("then renderFunc");
    })
    .catch(e => {
      spinner.cancel("fetchError");
      console.log('There has been a problem with your fetch operation: ' + e.message);
    });
};

let addRawDataSourceAttributes = source => {
  source.originalMax = source.max;
  source.originalMin = source.min;
  source.originalRange = source.originalMax - source.originalMin;
  [source.rawDataMax, source.rawDataMin] = forLoopMinMax(source);
};

let initializeCanvasDestinations = (image) => {
  initializeCanvasForUseWithOffScreenTransfer(image.destinations.main, image.nx, image.ny);
};

let renderFuncfetchRawDataForImageFirstSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
  copyOffscreenCanvasToPreview(source, image.destinations.preview, nx, ny);
  copyOffscreenCanvasToMain(source, image.destinations.main);
};

let renderFuncfetchRawDataForImageSubsequentSource = (image, source, nx, ny) => {
  initializeOffscreenCanvas(source, nx, ny);
  renderOffscreenCanvas(source, nx, ny);
};

let initializeCanvas = function (destination, nx, ny) {
  let canvas = destination.canvas;
  destination.ctx = canvas.getContext('2d');
  destination.ctx.fillStyle = "rgb(0,0,0)";
  destination.ctx.imageSmoothingEnabled = true;
  destination.ctx.globalCompositeOperation = "source-over";
};

let initializeCanvasForUseWithOffScreenTransfer = function (destination, nx, ny) {
  let canvas = destination.canvas;
  destination.ctx = canvas.getContext('bitmaprenderer');
  destination.ctx.fillStyle = "rgb(0,0,0)";
  destination.ctx.imageSmoothingEnabled = true;
  destination.ctx.globalCompositeOperation = "source-over";
  destination.canvas.width = nx;
  destination.canvas.height = ny;
};

let initializeOffscreenCanvas = function (source, nx, ny) {
  source.offscreenCanvas = new OffscreenCanvas(nx, ny);
  source.ctx = source.offscreenCanvas.getContext('2d');
  // source.ctx.globalAlpha = 1.0;
  source.ctx.fillStyle = "rgb(0,0,0)";
  source.ctx.imageSmoothingEnabled = true;
  source.ctx.globalCompositeOperation = "source-over";
  source.imageData = source.ctx.getImageData(0, 0, nx, ny);
  source.uint8Data = source.imageData.data;
  source.offscreenCanvas.width = nx;
  source.offscreenCanvas.height = ny;
  setAlpha(source, 255);
};

let setAlpha = (source, value) => {
  let i,
    pixeldata = source.uint8Data,
    len = pixeldata.length;

  for (i = 3; i < len; i += 4) {
    pixeldata[i] = value;
  }
};

let copyOffscreenCanvasToMain = function (source, destination) {
  let bitmap = source.offscreenCanvas.transferToImageBitmap();
  destination.ctx.transferFromImageBitmap(bitmap);
};

let copyOffscreenCanvasToPreview = function (source, preview, nx, ny) {
  let aspectRatio = nx / ny;
  let { width, height } = preview.canvas.getBoundingClientRect();
  let sourceAspectRatio = nx / ny;
  let destinationAspectRatio = width / height;
  let resizeWidth, resizeHeight;
  if (destinationAspectRatio >= sourceAspectRatio) {
    resizeHeight = height;
    resizeWidth = height * sourceAspectRatio;
  } else {
    resizeWidth = width;
    resizeHeight = height * sourceAspectRatio;
  }
  let imageData = new ImageData(source.uint8Data, nx, ny);
  let bitmapP2 = createImageBitmap(imageData, 0, 0, nx, ny, { resizeWidth: resizeWidth, resizeHeight: resizeHeight });

  bitmapP2.then(smallbitmap => {
    let { width, height } = preview.canvas.getBoundingClientRect();
    let posx = width / 2 - smallbitmap.width / 2;
    let posy = height / 2 - smallbitmap.height / 2;
    preview.canvas.width = smallbitmap.width;
    preview.canvas.height = smallbitmap.height;
    preview.ctx.drawImage(smallbitmap, 0, 0);
  });
};

let renderOffscreenCanvas = function (source, nx, ny) {
  let startTime = performance.now();
  let rawdata = source.rawdata;
  let pixeldata = source.uint8Data;
  let min = source.min;
  let max = source.max;
  let range = max - min;
  let scale = source.brightness * 256 / range;
  let i, pixindex, ycols, x, y, val, scaledval;

  let renderLinear = () => {
    switch (source.filter) {
    case 'red':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'green':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex + 1] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'blue':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = val * scale - min;
          pixeldata[pixindex + 2] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 3] = pixeldataBlue[i + 2];
      }
      break;
    }
  };

  let renderLog = () => {
    scale = source.brightness * 256 / Math.log(11);
    switch (source.filter) {
    case 'red':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'green':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex + 1] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'blue':
      pixindex = 0;
      for (y = 0; y < ny; y++) {
        for (x = 0; x < nx; x++) {
          i = y * nx + x;
          val = rawdata[i];
          scaledval = Math.log(val + 1) * scale;
          pixeldata[pixindex + 2] = scaledval;
          pixindex += 4;
        }
      }
      break;
    case 'RGB':
      let pixeldataRed = image.sources[0].uint8Data;
      let pixeldataGreen = image.sources[1].uint8Data;
      let pixeldataBlue = image.sources[2].uint8Data;

      let len = pixeldata.length;

      for (i = 0; i < len; i += 4) {
        pixeldata[i] = pixeldataRed[i];
        pixeldata[i + 1] = pixeldataGreen[i + 1];
        pixeldata[i + 3] = pixeldataBlue[i + 2];
      }
      break;
    }
  };

  switch (source.scaling) {
  case 'linear':
    renderLinear();
    break;
  case 'log':
    renderLog();
    break;
  }

  let renderTime = performance.now();
  source.ctx.putImageData(source.imageData, 0, 0);
  let putImageDataTime = performance.now();
  console.log(`renderOffscreenCanvas: name: ${source.name}, filter: ${source.filter}: render: ${roundNumber(renderTime  - startTime, 4)}`);
};

const containsAll = (arr1, arr2) =>
  arr2.every(arr2Item => arr1.includes(arr2Item));

const sameMembers = (arr1, arr2) =>
  containsAll(arr1, arr2) && containsAll(arr2, arr1);

let renderMainLayers = image => {
  let startTime = performance.now();
  let rgbsource = image.sources[3];
  let pixeldata = rgbsource.uint8Data;
  let pixeldataRed = image.sources[0].uint8Data;
  let pixeldataGreen = image.sources[1].uint8Data;
  let pixeldataBlue = image.sources[2].uint8Data;
  let i = 0;
  let len = pixeldataRed.length;

  switch (image.selectedMainLayers) {
  case '000': // No layers
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = 0;
      pixeldata[i + 1] = 0;
      pixeldata[i + 2] = 0;
    }
    break;

  case '100': // Red
    pixeldata.set(pixeldataRed);
    break;

  case '010': // Green
    pixeldata.set(pixeldataGreen);
    break;

  case '001': // Blue
    pixeldata.set(pixeldataBlue);
    break;

  case '110': // Red, Green
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = 0;
    }
    break;

  case '011': // Green, Blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = 0;
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  case '101': // Red, blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = 0;
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  case '111': // Red, Green, Blue
    for (i = 0; i < len; i += 4) {
      pixeldata[i] = pixeldataRed[i];
      pixeldata[i + 1] = pixeldataGreen[i + 1];
      pixeldata[i + 2] = pixeldataBlue[i + 2];
    }
    break;

  }
  let renderTime = performance.now();
  rgbsource.ctx.putImageData(rgbsource.imageData, 0, 0);

  let putImageDataTime = performance.now();
  let bitmap = rgbsource.offscreenCanvas.transferToImageBitmap();
  image.destinations.main.ctx.transferFromImageBitmap(bitmap);
  let transferToImageBitmapTime = performance.now();
  console.log(`renderMainLayers: ${roundNumber(image.selectedMainLayers, 4)}: render: ${roundNumber(renderTime - startTime, 4)}, transferToImageBitmap: ${roundNumber(transferToImageBitmapTime - putImageDataTime, 4)}`);
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

//
// Utilities
//

const forLoopMinMax = (array) => {
  let min = array[0],
    max = array[0];
  for (let i = 1; i < array.length; i++) {
    let value = array[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

const histogram = (array, numbuckets, min, max) => {
  let i, index, val, sval,
    range = max - min,
    bucketSize = range / numbuckets,
    scale = numbuckets / range,
    buckets = Array(numbuckets);

  for (i = 0; i < buckets.length; i++) {
    let bucketStart = roundNumber(i * bucketSize + min, 2);
    buckets[i] = [bucketStart, 0];
  }
  for (i = 0; i < array.length; i++) {
    val = array[i];
    if (val >= min && val <= max) {
      sval = (val - min) * scale;
      index = Math.floor(sval);
      if (index < 0 || index >= numbuckets) {
        // console.log(index);
      } else {
        buckets[index][1] += 1;
      }
    }
  }
  return buckets;
};

let consoleLogHistogram = source => {
  let h = histogram(source.rawdata, 30, source.min, source.max);
  let [min, max] = forLoopMinMax(source.rawdata);
  console.log(`Histogram (raw data): name: ${source.name}, min: ${roundNumber(min, 3)}, max: ${roundNumber(max, 3)}, hmin: ${roundNumber(source.min, 4)}, hmax: ${roundNumber(source.max, 4)}, contrast: ${roundNumber(source.contrast, 4)}`);
  console.table(h);
};

let roundNumber = (value, precision = 1) => {
  return Number(Number.parseFloat(value).toPrecision(precision));
};
