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
      this.activeSource = this.activeLayer.getSource();
      this.container.setVisible(evt.active);
      if (evt.active) {
        if (!this.activeLayer) {
          this.main.innerHTML = '<span class="middle">Odaberite aktivni sloj u legendi</span>';
        } else {
          this.main.innerHTML = "";
          this.header = elt("div", { className: "header" }, `SQL upit za odabir u sloju ${this.activeLayer.get("label") || this.activeLayer.get("name") || ""}`);
          this.main.appendChild(this.header);
          this.main.appendChild(this.rule(this.activeSource));
          this.where = elt("input", { className: "where" });
          this.where.value = "DN > 100";
          this.main.appendChild(this.where);
          this.submit = elt("button", { className: "submit" }, "OK");
          this.main.appendChild(this.submit);
          const features = this.activeSource.getFeatures();
          const f = new GeoJSON().writeFeaturesObject(features);
          this.submit.addEventListener("click", (evt) => {
            this.select = this.map.select.olSelect;
            this.select.getFeatures().clear();
            this.select.dispatchEvent("select");
            try {
              const result = winnow.query(f, { where: this.where.value });
              console.log(result);
              for (const f of result.features) {
                this.select.getFeatures().push(this.activeSource.getFeatureById(f.properties.objectId));
                this.select.dispatchEvent("select");
              }
            } catch (e) {
              console.log(e);
              this.where.value = "";
            }
          });
        }
      }
    });
  }
  rule(source) {
    const v=elt("input", {type:'text'});
    const sp = elt("select", {});
    for (const p of source.get("schema").properties) sp.add(new Option(p.Label, p.Name));
    const so = elt("select", {});
    const options = [
      { type: [1, 3, 4, 5, 6, 7, 8, 9], label: "jednako", operator: "=" },
      { type: [1, 3, 4, 5, 6, 7, 8, 9], label: "različito", operator: "<>" },
      { type: [4, 5, 6, 7, 8], label: "veće", operator: ">" },
      { type: [4, 5, 6, 7, 8], label: "manje", operator: "<" },
      { type: [9], label: "poput", operator: "LIKE" },
    ];
    sp.addEventListener("change", (evt) => {
      so.length=0;
      const dt = source.get("schema").properties.find((x) => x.Name === evt.target.value).DataType;
      options.filter((x) => x.type.includes(dt)).map((x) => so.add(new Option(x.label, x.operator)));
    });
    sp.dispatchEvent(new Event('change'));
    const container = elt("div", { className: "rule" }, sp,so,v);
    return container;
  }
}
