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
 * @param {string} options.label html to insert in the control
 * @param {boolean=false} options.active control active, default false
 * @param {Object} options.target contaner target element
 */
export default class Task extends Toggle {
  constructor(options = {}) {
    if(!options.className) options.className ='task';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `${options.className || 'taskpane'}-container taskpane`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `${options.className || 'taskpane'}-header` }, "Header");
    this.container.element.appendChild(this.header);
    this.footer = elt("footer", { className: `${options.className || 'taskpane'}-footer` }, "Footer");
    this.container.element.appendChild(this.footer);
  }

}
