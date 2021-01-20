import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import { elt } from "./util";
import Container from "./container";
import Toggle from "./toggle";
import { toContext } from "ol/render";
import { LineString, Point, Polygon } from "ol/geom";
import { makeStyle } from "./makeStyle";
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
  }
  /** new cfg to legend */
  setCfg(cfg) {
    this.items.innerHTML = "";
    this.cfg = cfg;
    this.cfg.layers.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1)).reverse(); //zIndex as loaded in map by def.js
    this.cfg.layers.map((x) => this.addItem(x));
  }
  /**
   *Builds item & add to items
   *
   * @param {Object} prop layer properties in cfg
   * @returns
   *
   * @memberOf Legend
   */

  addItem(prop) {
    const img = new Image(),
      thematic = elt("nav", { className: `${this.className}-items-item-header-thematic` }),
      headerIcon = elt("canvas", { className: `${this.className}-item-header-icon`, width: this.iconSize[0], height: this.iconSize[1] }),
      headerLabel = elt("span", { className: `${this.className}-item-header-label` }, prop.label || prop.name),
      header = elt("header", { className: `${this.className}-items-item-header` }, headerIcon, headerLabel, thematic),
      article = elt("article", { className: `${this.className}-items-item-article` }),
      footer = elt("footer", { className: `${this.className}-items-item-footer` }),
      item = elt("section", { className: `${this.className}-items-item`, id: prop.name }, header, article, footer);
    this.items.appendChild(item);

    if (!prop.style) img.src = images.lc_raster;
    else {
      for (const [i, s] of prop.style.entries()) {
        let ctx;
        if (prop.style.length > 1) {
          if(i === 0) img.src = images.lc_theme;
          const thematicIcon = elt("canvas", { className: `${this.className}-item-thematic-icon`, width: this.iconSize[0], height: this.iconSize[1] }),
          vctx = toContext(ctx, { size: this.iconSize }),  
          thematicLabel = elt("span", { className: `${this.className}-item-thematic-label` }, `${s.filter.property} ${s.filter.operator} ${s.filter.value}`),
            thematicSection = elt("section", { className: `${this.className}-items-item-thematic` }, thematicIcon, thematicLabel);
          thematic.appendChild(thematicSection);
          ctx = thematicIcon.getContext("2d");
          console.log(s,ctx);
        }
        else{
          ctx = headerIcon.getContext("2d");
        }
        const vctx = toContext(ctx, { size: this.iconSize });
        console.log(s,ctx)
        const itemType = this.cfg.sources.find((x) => x.name === prop.source).type;
        vctx.setStyle(makeStyle(prop.style[0]).call(this, undefined, this.getMap().getView().getResolution())[0]);
       
      }
    }
    img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, headerIcon.width, headerIcon.height);
  }
}
