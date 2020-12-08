/*jshint esversion: 6 */

// modules/render/util

/*jshint esversion: 6 */

let renderUtil = {};

renderUtil.getSelectedSource = page => {
  return page.image.sources[page.image.selectedSource];
};

export default renderUtil;
