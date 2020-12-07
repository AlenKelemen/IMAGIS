import Control from "ol/control/Control";
import olSelect from "ol/interaction/Select";
import Container from "./container";
import Toggle from "./toggle";

export default class Select extends olSelect {
  constructor(options = {}) {
    super({
      hitTolerance: 2,
      multi: true // A boolean that determines if the default behaviour should select only single features or all (overlapping) features
    });
    this.setActive(options.active || false); // innitial
  }
  addUI(control, options = {}) {
    this.ui = new Container({
      className: options.className || "ol-control select"
    });
    control.addControl(this.ui);
    this.point = new Toggle({
      className: options.point.className || "select-point",
      html: options.point.html || '<i class="far fa-mouse-pointer"></i>',
      tipLabel: options.point.title || "Odaberi objekte",
      handleClick: () => this.setActive(this.point.getActive())
    });
    this.ui.addControl(this.point);
  }
  addInfo(control, options) {
    this.info = new Control({
      element: document.createElement("span")
    });
    this.info.element.className =
      options.className || "select-info";
    this.info.element.innerHTML = "Odabrano: 0";
    this.on("select", evt => {
      this.info.element.innerHTML =
        "Odabrano: " + evt.target.getFeatures().getLength();
    });
    control.addControl(this.info);
  }
}
