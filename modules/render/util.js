/*jshint esversion: 6 */

// modules/render/util

/*jshint esversion: 6 */

let renderUtil = {};

renderUtil.getSelectedSource = page => {
  return page.image.sources[page.image.selectedSource];
};

renderUtil.getTelescopes = page => {
  let telescopes = [];
  page.image.about.telescopes.forEach(tkey => {
    telescopes.push(app.telescopeData.telescopes.find(t => t.key == tkey));
  });
  return telescopes;
};

export default renderUtil;
