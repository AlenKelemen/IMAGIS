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
    this.wrapper = elt("div", { className: "wrapper" });
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
          const header = elt("div", { className: "header" }, this.queryBuilder());
          this.main.appendChild(header);
          this.main.appendChild(this.wrapper);
          const accept = elt("button", { className: "accept" }, "OK");
          const footer = elt("div", { className: "footer" }, accept);
          this.main.appendChild(footer);
        }
      }
    });
  }

  queryBuilder() {
    this.btnOR = elt(
      "button",
      {
        disabled: true,
        onclick: (evt) => {
          if (!evt.target.classList.contains("active")) {
            evt.target.classList.add("active");
            this.btnAND.classList.remove("active");
          }
        },
      },
      "OR"
    );
    this.btnAND = elt(
      "button",
      {
        disabled: true,
        onclick: (evt) => {
          if (!evt.target.classList.contains("active")) {
            evt.target.classList.add("active");
            this.btnOR.classList.remove("active");
          }
        },
      },
      "AND"
    );
    this.conditions = elt("span", { className: "conditions" }, this.btnAND, this.btnOR);
    const addRule = elt(
      "button",
      {
        className: "add-rule",
        onclick: (evt) => {
          this.btnOR.disabled = false;
          this.btnAND.disabled = false;
          
          const rule = elt('p',{className:'rule'},header.querySelector('.active'))
          if(this.wrapper.children.length > 0) this.wrapper.appendChild(rule)
          this.queryGroup();
        },
      },
      "+ Dodaj pravilo"
    );
    const rules = elt("span", { className: "rules" }, addRule);
    const header = elt("div", { className: "header" }, this.conditions, rules);
    const basic = elt("div", { className: "query-builder" }, header);
    return basic;
  }
  queryGroup() {
    const src = this.activeSource;
    const options = [
      { type: [1, 3, 4, 5, 6, 7, 8, 9], label: "jednako", operator: "=" },
      { type: [1, 3, 4, 5, 6, 7, 8, 9], label: "različito", operator: "<>" },
      { type: [4, 5, 6, 7, 8], label: "veće", operator: ">" },
      { type: [4, 5, 6, 7, 8], label: "manje", operator: "<" },
      { type: [9], label: "poput", operator: "LIKE" },
    ];
    const ruleProperties = elt("select", {});
    for (const p of src.get("schema").properties) ruleProperties.add(new Option(p.Label, p.Name));
    const ruleOperators = elt("select", {});
    ruleProperties.addEventListener("change", (evt) => {
      ruleOperators.length = 0;
      const dt = src.get("schema").properties.find((x) => x.Name === ruleProperties.value).DataType;
      options.filter((x) => x.type.includes(dt)).map((x) => ruleOperators.add(new Option(x.label, x.operator)));
    });
    ruleProperties.dispatchEvent(new Event("change"));
    const ruleValue = elt("input", { type: "text" });
    const ruleQuery = elt("span", { className: "rule-query" }, elt("label", {}, "Svojstvo"), ruleProperties, elt("label", {}, "Operator"), ruleOperators, elt("label", {}, "Vrijednost"), ruleValue);

    const ruleDelete = elt(
      "button",
      {
        className: "rule-delete",
        onclick: (evt) => {
          evt.currentTarget.parentElement.remove();
        },
      },
      elt("i", { className: "far fa-trash-alt fa-fw" })
    );
    const basicGroup = elt("div", { className: "rules-group-container" }, ruleQuery, ruleDelete);
    this.wrapper.appendChild(basicGroup);
  }
}
