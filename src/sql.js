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
          /* const ps = this.propertySelector(this.activeSource);
          ps.addEventListener("change", (evt) => this.operatorSelector(evt.target.value));
          this.main.appendChild(ps); */
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
  rule(source){
    const sp = elt("select", {}, elt("option", { disabled: true, selected: true }, "Odaberi svojstvo"));
    for (const p of source.get("schema").properties) s.add(new Option(p.Label, p.Name));
    sp.addEventListener('change', evt =>{
      
    })

    const e = elt("div", { className: "property-selector" }, sp);
  }
  operatorSelector(property) {
    const s = elt("select", {}, elt("option", { disabled: true, selected: true }, "Odaberi operator"));
    const e = elt("div", { className: "operator-selector" }, s);
    for (const o of [
      { Label: "jedanko", Name: "=" },
      { Label: "različito", Name: "<>" },
      { Label: "poput", Name: "LIKE" },
    ])
      s.add(new Option(o.Label, o.Name));
    console.log(e);
    return e;
  }
}
