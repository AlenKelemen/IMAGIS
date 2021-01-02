import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import moment from "moment";
/** Feature property info/edit sidebar
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string} options.className Control.element class name
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html string to insert in the control
 * @param {Object} options.select ol/interaction/Select
 * @param {boolean} [options.readOnly = true] ol/interaction/Select
 * @param {Object} options.target target Container
 */

export default class Properties extends Toggle {
  constructor(options = {}) {
    super(options);
    this.def = options.def;
    this.select = options.select;
    this.readOnly = options.readOnly;
    this.noFeaturesTxt = options.noFeaturesTxt || "Odaberi objekte na karti.";
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.header = document.createElement("header");
    this.header.className = "properties-header";
    this.header.innerHTML = `
    <div>Svojstva</div>
     `;
    this.container.element.appendChild(this.header);
    this.body = document.createElement("section");
    this.body.className = "properties-body middle";
    this.body.innerHTML = this.noFeaturesTxt;
    this.container.element.appendChild(this.body);
    this.callback = options.callback;
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
      } else this.container.element.classList.remove("active");
    });
    this.select.on("select", (evt) => {
      const features = evt.target.getFeatures().getArray();
      if (features.length > 0) {
        this.body.classList.remove("middle");
        const item = [];
        this.body.innerHTML = "";
        for (const f of features) {
          const layer = f.get("layer");
          if (item.find((x) => x.layer === layer)) {
            item.find((x) => x.layer === layer).features.push(f);
          } else {
            item.push({
              layer: layer,
              features: [f],
            });
          }
        }
        for (const [index, i] of item.entries()) {
          const ld = document.createElement("div");
          ld.className = "layer";
          ld.innerHTML = `
          <div class="header"><span class="show-more"><i class="far fa-plus"></i></span> ${i.layer.get("label") || i.layer.get("name")} (${i.features.length})</div>
          `;
          this.body.appendChild(ld);
          ld.querySelector(".show-more").addEventListener("click", (evt) => {
            const e = evt.currentTarget;
            ld.querySelector(".items").style.display = ld.querySelector(".items").style.display === "none" ? "block" : "none";
            e.innerHTML = ld.querySelector(".items").style.display === "none" ? '<i class="far fa-plus"></i>' : '<i class="far fa-minus"></i>';
          });
          const content = document.createElement("div");
          content.className = "items";
          if (index === 0) {
            content.style.display = "block";
            ld.querySelector(".show-more").innerHTML = '<i class="far fa-minus"></i>';
          } else {
            content.style.display = "none";
            ld.querySelector(".show-more").innerHTML = '<i class="far fa-plus"></i>';
          }
          ld.appendChild(content);
          this.dialog_(i.layer, i.features, content);
        }
      } else {
        this.body.innerHTML = this.noFeaturesTxt;
        this.body.classList.add("middle");
      }
    });
  }
  dialog_(layer, features, element) {
    const props = []; //consolidated props
    const schema = layer.getSource().get("def").schema;
    for (const f of features) {
      for (const key of f.getKeys()) {
        if (key !== f.getGeometryName() && key !== "layer" && key !== "Klasa" && props.find((x) => x.Name === key) === undefined) {
          props.push(
            schema.properties.find((x) => x.Name === key) || {
              Name: key,
            }
          );
          props[props.length - 1].values = [];
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
    for (const p of props) {
      if (!p.Hidden) {
        //in layer.def.source.schema.properties
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
        input.id = layer.get("name") + "-" + p.Name; // id = property name
        input.disabled = this.readOnly;
        div.appendChild(label);
        div.appendChild(input);
        element.appendChild(div);
        if (!this.readOnly) input.addEventListener("change", (evt) => { // save to feature properties on input change
          const layerName = evt.target.id.split("-")[0];
          const property = evt.target.id.split("-")[1];
          const value = evt.target.value;
          const fs = features.filter((x) => x.get("layer").get("name") === layerName);
          for (const f of fs) {
            f.set(property, value);
          }
        });
        switch (p.DataType) {
          case undefined || null || 0 || "":
            console.log('dataType: undefined ||null||0||"" for:' + input.id);
            break;
          case 1: //boolean
            input.setAttribute("type", "checkbox");
            input.className = "input";
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
        if (this.onChange) {
          if (input.tagName === "INPUT") input.addEventListener("change", (evt) => this.onChange.call(this, evt));
          if (input.tagName === "SELECT") input.addEventListener("change", (evt) => this.onChange.call(this, evt));
        }
      }
    }
  }
}
