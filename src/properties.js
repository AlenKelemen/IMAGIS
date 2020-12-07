import Control from "ol/control/Control";

/** Properties
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string} options.className
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 
 */
export default class Legend extends Control {
  constructor(options = {}) {
    super({
      element: document.createElement("button")
    });
    this.element.className = options.className; //
    this.element.innerHTML = options.html; //
    this.element.title = options.tipLabel; //
  }
}