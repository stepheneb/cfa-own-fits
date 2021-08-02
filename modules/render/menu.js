/*jshint esversion: 6 */
/*global app  */

// Activity Menu page

import events from '../events.js';
import router from '../../router.js';
import navigation from './navigation.js';
import checkBrowser from '../check-browser.js';
import Page from '../page.js';
import splash from './splash.js';
import observation from './observation.js';

let renderMenu = {};
let connectLine = null;
let separatorLine = null;

let multiWaveImage = null;
let observationImage = null;
let multiWaveTitle = null;
let menuCategoryObservation = null;

let content = null;
let btnStartOver = null;

let selectedCategoryElement = null;
let selectedCategoryPagesElement = null;
let categoryPagesVisible = false;

let ctype = null;

let menuListeners = [];

renderMenu.page = (categorytype) => {
  ctype = categorytype;
  let renderedCallbacks = [];

  let hash = "menu";
  if (ctype) {
    hash = `menu/${ctype}`;
  }

  let mb_elems = document.getElementsByClassName('modal-backdrop');
  while (mb_elems.length > 0) {
    var mb = mb_elems[0];
    mb.parentNode.removeChild(mb);
  }

  let html = renderMenu.pageHeader();
  html += `
      ${renderMenu.activityCategory()}
      ${renderMenu.activityCategoryPages()}
      ${navigation.menu(renderedCallbacks)}
    `;
  content = document.getElementById("content");
  content.innerHTML = html;
  events.setupGlobal();

  connectLine = document.getElementById('menu-connnect-line');
  separatorLine = document.getElementById('menu-separator-line');

  multiWaveImage = document.getElementById('menu-category-multi-wave-image');
  multiWaveTitle = document.getElementById('menu-activity-multi-wave-title');
  observationImage = document.getElementById('menu-category-observation-image');
  menuCategoryObservation = document.getElementById('menu-category-observation');

  renderMenu.redraw = requestAnimationFrame(() => {
    setTimeout(() => {
      renderMenu.drawSeparatorLine();
    }, 100);
  });

  renderMenu.addMenuListeners(ctype);

  events.setupGlobal();
  checkBrowser();
  splash.hideAll();
  renderedCallbacks.forEach(func => func());

  btnStartOver = document.getElementById('btn-start-over');
  btnStartOver.addEventListener('click', () => {
    splash.showSplash2();
  });

  router.updateHash(hash);
};

//
// remove listeneters and start category activity page
//
renderMenu.startCategoryActivityPage = (ctype, page) => {
  renderMenu.removeMenuListeners();
  app.page = new Page(ctype, page);
};

//
// Manage event listeners
//
renderMenu.removeMenuListeners = () => {
  // let elem, listener;
  menuListeners.forEach(([elem, evt, listener]) => {
    elem.removeEventListener(evt, listener);
  });
};

