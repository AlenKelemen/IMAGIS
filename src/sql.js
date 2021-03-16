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
          this.activeSource = this.activeLayer.getSource();
          this.main.innerHTML = "";
          const qb = this.queryBuilder();
          this.main.appendChild(qb);
        }
      }
    });
  }
  queryBuilder() {
    const sql = "";
    const btnOR = elt("button", { onclick: (evt) => btnAND.classList.toggle("active") },'OR');
    const btnAND = elt("button", { className: "active", onclick: (evt) => btnOR.classList.toggle("active") },'AND');
    const conditions = elt("span", { className: "conditions" }, btnAND, btnOR);
    const addRule = elt("button", { className: "add-rule",onclick:(evt)=> {this.queryGroup()} },'+');
    const rules =elt("span", { className: "rules" }, addRule);
    const header = elt("div", { className: "header" }, conditions, rules);
    const basic = elt("div", { className: "query-builder" }, header);
    return basic;
  }
  queryGroup() {
    const basicGroup = elt("div", { className: "rules-group-container" });
    console.log('add query group')
  }
}
