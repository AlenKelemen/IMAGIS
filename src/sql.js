import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import GeoJSON from "ol/format/GeoJSON";
import winnow from "winnow";

export default class SQL extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-filter fa-fw"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane sql`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.main = elt("div", { className: `main` });
    this.container.element.appendChild(this.main);
    this.activeLayer = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("active") === true);
    this.map.getLayers().on("change:active", (evt) => (this.activeLayer = evt.target.get("active")));
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      if (evt.active) {
        if (!this.activeLayer) {
          this.main.innerHTML = '<span class="middle">Odaberite aktivni sloj u legendi</span>';
        } else {
          this.main.innerHTML = "";
          this.header = elt("div", { className: "header" }, `SQL upit za odabir u sloju ${this.activeLayer.get("label") || this.activeLayer.get("name") || ""}`);
          this.main.appendChild(this.header);
          this.where = elt("input", { className: "where" });
          this.where.value = "DN > 100";
          this.main.appendChild(this.where);
          this.submit = elt("button", { className: "submit" }, "OK");
          this.main.appendChild(this.submit);
          this.activeSource = this.activeLayer.getSource();
          console.log(this.activeSource.getState());
          const features = this.activeSource.getFeatures();
          console.log(features);
          const f = new GeoJSON().writeFeaturesObject(features);
          const result = winnow.query(f, { where: this.where.value });
          console.log(this.map.select.olSelect.getFeatures(), result);
        }
      }
    });
  }
}
