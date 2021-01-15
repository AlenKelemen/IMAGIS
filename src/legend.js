import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
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
    this.container.element.classList.add("hidden");
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = document.createElement("header");
    this.header.innerHTML = "Prostorni slojevi";
    this.header.className = `${this.className}-header`;
    this.container.element.appendChild(this.header);
    this.items = Object.assign(document.createElement("article"), { className: `${this.className}-items` });
    this.container.element.appendChild(this.items);
    this.cfg.layers.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1)); //zIndex as loaded in map by def.js
    this.cfg.layers.map((x) => this.addItem(x));
  }

  addItem(prop,iconSize = [15, 15]) {
    const item = Object.assign(document.createElement("section"), { className: `${this.className}-item` }),
      itemHeader = Object.assign(document.createElement("header"), { className: `${this.className}-item-header` }),
      itemArticle = Object.assign(document.createElement("article"), { className: `${this.className}-item-article` }),
      itemFooter = Object.assign(document.createElement("footer"), { className: `${this.className}-item-footer` });
    item.appendChild(itemHeader);
    item.appendChild(itemArticle);
    item.appendChild(itemFooter);
    this.items.appendChild(item);
    item.id = prop.name;
    // item header
    itemHeader.innerHTML = `
      <span class="${this.className}-item-header-icon" title="Rasterska podloga">
        <canvas width="${iconSize[0]}" height="${iconSize[1]}"></canvas>
        </span>
      <span class="${this.className}-item-header-label">${prop.label || prop.name}</span>`;
   
 
  }
 
}
