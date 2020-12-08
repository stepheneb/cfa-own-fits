/*jshint esversion: 6 */

// Test for browser features

let checkBrowser = () => {
  if (typeof OffscreenCanvas != "function") {
    alert("This browser doesn't support the OffscreenCanvas() function. \nPlease try again with Chrome, Edge or Opera.");
    return false;
  } else {
    return true;
  }
};

export default checkBrowser;
