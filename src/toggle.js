import Control from "ol/control/Control";
/** Toggle button: have active/inactive state, in navbar only one toggle can be in active state
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {string[]} options.className css clases to add to control
 *  @param {string[]} options.classNameDisabled css clases to add to control when disabled
 *	@param {string} options.tipLabel html title of the control
 *	@param {boolean=false} options.disabled control disabled, default false
 *	@param {string} options.html html to insert in the control
 *	@param {boolean=false} options.active toggle control active, default false
 *	@param {function} options.handleClick callback when control is clicked
 */
export default class Toggle extends Control {
  constructor(options = {}) {
    const e = document.createElement("button");
    super({
      element: e,
    });
    this.activeClass = options.activeClass;
    if (options.className) e.className = options.className;
    e.innerHTML = options.html || "";
    if (options.tipLabel) e.title = options.tipLabel;
    this.set("name", options.name || "toggle");
    if (options.active === undefined) options.active = false;
    this.setActive(options.active);
    const evtFunction = (evt) => {
      if (this.getParent()) this.getParent().deactivateControls(this); //Deactivate all toggles in a container where is toggle
      if (evt && evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
        this.setActive(!this.getActive());
        if (options.handleClick) options.handleClick.call(this, this.getActive());
      }
    };
    e.addEventListener("click", evtFunction);
  }
  /**
   * Parent control (navbar)
   * @return {bool}.
   */
  getParent() {
    if (this.get("parent")) return this.get("parent");
  }
  /** Change control state
   * @param {bool} b activate or deactivate the control, default false
   * @param {bool} silent activate or deactivate the control without trigger change:active event, default false
   */
  setActive(b, silent = false) {
    if (this.getActive() == b) return;
    if (b) this.element.classList.add(this.activeClass);
    else this.element.classList.remove(this.activeClass);
    if (!silent) {
      this.dispatchEvent({
        type: "change:active",
        key: "active",
        oldValue: !b,
        active: b,
      });
    }
  }
  /**
   * Test if the control is active.
   * @return {bool}.
   */
  getActive() {
    return this.element.classList.contains(this.activeClass);
  }
  /**
   * Set control inner HTML.
   * @param {String} html inner html
   */
  setHTML(html) {
    this.element.innerHTML = html;
  }
  /**
   * Get control inner HTML.
   * @returns {string} inner HTML
   */
  getHTML() {
    return this.element.innerHTML;
  }
  getDisabled() {
    return this.element.style.pointerEvents === "none";
  }
  setDisabled(b) {
    this.element.style.pointerEvents = b ? "none" : null;
    if (b) this.element.classList.add(this.classNameDisabled);
    else this.element.classList.remove(this.classNameDisabled);
    this.dispatchEvent({
      type: "change:disabled",
      key: "disabled",
      oldValue: !b,
      disabled: b,
    });
  }
}
