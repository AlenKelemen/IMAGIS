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
    this.header = elt("div", { className: "header right" });
    this.main = elt("main", { className: `main` }, this.header);
    this.container.element.appendChild(this.main);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.map.getLayers().on("change:active", (evt) => {
      this.setLayer(evt.target.get("active"));
    });
    this.setLayer(
      this.map
        .getLayers()
        .getArray()
        .find((x) => x.get("active") === true)
    );
  }
  setLayer(layer) {
    this.layer = layer;
    if (!layer) {
      this.header.className = "middle";
      this.header.innerHTML = `Odaberite aktivni sloj u legendi`;
    } else {
      this.header.className = "header column";
      this.header.innerHTML = `Pretraga sloja ${layer.get("label") || layer.get("name") || ""}`;
      this.properties();
    }
  }
  properties() {
    if (!this.layer.getSource().get("schema")) return;
    const props = this.layer.getSource().get("schema").properties;
    const plist = elt('select',{className:'search properties'},'Odaberi')
    this.main.appendChild(plist)
    for (prop of props) {
        //plist.add(new Option(prop.label, prop.name));
    }
  }
}
