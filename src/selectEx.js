import Control from "ol/control/Control";
import Container from "./container";
import Toggle from "./toggle";

/** extended select interactions
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 */

export default class SelectEx extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({
      semantic: "nav",
      className: options.contanerClassName,
    });
    options.target.addControl(this.container);
    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else {
        this.container.element.classList.remove("active");
        this.container.deactivateControls();
      }
    });

    this.line = new Toggle({
      className: "select-line",
      html: '<i class="far fa-heart-rate"></i>',
      tipLabel: "Odaberi objekte koji sijeku nacrtanu liniju",
    });
    this.container.addControl(this.line);
  }
}
