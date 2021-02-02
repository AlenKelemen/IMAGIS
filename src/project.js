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
    if (!options.className) options.className = "project";
    if (!options.html) options.html = '<i class="far fa-cog fa-fw"></i>';
    super(options);
    this.map = options.map;
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.headerHtml = options.header || "Header";
    this.contentHtml = options.content || "Content";
    this.footerHtml = options.footer || "Footer";
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `header` }, this.headerHtml);
    this.container.element.appendChild(this.header);
    this.main = elt("main", { className: `main` }, this.contentHtml);
    this.container.element.appendChild(this.main);
    this.save = elt("button", { className: "save" }, "Spremi");
    this.default = elt("button", { className: "default" }, "Pretpostavljeno");
    this.footer = elt("footer", { className: `ol-control footer` }, this.default, this.save);
    this.container.element.appendChild(this.footer);
    this.setContent();
    this.default.addEventListener("click", (evt) => {
      console.log(evt)
    });
    this.save.addEventListener("click", (evt) => {
      console.log(evt)
    });
  }

  setContent() {
    this.main.innerHTML = "";
    let i = 0;
    do {
      i++;
      const e = document.createElement("div");
      e.innerHTML = `${i} item row`;
      this.main.appendChild(e);
    } while (i < 11);
  }
}
