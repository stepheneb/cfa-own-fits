/*jshint esversion: 6 */

// Activity Menu page

import events from '../events.js';
import checkBrowser from '../checkBrowser.js';
import splash from './splash.js';
import renderActivity from './activity.js';
import renderDev from './dev.js';
import renderUtil from './util.js';

let renderMenu = {};

renderMenu.page = (category) => {
  let hash = "menu";
  if (category) {
    hash = `menu/${category.type}`;
  }

  let html = renderMenu.pageHeader();
  html += `
      <div class="activity-category-menu">
        ${renderMenu.activityCategory()}
      </div>

      ${renderMenu.activityCategoryPages()}

      ${renderMenu.buttons()}
    `;
  document.getElementById("content").innerHTML = html;
  events.setupGlobal();

  if (category) {
    renderMenu.categoryPages(category);
  }

  let addMenuCategoryListener = (category) => {
    let id = `menu-category-${category.type}`;
    document.getElementById(id).addEventListener('click', event => {
      renderMenu.categoryPages(category);
    });
  };

  app.categories.forEach(addMenuCategoryListener);

  let addSVGCloseMenuCategoryPagesListener = (category) => {
    let id = `svg-close-menu-${category.type}-pages`;
    document.getElementById(id).addEventListener('click', event => {
      renderMenu.categoryPages(category);
    });
  };

  app.categories.forEach(addSVGCloseMenuCategoryPagesListener);

  let addStartPageListener = (category, page) => {
    let id = `open-page-${category.type}-${page.name}`;
    document.getElementById(id).addEventListener('click', event => {
      renderActivity.page(category, page);
    });
  };

  app.categories.forEach((category) => {
    category.pages.forEach((page) => {
      addStartPageListener(category, page);
    });
  });

  events.setupGlobal();
  checkBrowser();
  splash.hide();
  app.hashRendered = hash;
  window.location.hash = hash;
};

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

renderMenu.categoryPages = (category) => {
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

renderMenu.activityCategoryPages = () => {
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
          ${renderMenu.categoryPageCollection(category)}
        </div>
      </div>
    `;
  });
  return html;
};

renderMenu.categoryPageCollection = category => {
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

renderMenu.buttons = () => {
  return `
    <div class="page-navigation fixed-bottom d-flex flex-row justify-content-start">
      ${renderDev.fullScreenButton()}
    </div>
  `;
};

export default renderMenu;
