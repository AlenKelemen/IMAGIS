import Control from "ol/control/Control";
/** Container for controls
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string} [=div] options.semantic semantic element ['nav','aside','footer','header','section']
 * @param {string} options.className clases to add to control
 * @param {boolean} [=true] options.visible initally visible
 * @param {string[]} options.name control name
 */

export default class Container extends Control {
  constructor(options = {}) {
    super({
      element: document.createElement(options.semantic || "div"),
    });
    this.hiddenClass = options.hiddenClass || "hidden";
    this.element.className = options.className || "container"; // className
    this.setVisible(options.visible === undefined ? true : options.visible);
    this.set("name", options.name);
    this.controls_ = [];
  }
  setVisible(b) {
    // set element visible
    if (b) this.element.classList.remove(this.hiddenClass);
    else {
      for (const c of this.getControls()||[]) {
        if (typeof c.setActive === "function") c.setActive(false);
      }
      this.element.classList.add(this.hiddenClass);
    }
    this.dispatchEvent({
      type: "change:visible",
      key: "visible",
      oldValue: !b,
      visible: b,
    });
  }
  
  getHiddenClass(){
    return this.hiddenClass;
  }
  getVisible() {
    // get element visible
    return !this.element.classList.contains(this.hiddenClass);
  }
  addControl(control) {
    // ad control
    this.controls_.push(control);
    control.setTarget(this.element);
    control.set("parent", this);
    if (this.getMap()) this.getMap().addControl(control);
    return this;
  }
  removeControl(control) {
    this.controls_.splice(
      this.controls_.findIndex((x) => x === control),
      1
    );
    this.getMap().removeControl(control);
  }
  getControls(name) {
    if (name) {
      return this.controls_.find((x) => x.get("name") === name);
    } else return this.controls_;
  }
  /** Get active controls in a container
   * @return {object []} active controls
   */
  getActiveControls() {
    var active = [];
    for (const control of this.controls_) {
      if (control.getActive()) active.push(control);
    }
    return active;
  }
  /** Deactivate all controls in a container
   * @param {_ol_control_} except a control to keep active, if except == undefined all controls are deactivated
   */
  deactivateControls(except) {
    console.log(except)
    for (const control of this.controls_) {
      if (control !== except) {
        if (typeof control.setActive === "function" && control.getActive()) control.setActive(false);
      }
    }
  }
}
