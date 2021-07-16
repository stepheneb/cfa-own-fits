/*jshint esversion: 6 */
/*global app */

class Spinner {
  constructor(id) {
    this.elem = document.getElementById(id);
    this.count = 0;
  }
  show(mesg) {
    this.elem.classList.remove("hide");
    this.count++;
    this._log("show", `count: ${this.count}, ${mesg}`);
  }
  hide(mesg) {
    if (this.count > 1) {
      this.count--;
      this._log("hide", `count: ${this.count}, ${mesg}`);
    } else {
      this.count = 0;
      this.elem.classList.add("hide");
      this._log("hide", `count: ${this.count}, ${mesg}`);
    }
  }
  cancel(mesg) {
    this.count = 0;
    this.elem.classList.add("hide");
    this._log("cancel", mesg);
  }
  _log(name, mesg) {
    if (app.dev && mesg) {
      console.log(`spinner.${name}: ${mesg}`);
    }
  }
}

export default Spinner;
