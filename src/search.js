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
    this.propertiesList = elt("select", { className: "search properties" }, elt("option", { selected: true, disabled: true }, "Odaberite svojstvo za pretragu"));
    this.header = elt("div", { className: "header right" });
    this.main = elt("main", { className: `main` }, this.header);
    this.container.element.appendChild(this.main);
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      if (evt.active) {
        const activeLayer = this.map
          .getLayers()
          .getArray()
          .find((x) => x.get("active") === true);

          console.log(activeLayer.get('name'))
        if (!activeLayer) {
          this.header.className = "middle";
          this.header.innerHTML = `Odaberite aktivni sloj u legendi`;
        } else {
          this.header.className = "header column";
          this.header.innerHTML = `Pretraga sloja ${activeLayer.get("label") || activeLayer.get("name") || ""}`;
          this.header.appendChild(this.propertiesList);
          if (!activeLayer.getSource().get("schema")) {
            console.log("no schema");
            return;
          }
          const properties = activeLayer.getSource().get("schema").properties;
          for (const p of properties) this.propertiesList.add(new Option(p.Label, p.Name));
          this.propertiesList.addEventListener("change", (evt) => {
            activeLayer.setVisible(true); //to be loaded!!
            const src = activeLayer.getSource();
            src.once("change", (evt) => {
              if (src.getState() === "ready") {
                console.log(src.getFeatures())
              }
            });
          });
        }
      }
    });
  }
}
