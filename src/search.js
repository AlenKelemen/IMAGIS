import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import { containsExtent } from "ol/extent";

export default class Search extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-search-location"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane theme`,
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
          const header = elt("div", { className: "header" }, `Pretraga sloja ${this.activeLayer.get("label") || this.activeLayer.get("name") || ""}`);
          this.main.appendChild(header);
          const distinct = elt("div", { className: "distinct" });
          this.main.appendChild(distinct);
          this.activeLayer.setVisible(true); //to be loaded!!
          if (!this.activeLayer.getSource().get("schema")) {
            console.log("no schema");
            return;
          }
          const src = this.activeLayer.getSource();
          const select = elt("select", { className: "search properties" }, elt("option", { selected: true, disabled: true }, "Odaberite svojstvo pretraživanja"));
          header.appendChild(select);
          const properties = this.activeLayer.getSource().get("schema").properties;
          for (const p of properties) select.add(new Option(p.Label, p.Name));
          select.addEventListener("change", (evt) => {
            distinct.innerHTML = "";
            const property = evt.target.value;
            const result = [];
            for (const f of src.getFeatures()) {
              const s = result.find((x) => x.property === f.get(property));
              if (!s) {
                result.push({ property: f.get(property), features: [f] });
              } else {
                s.features.push(f);
              }
            }
            console.log(result);
          });
        }
      }
    });
  }
}
