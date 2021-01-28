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
export default class Task extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-layer-group fa-fw"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `${options.className || "taskpane"}-container taskpane`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.headerHtml = options.header || 'Header';
    this.contentHtml = options.content || 'Content';
    this.footerHtml = options.footer || 'Footer';
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `header` }, this.headerHtml);
    this.container.element.appendChild(this.header);
    this.main = elt("main", { className: `main` },this.contentHtml);
    this.container.element.appendChild(this.main);
    this.footer = elt("footer", { className: `footer` }, this.footerHtml);
    this.container.element.appendChild(this.footer);
    this.setContent();
  }
  setHeader(html="Header") {
    this.header = html;
  }
  setFooter(html="Footer") {
    this.footer = html;
  }
  setContent() {
    this.main.innerHTML='';
    let i = 0;
    do {
      i++;
      const e = document.createElement("div");
      e.innerHTML = `${i} item row`;
      this.main.appendChild(e);
    } while (i < 11);
  }
}
