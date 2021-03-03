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
    this.onChange = options.onChange || function (evt) {console.log(evt)} //
    this.container = new Container({
      semantic: "section",
      className: `taskpane properties`,
    });
    options.target.addControl(this.container); //options.target (defines map also)
    //main
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    //main content wrapper
    this.wrapper = elt("div", { className: "wrapper" });
    this.main.appendChild(this.wrapper);
    //footer
    this.footer = elt("div", { className: "footer" }, "Postavke...");
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

  //this.wrapper select depended display
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
    for (const f of features) {
      for (const key of f.getKeys()) {
        if (key !== f.getGeometryName() && props.find((x) => x.Name === key) === undefined) {
          const prop = layer
            .getSource()
            .get("schema")
            .properties.find((x) => x.Name === key); //only props defined in schema
          if (prop) props.push(prop);
          if (props.length > 0) props[props.length - 1].values = [];
        }
      }
    }
    for (const f of features) {
      for (const p of props) {
        if (p.values.indexOf(f.get(p.Name)) === -1) {
          p.values.push(f.get(p.Name));
        }
      }
    }
    props = props.filter((x) => x.Hidden !== true); //in layer.def.source.schema.properties hiden properties can be defined
    for (const p of props) {
      const div = document.createElement("div"),
        label = document.createElement("label");
      let input = document.createElement("input");
      div.className = "item";
      input.className = "input";
      if (p.Constrains && !this.readOnly) {
        input = document.createElement("select");
        input.className = "input";
        for (const constrain of p.Constrains) {
          const option = document.createElement("option");
          option.value = constrain;
          option.innerHTML = constrain;
          input.appendChild(option);
        }
        if (p.values.length > 1) input.options[input.options.length] = new Option("*VARIRA*", "*VARIRA*");
      }
      label.innerText = p.Label || p.Name;
      input.value = p.values.length > 1 ? "*VARIRA*" : p.values[0];
      input.id = layer.get("name") + ":" + p.Name; // id = property name
      input.dataset.source = layer.getSource().get('name');
      input.dataset.key = p.Name;
      input.disabled = this.readOnly;
      div.appendChild(label);
      div.appendChild(input);
      element.appendChild(div);
      switch (p.DataType) {
        case undefined || null || 0 || "":
          console.log('dataType: undefined ||null||0||"" for:' + input.id);
          break;
        case 1: //boolean
          input.setAttribute("type", "checkbox");
          input.className = "w3-check w3-border input";
          if (item.values.length > 1) {
            input.indeterminate = true;
          } else {
            input.checked = item.values[0];
          }
          break;
        case 3: //datetime
          input.placeholder = "YYYY-MM-DD HH:mm:ss";
          input.addEventListener("focus", (evt) => {
            input.oldValue = evt.target.value;
          });
          input.addEventListener("change", (evt) => {
            let value = evt.target.value;
            if (value == "") return;
            let momentValue = moment(value, "YYYY-MM-DD HH:mm:ss");
            evt.target.value = momentValue.isValid() ? momentValue.format("YYYY-MM-DD HH:mm:ss") : input.oldValue;
          });
          break;
        case 6:
        case 7:
        case 8: // integer
          input.placeholder = "cijeli broj";
          input.addEventListener("focus", (evt) => {
            input.oldValue = evt.target.value;
          });
          input.addEventListener("change", (evt) => {
            evt.target.value = isNaN(parseInt(evt.target.value, 10)) ? input.oldValue : parseInt(evt.target.value, 10);
          });
          break;
        case 4:
        case 5:
        case 15: //float
          input.placeholder = "decimalni broj";
          input.addEventListener("focus", (evt) => {
            input.oldValue = evt.target.value;
          });
          input.addEventListener("change", (evt) => {
            evt.target.value = isNaN(parseFloat(evt.target.value, 10)) ? input.oldValue : parseFloat(evt.target.value, 10);
          });
          break;
        case 9: //string
          break;
        default: //geometry
      }
      if (input.tagName === "INPUT") input.addEventListener("change", (evt) => this.onChange.call(this, evt));
      if (input.tagName === "SELECT") input.addEventListener("change", (evt) => this.onChange.call(this, evt));
    }
  }
}
