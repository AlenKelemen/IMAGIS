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
    if (!options.html) options.html = '<i class="far fa-layer-group"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `${options.className || "taskpane"}-container taskpane`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `header` }, "Header");
    this.container.element.appendChild(this.header);
    this.content = elt("main", { className: `main` }, "Content</br>pwrefkfk</br>owefewfn</br>oeifudweoidfhjew</br>iewoufhewu");
    this.container.element.appendChild(this.content);
    this.footer = elt("footer", { className: `footer` }, "Footer");
    this.container.element.appendChild(this.footer);
  }
}
