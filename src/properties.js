import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import moment from "moment";
import Select from "ol/interaction/Select";

export default class Properties extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "properties";
    if (!options.html) options.html = '<i class="far fa-th-list fa-fw"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    this.container.setVisible(this.active);
    const evtFunction = (evt) => {
      const select = evt.target;
      const features = select.getFeatures().getArray();
      console.log(features)
    }
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      const select = this.getSelect();
      if (evt.active && select) {
        select.on("select", evtFunction);
      }else {
        select.un("select", evtFunction);
        this.container.setVisible(false);
      }
    });
  }
  getSelect() {
    return this.map
      .getInteractions()
      .getArray()
      .find((x) => x instanceof Select);
  }
}
