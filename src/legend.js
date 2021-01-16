import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import { elt } from "./util";
import Container from "./container";
import Toggle from "./toggle";
import { toContext } from "ol/render";
const images = require("../img/*.gif");

/** thematic editor
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.label html to insert in the control
 * @param {ol/control} options.target container target
 * @param {string} options.contanerClassName contaner class name
 * @param {Object} options.cfg map definition
 */

export default class Legend extends Toggle {
  constructor(options = {}) {
    super(options);
    this.cfg = options.cfg;
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.className = options.class || "legend";
    this.iconSize = options.iconSize || [14, 14];
    this.container.element.classList.add("hidden");
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `${this.className}-header` }, "Prostorni slojevi");
    this.container.element.appendChild(this.header);
    this.items = elt("article", { className: `${this.className}-items` });
    this.container.element.appendChild(this.items);
    this.footer = elt("footer", { className: `${this.className}-footer` }, "Footer");
    this.container.element.appendChild(this.footer);
    this.cfg.layers.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1)); //zIndex as loaded in map by def.js
    this.cfg.layers.map((x) => this.addItem(x));
  }
  /**
   *
   *
   * @param {string} cfg.layer.name
   * @returns
   *
   * @memberOf Legend
   */

  addItem(prop) {
    const thematic = elt("nav", { className: `${this.className}-items-item-header-thematic` });
    //const headerIcon = elt('canvas',{className:`${this.className}-item-header-icon`});
    const header = elt("header", { className: `${this.className}-items-item-header` }, thematic,headerIcon);
    const article = elt("article", { className: `${this.className}-items-item-article` });
    const footer = elt("footer", { className: `${this.className}-items-item-footer` });
    const item = elt("section", { className: `${this.className}-items-item`, id: prop.name }, header, article, footer);
    this.items.appendChild(item);
    
  }
}
