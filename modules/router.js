/*jshint esversion: 6 */

// router

import renderMenu from './render/menu.js';
import renderActivity from './render/activity.js';
import splash from './render/splash.js';

let router = {};

router.route = () => {
  [router.path, router.props] = router.getHash(window.location.hash);
  if (router.path.action) {
    let category = app.categories.find(c => c.type == router.path.category);
    let page = null;
    if (category) {
      page = category.pages.find(p => p.name == router.path.name);
    }
    switch (router.path.action) {
    case "menu":
      if (category) {
        renderMenu.page(category);
      } else {
        renderMenu.page();
      }
      break;
    case "run":
      if (category && page) {
        renderActivity.page(category, page);
      } {
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

router.pageRendered = mesg => {
  // setHash('');

};

router.setHash = h => {
  let search = "?dev=1";
  let hash = h + search;
  app.hashRendered = hash;
  window.location.hash = hash;
  return hash;
};

router.addHashChangeListener = () => {
  window.addEventListener('hashchange', event => {
    if (window.location.hash != app.hashRendered) {
      router.route();
    }
  });
};

export default router;
