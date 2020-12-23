import Control from "ol/control/Control";
/** Select Info
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {ol/interaction/select} options.select select interaction to monitor
 *	@param {string} options.className css clases to add to control
 *	@param {string} options.tipLabel html title of the control
 */
export default class SelectInfo extends Control {
  constructor(options = {}) {
    super({ element: document.createElement("span") });
    this.select=options.select;
    if (options.className) this.element.className = options.className;
    this.element.innerHTML = "Odabrano: 0";
    if (options.tipLabel) this.element.title = options.tipLabel;
    this.select.on('select', evt => {
      this.element.innerHTML =
        "Odabrano: " + evt.target.getFeatures().getLength();
    })
  }
}
