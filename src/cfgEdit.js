import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import { elt } from "./util";
/** task example
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {boolean=false} options.active control active, default false
 * @param {Object} options.target contaner target element
 */
export default class CfgEdit extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "cfg-edit";
    if (!options.html) options.html = '<i class="far fa-layer-group fa-fw"></i>';
    super(options);
    this.map = options.map;
    this.config = options.config;
    this.container = new Container({
      semantic: "section",
      className: `${options.className || "cfg-edit"}-container taskpane`,
    });
    options.target.addControl(this.container);
    this.cfg = options.cfg;
    this.container.setVisible(this.active);
    this.headerHtml = options.header || "Projekt";
    this.contentHtml = options.content || "Content";
    this.footerHtml = options.footer || "Konfiguracija projekta";
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `header` }, this.headerHtml);
    this.container.element.appendChild(this.header);
    this.main = elt("main", { className: `main` }, this.contentHtml);
    this.container.element.appendChild(this.main);
    this.update = elt("button", { className: "update" }, "Primijeni");
    this.save = elt("button", { className: "save" }, "Spremi");
    this.default = elt("button", { className: "default" }, "Pretpostavljeno");
    this.footer = elt("footer", { className: `ol-control  footer` }, this.default, this.save, this.update);
    this.container.element.appendChild(this.footer);
    this.setContent();

    this.default.addEventListener("click", (evt) => {
      console.log(this.config.getDefault());
      this.config.setCfg(this.config.getDefault());
      this.config.updateView();
    });
    this.update.addEventListener("click", (evt) => {
      this.cfg.project = JSON.parse(this.viewCfg.value).project;
      this.cfg.center = JSON.parse(this.viewCfg.value).center;
      this.cfg.zoom = JSON.parse(this.viewCfg.value).zoom;
      this.config.setCfg(this.cfg);
      this.config.updateView();
    });
    this.save.addEventListener("click", (evt) => {
      this.cfg.project = JSON.parse(this.viewCfg.value).project;
      this.cfg.center = JSON.parse(this.viewCfg.value).center;
      this.cfg.zoom = JSON.parse(this.viewCfg.value).zoom;
      localStorage.setItem("cfg", JSON.stringify(this.cfg));
    });
  }

  setContent() {
    this.main.innerHTML = "";
    this.viewCfg = elt("textarea", { className: "view" }, JSON.stringify({ project: this.cfg.project, center: this.cfg.center, zoom: this.cfg.zoom }, null, 2));
    this.main.appendChild(this.viewCfg);
    this.map.getView().on("propertychange", (evt) => (this.viewCfg.value = JSON.stringify({ project: this.cfg.project, center: this.cfg.center, zoom: this.cfg.zoom }, null, 2)));
    this.layerSelect = elt("select", { className: "layer-select" });
    for (const l of this.cfg.layers) {
      this.layerSelect.options[this.layerSelect.options.length] = new Option(l.label,l.name);
    }
    this.main.appendChild(this.layerSelect);
    this.layerCfg = elt("textarea", { className: "layer" });
    this.layerSelect.addEventListener('change',evt => this.layerCfg.value = JSON.stringify(this.cfg.layers.find(x => x.name === this.layerSelect.value), null, 2))
    this.main.appendChild(this.layerCfg);
  }
}
