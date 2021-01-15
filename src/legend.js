import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
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
    this.header = document.createElement("header");
    this.header.innerHTML = "Prostorni slojevi";
    this.header.className = `${this.className}-header`;
    this.container.element.appendChild(this.header);
    this.items = Object.assign(document.createElement("article"), { className: `${this.className}-items` });
    this.container.element.appendChild(this.items);
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
  source(name) {
    const layer = this.cfg.layers.find(x => x.name === name);
    return this.cfg.sources.find((x) => layer.source === x.name);
  }
  addItem(prop) {
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
      <span class="${this.className}-item-header-icon">
        <canvas width="${this.iconSize[0]}" height="${this.iconSize[1]}"></canvas>
      </span>
      <span class="${this.className}-item-header-label">${prop.label || prop.name}</span>
      <div class="${this.className}-item-header-thematic"></div>`;
    const canvas = itemHeader.querySelector("canvas");
    this.icon(canvas, this.source(prop.name).type);
  }
  icon(canvas, type) {
    const ctx = canvas.getContext("2d"),
      img = new Image();
    img.src = images.lc_raster;
    if (["geojson", "th"].indexOf(type) > -1) {
      if()
      img.src = images.lc_theme;
    }
    img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  }
}
