/*jshint esversion: 6 */
/*global app  */

// router

import renderMenu from './modules/render/menu.js';
import Page from './modules/page.js';
import splash from './modules/render/splash.js';

let router = {};

router.route = () => {
  [router.path, router.props] = router.getHash(window.location.hash);
  if (router.path.action) {
    let category = app.categories.find(c => c.type == router.path.category);
    let page = null;
    if (category) {
      page = category.pages.find(p => p.name == router.path.page);
    }
    switch (router.path.action) {
    case "menu":
      if (category) {
        renderMenu.page(category.type);
      } else {
        renderMenu.page();
      }
      break;
    case "run":
      if (category && page) {
        if (app.page) page.close();
        app.page = new Page(category.type, page);
      } else {
        router.updateHash('menu');
        renderMenu.page();
      }
      break;
    default:
      splash.show();
    }
  } else {
    splash.show();
  }
};

router.getHash = (hashStr) => {
  let path = {
    action: undefined,
    category: undefined,
    page: undefined
  };
  let props = new URLSearchParams();
  let match = hashStr.match(/#(?<hash>[\w-/]+)(\?(?<search>.*$))?/);
  if (match && match.groups) {
    [path.action, path.category, path.page] = match.groups.hash.split('/');
    props = new URLSearchParams(match.groups.search);
  }
  return [path, props];
};

router.updateHash = h => {
  if (h.charAt(0) != '#') {
    h = '#' + h;
  }
  let search = "";
  let hash = h + search;
  app.hashRendered = hash;
  if (hash != window.location.hash) {
    window.location.hash = hash;
  }
  return hash;
};

router.addHashChangeListener = () => {
  window.addEventListener('hashchange', () => {
    if (window.location.hash != app.hashRendered) {
      router.route();
    }
  });
};

export default router;
