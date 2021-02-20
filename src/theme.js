import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";

export default class Theme extends Toggle {
    constructor(options = {}) {
      if (!options.className) options.className = "toggle";
      if (!options.html) options.html = '<i class="far fa-images fa-fw"></i>';
      super(options);
      this.container = new Container({
        semantic: "section",
        className: `taskpane no-header`,
      });
      options.target.addControl(this.container);
      this.map = this.container.getMap();
      this.container.setVisible(this.active);
      this.on("change:active", (evt) => this.container.setVisible(evt.active));
      this.main = elt("main", { className: `main` });
      this.container.element.appendChild(this.main);
    }
}