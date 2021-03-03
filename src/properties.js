import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Select from "ol/interaction/Select";

export default class Properties extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle"; //
    if (!options.html) options.html = '<i class="far fa-th-list fa-fw"></i>'; //
    super(options);
    this.readOnly = options.readOnly; //
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container); //options.target (defines map also)
    //header
    this.header = elt("div", { className: "header center" }, "Postavke");
    //main
    this.main = elt("main", { className: `main` }, this.header);
    this.container.element.appendChild(this.main);
    //main content wrapper
    this.wrapper = elt("div", { className: "wrapper" });
    this.main.appendChild(this.wrapper);
    //footer
    this.footer = elt("div", { className: "footer center" }, "Pogledaj postavke");
    this.main.appendChild(this.footer);
    //ol/map
    this.map = this.container.getMap();
    //select depended display of wrapper && visibility on click
    this.container.setVisible(this.active);
    const onSelect = (evt) => this.wrapperSelect(evt.target);
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      const select = this.map
        .getInteractions(select)
        .getArray()
        .find((x) => x instanceof Select);
      if (evt.active && select) {
        this.wrapperSelect(select);
        select.on("select", onSelect);
      } else select.un("select", onSelect);
    });
  }

  //this.wrapper example select depended display
  wrapperSelect(select) {
    if (!select) return;
    const features = select.getFeatures().getArray();
    this.wrapper.innerHTML = features.length === 0 ? '<div class="middle-center">Ništa nije odabrano</div>' : "";
    const item = [];
    for (const f of features) {
      const l = f.get("layer");
      if (l) {
        if (item.find((x) => x.layer === l)) {
          item.find((x) => x.layer === l).features.push(f);
        } else {
          item.push({
            layer: l,
            features: [f],
          });
        }
      }
    }
    for (const [index, i] of item.entries()) {
      const ld = document.createElement("div"); //layer div
      ld.className = "layer";
      ld.innerHTML = `
              <div class="layer-header"><i class="far fa-plus"></i> ${i.layer.get("label") || i.layer.get("name")} (${i.features.length})</div>
          `;
      this.wrapper.appendChild(ld);
      const content = document.createElement("div");
      content.className = "items";
      if (index === 0) {
        //show only first layer items...
        content.style.display = "block";
        ld.querySelector("i").className = "far fa-minus";
      } else {
        content.style.display = "none";
        ld.querySelector("i").className = "far fa-plus";
      }
      ld.querySelector("i").addEventListener("click", (evt) => {
        const e = evt.currentTarget;
        content.style.display = content.style.display === "none" ? "block" : "none";
        e.className = content.style.display === "none" ? "far fa-plus" : "far fa-minus";
      });
      ld.appendChild(content);
      this.table(i.layer, i.features, content);
    }
  }
  table(layer, features, element) {
    //creates feature table
    if (!layer.getSource().get("schema")) {
      console.log("no schema");
      return;
    }
    let props = []; //consolidated props
    console.log(layer,features,element);
    for (const f of features) {
      for (const key of f.getKeys()) {
        if (key !== f.getGeometryName() && props.find((x) => x.Name === key) === undefined){
          const prop = layer.getSource().get('schema').properties.find(x => x.Name === key); //only props defined in schema
          console.log(layer.getSource().get('schema').properties)
        }
      }
    }
  }
}