renderMenu.addMenuListeners = (ctype) => {
  window.addEventListener('resize', renderMenu.drawSeparatorLine);
  menuListeners.push([window, 'resize', renderMenu.drawSeparatorLine]);

  if (ctype) {
    selectedCategoryElement = document.getElementById(`menu-category-${ctype}`);
    setTimeout(() => {
      renderMenu.categoryPages(ctype);
    }, 50);
  }

  //
  // listen for click in tall/expanded category image
  //
  // result:
  //  1. All tall category image/containers contract
  //  2. render container with pages in that category type
  //
  //
  let addMenuCategoryListener = (ctype) => {
    let id = `menu-category-${ctype}`;
    let elem = document.getElementById(id);
    elem.addEventListener('click', listener);
    menuListeners.push([elem, 'click', listener]);

    function listener(e) {
      e.stopPropagation();
      selectedCategoryElement = document.getElementById(`menu-category-${ctype}`);
      renderMenu.categoryPages(ctype);
    }
  };

  app.categories.forEach(c => {
    addMenuCategoryListener(c.type);
  });

  //
  // listen for click in SVG close button in categoryPages
  //
  let addSVGCloseMenuCategoryPagesListener = (ctype) => {
    let id = `svg-close-menu-${ctype}-pages`;
    let elem = document.getElementById(id);
    elem.addEventListener('click', listener);
    menuListeners.push([elem, 'click', listener]);

    function listener(e) {
      e.stopPropagation();
      selectedCategoryElement = document.getElementById(`menu-category-${ctype}`);
      renderMenu.categoryPages(ctype);
    }
  };

  app.categories.forEach(c => {
    addSVGCloseMenuCategoryPagesListener(c.type);
  });

  //
  // Any click/touch event in activity-page container starts page
  //
  let addStartPageListener = (ctype, page) => {
    let id = `open-page-${ctype}-${page.name}`;
    let elem = document.getElementById(id);
    elem.addEventListener('click', listener);
    menuListeners.push([elem, 'click', listener]);

    function listener(e) {
      e.stopPropagation();
      connectLine.classList.remove('show');
      separatorLine.classList.remove('show');
      categoryPagesVisible = false;
      renderMenu.startCategoryActivityPage(ctype, page);
    }
  };

  app.categories.forEach((category) => {
    category.pages.forEach((page) => {
      addStartPageListener(category.type, page);
    });
  });

  //
  // If category page visible any click in that gets to body
  // closes category pages container
  //
  let addMenuBodyListener = () => {
    let elem = document.body;
    elem.addEventListener('click', listener);
    menuListeners.push([elem, 'click', listener]);

    function listener() {
      let selectedCategories = document.getElementsByClassName('category selected');
      if (selectedCategories.length > 0) {
        selectedCategoryElement = selectedCategories[0];
        renderMenu.categoryPages(ctype);
      }
    }
  };

  addMenuBodyListener(ctype);
};

//
// Component rendering
//
renderMenu.pageHeader = () => {
  return `
    <div class='row menu-page-header'>
      <div class='col-8'>
        <div class='title'>${app.title}</div>
        <div class='subtitle'>${app.subtitle}</div>
      </div>
    </div>
  `;
};

