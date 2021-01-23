import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import { elt } from "./util";
import Container from "./container";
import Toggle from "./toggle";
import { toContext } from "ol/render";
import { LineString, Point, Polygon } from "ol/geom";
import { makeStyle } from "./makeStyle";
import { Icon, Style } from "ol/style";
const images = require("../img/*.png");
import Def from './def';

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
    this.def = options.def;
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
    const def = this.def
    
    const style2Image = (style, ctx) => {
      const olStyle = makeStyle(style).call(this, undefined, this.getMap().getView().getResolution()).pop();
      const iconSize = this.iconSize;
      const vctx = toContext(ctx, {
        size: this.iconSize,
      });
      vctx.setStyle(olStyle);
      if (style.fill) {
        vctx.drawGeometry(
          new Polygon([
            [
              [2, 2],
              [iconSize[0] - 1, 2],
              [iconSize[0] - 1, iconSize[1] - 1],
              [2, iconSize[1] - 1],
              [2, 2],
            ],
          ])
        );
      }
      if (!style.fill && style.stroke) {
        vctx.drawGeometry(
          new LineString([
            [2, 2],
            [iconSize[0] - 2, iconSize[1] - 2],
          ])
        );
      }
      if (style.icon) {
        const image = new Image();
        image.src = images[style.icon.src];
        image.onload = function (evt) {
          const newStyle = new Style({
            image: new Icon({
              img: image,
              imgSize: [image.width, image.height],
              scale: Math.min(iconSize[0] / image.width, iconSize[1] / image.height),
            }),
          });
          vctx.setStyle(newStyle);
          vctx.drawGeometry(new Point([iconSize[0] / 2, iconSize[1] / 2]));
        };
      }
      if (style.regularShape) {
        const size = olStyle.getImage().getSize();
        olStyle.getImage().setScale(Math.min(iconSize[0] / size[0], iconSize[1] / size[1]));
        vctx.setStyle(olStyle);
        vctx.drawGeometry(new Point([iconSize[0] / 2, iconSize[1] / 2]));
      }
    };
    let ctx;
    const img = new Image(),
      thematic = elt("nav", { className: `${this.className}-items-item-header-thematic` }),
      // item header
      headerIcon = elt("canvas", { className: `${this.className}-item-header-icon`, width: this.iconSize[0], height: this.iconSize[1] }),
      headerLabel = elt("span", { className: `${this.className}-item-header-label` }, prop.label || prop.name),
      header = elt("header", { className: `${this.className}-items-item-header` }, headerIcon, headerLabel, thematic),
      footerDisplay = elt("i", { className: "far fa-plus fa-fw" }), //show hide footer
      article = elt("article", { className: `${this.className}-items-item-article` }, footerDisplay),
      //item footer
      opacity = elt("input", { type: "range", min:0, max:1, step:0.01, className: `${this.className}-items-item-footer-opacity` }),
      info = elt("div", { className: `${this.className}-items-item-footer-info` }, `${prop.info}`),
      footer = elt("footer", { className: `${this.className}-items-item-footer hidden` }, elt("i", { title: "Prozirnost", className: "far fa-fog fa-fw" }), opacity, info),
      item = elt("section", { className: `${this.className}-items-item`, id: prop.name }, header, article, footer);
    this.items.appendChild(item);

    // layer opacity change
    
const layer = this.getMap().getLayers().getArray().find(x => x.get('name') === prop.name);
    opacity.value = prop.opacity;
  opacity.addEventListener("change", (evt) => {
      prop.opacity = opacity.value;
      def.setCfg(this.cfg)
      //layer.setOpacity(Number(opacity.value));
    }); 

    //  expand/shrink footer content
    footerDisplay.addEventListener("click", (evt) => {
      footer.classList.toggle("hidden");
      evt.target.classList.toggle("fa-plus");
      evt.target.classList.toggle("fa-minus");
    });
    // hide/show thematic legend on icon click
    header.addEventListener("click", (evt) => {
      thematic.classList.toggle("hidden");
    });
    //  resolution/visibility zoom depending
    const min = prop.minResolution || 0,
      max = prop.maxResolution || Infinity,
      view = this.getMap().getView();
    view.on("change:resolution", () => {
      const res = view.getResolution();
      if (res >= min && res <= max) item.classList.remove("hidden");
      else item.classList.add("hidden");
    });
    view.dispatchEvent("change:resolution");
    //Icons
    ctx = headerIcon.getContext("2d");
    if (!prop.style) {
      img.src = images.lc_raster;
    } else {
      for (const [i, s] of prop.style.entries()) {
        if (prop.style.length > 1) {
          img.src = images.lc_theme;
          const imgThematic = new Image();
          const thematicIcon = elt("canvas", { className: `${this.className}-item-thematic-icon`, width: this.iconSize[0], height: this.iconSize[1] }),
            ctxThematic = thematicIcon.getContext("2d"),
            thematicLabel = elt("span", { className: `${this.className}-item-thematic-label` }, `${s.filter.property} ${s.filter.operator} ${s.filter.value}`),
            thematicSection = elt("section", { className: `${this.className}-items-item-thematic` }, thematicIcon, thematicLabel);
          thematic.appendChild(thematicSection);
          style2Image(s, ctxThematic); //add thematic for multiple styles
          imgThematic.onload = () => ctxThematic.drawImage(imgThematic, 0, 0, imgThematic.width, imgThematic.height, 0, 0, headerIcon.width, headerIcon.height);
        } else {
          style2Image(s, ctx);
        }
      }
    }
    img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, headerIcon.width, headerIcon.height);
  }
}
