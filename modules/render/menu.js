/*jshint esversion: 6 */
/*global app  */

// Activity Menu page

import events from '../events.js';
import router from '../../router.js';
import navigation from './navigation.js';
import checkBrowser from '../check-browser.js';
import Page from '../page.js';
import splash from './splash.js';

let renderMenu = {};

renderMenu.page = (ctype) => {
  let renderedCallbacks = [];

  let hash = "menu";
  if (ctype) {
    hash = `menu/${ctype}`;
  }

  let html = renderMenu.pageHeader();
  html += `
      <div class="activity-category-menu">
        ${renderMenu.activityCategory()}
      </div>

      ${renderMenu.activityCategoryPages()}

      ${navigation.menu(renderedCallbacks)}
    `;
  document.getElementById("content").innerHTML = html;
  events.setupGlobal();

  if (ctype) {
    renderMenu.categoryPages(ctype);
  }

  let addMenuCategoryListener = (ctype) => {
    let id = `menu-category-${ctype}`;
    document.getElementById(id).addEventListener('click', () => {
      renderMenu.categoryPages(ctype);
    });
  };

  app.categories.forEach(c => {
    addMenuCategoryListener(c.type);
  });

  let addSVGCloseMenuCategoryPagesListener = (ctype) => {
    let id = `svg-close-menu-${ctype}-pages`;
    document.getElementById(id).addEventListener('click', () => {
      renderMenu.categoryPages(ctype);
    });
  };

  app.categories.forEach(c => {
    addSVGCloseMenuCategoryPagesListener(c.type);
  });

  let addStartPageListener = (ctype, page) => {
    let id = `open-page-${ctype}-${page.name}`;
    document.getElementById(id).addEventListener('click', () => {
      app.page = new Page(ctype, page);
    });
  };

  app.categories.forEach((category) => {
    category.pages.forEach((page) => {
      addStartPageListener(category.type, page);
    });
  });

  events.setupGlobal();
  checkBrowser();
  splash.hide();
  renderedCallbacks.forEach(func => func());
  router.updateHash(hash);
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

renderMenu.categoryPages = (ctype) => {
  var elem, category, categoryPagesElement;
  let hash = "";
  let categories = app.categories;
  let selectedCategoryElement = document.getElementById(`menu-category-${ctype}`);
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
  router.updateHash(hash);
};

renderMenu.activityCategoryPages = () => {
  let html = '';
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
  let telescopes = '';
  let type = category.type;
  category.pages.forEach((page) => {
    var id = `open-page-${category.type}-${page.name}`;
    telescopes = getTelescopes(page).map(telescope => telescope.name).join(", ");
    html += `
      <div id="${id}" class="menu-category-page">
        <div class="image-wrapper">
          <img src="images/page-images/${type}-${page.poster}.jpg"></img>
        </div>
        <div class="name">${page.image.name}</div>
        <div class="telescope">${telescopes}</div>
      </div>
    `;
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