renderMenu.activityCategory = () => {
  let html = `
      <div class="row activity-category-menu">
    `;
  let categories = app.categories;
  let categoryCount = categories.length;
  for (var i = 0; i < categoryCount; i++) {
    let category = categories[i];
    let type = category.type;
    html += `
        <div class="category col"  id="menu-category-${type}" data-num="${i}">
          <img src="${category.menuimage}"  id="menu-category-${type}-image"></img>
          <div id="menu-activity-${type}-title" class="menu-activity-category-title">
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

//
// render container with pages in that category type
//
renderMenu.categoryPages = () => {
  var elem, category, categoryPagesElement;
  let hash = "";
  let categories = app.categories;
  //
  // if category pages container visible ...
  if (selectedCategoryElement.classList.contains("selected")) {
    // remove selected and not-selected classes from all category containers
    for (category of categories) {
      elem = document.getElementById(`menu-category-${category.type}`);
      elem.classList.remove("selected", "not-selected");
      elem.removeEventListener("transitionend", renderMenu.transitionListener);
      categoryPagesElement = document.getElementById(`menu-category-${category.type}-pages`);
      categoryPagesElement.classList.remove("selected");
      connectLine.classList.remove('show');
      categoryPagesVisible = false;
      renderMenu.drawSeparatorLine();
      hash = `menu`;
    }
  } else {
    // else make category pages container visible and contract all category containers
    for (category of categories) {
      elem = document.getElementById(`menu-category-${category.type}`);
      categoryPagesElement = document.getElementById(`menu-category-${category.type}-pages`);
      if (elem == selectedCategoryElement) {
        // display selected category pages container and redraw connecting if necessary
        selectedCategoryPagesElement = categoryPagesElement;
        elem.classList.add("selected");
        elem.classList.remove("not-selected");
        categoryPagesElement.classList.add("selected");
        if (categoryPagesVisible) {
          renderMenu.drawCategoryLine(selectedCategoryElement, selectedCategoryPagesElement);
        } else {
          selectedCategoryElement.addEventListener("transitionend", renderMenu.transitionListener);
          categoryPagesVisible = true;
        }
        hash = `menu/${category.type}`;
      } else {
        // hide other category page containers
        elem.classList.add("not-selected");
        elem.classList.remove("selected");
        categoryPagesElement.classList.remove("selected");
      }
    }
    renderMenu.drawSeparatorLine();
  }
  router.updateHash(hash);
};

renderMenu.transitionListener = () => {
  renderMenu.drawCategoryLine(selectedCategoryElement, selectedCategoryPagesElement);
};

renderMenu.drawSeparatorLine = () => {
  let expanded = true;
  separatorLine.classList.add('show');
  let x1, x2, y1, y2;
  if (menuCategoryObservation.classList.contains('not-selected') || menuCategoryObservation.classList.contains('selected')) {
    expanded = false;
  }
  let boundingRect1 = multiWaveImage.getBoundingClientRect();
  let boundingRect2 = observationImage.getBoundingClientRect();
  let boundingRect3 = multiWaveTitle.getBoundingClientRect();
  let xshift = (boundingRect2.left - boundingRect1.right) / 2;
  let yextend = (boundingRect1.bottom - boundingRect1.top) * 0.07;
  x1 = boundingRect1.right + xshift;
  x2 = x1;

  if (expanded) {
    y1 = boundingRect3.bottom + yextend;
    y2 = boundingRect2.top - yextend;
  } else {
    y1 = boundingRect2.top - yextend + document.body.clientHeight * 0.005;
    y2 = y1 + document.body.clientHeight * 0.25;
  }
  separatorLine.setAttribute('x1', x1);
  separatorLine.setAttribute('y1', y1);
  separatorLine.setAttribute('x2', x2);
  separatorLine.setAttribute('y2', y2);
};

renderMenu.drawCategoryLine = (fromElem, toElem) => {
  if (fromElem.classList.contains("selected")) {
    let boundingRect1 = fromElem.getBoundingClientRect();
    let boundingRect2 = toElem.getBoundingClientRect();
    let x1 = boundingRect1.left + boundingRect1.width / 2;
    let x2 = x1;
    let y1 = boundingRect1.bottom;
    let y2 = boundingRect2.top;
    connectLine.setAttribute('x1', x1);
    connectLine.setAttribute('y1', y1);
    connectLine.setAttribute('x2', x2);
    connectLine.setAttribute('y2', y2);
    connectLine.classList.add('show');
  } else {
    connectLine.classList.remove('show');
  }
};

renderMenu.activityCategoryPages = () => {
  let html = `
      <div class="d-flex flex-row activity-category-pages">
  `;
  app.categories.forEach((category) => {
    let type = category.type;
    let id = `menu-category-${type}-pages`;
    let svgCloseId = `svg-close-menu-${type}-pages`;
    let title = category.title;
    let subtitle = category.subtitle;
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
          <div class="action">${category.action}</div>

        </div>
        <div class="body">
          ${renderMenu.categoryPageCollection(category)}
        </div>
      </div>
    `;
  });
  html += `
    </div>
  `;
  return html;
};

renderMenu.categoryPageCollection = category => {
  let html = '';
  let telescopes = '';
  let type = category.type;
  category.pages.forEach((page) => {
    var id = `open-page-${category.type}-${page.name}`;
    if (category.type !== "observation") {
      telescopes = getTelescopes(page).map(telescope => telescope.name).join(", ");
      html += `
        <div id="${id}" class="menu-category-page">
          <div class="image-wrapper">
            <img src="images/page-images/${type}-${page.poster}.jpg"></img>
          </div>
          <div class="name">${page.title}</div>
          <div class="telescope">${telescopes}</div>
        </div>
      `;
    } else {
      let hide = 'hide';
      if (observation.active(page)) {
        hide = '';
      }
      html += `
          <div id="${id}" class="menu-category-page  ${hide}">
            <div class="image-wrapper">
              <img src="${page.poster}"></img>
            </div>
            <div class="name">${page.title}</div>
          </div>
        `;
    }
  });
  return html;
};

function getTelescopes(page) {
  let telescopes = [];
  page.image.about.telescopes.forEach(tkey => {
    telescopes.push(app.telescopeData.telescopes.find(t => t.key == tkey));
  });
  return telescopes;
}

export default renderMenu;
