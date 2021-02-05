import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import { elt } from "./util";
import { toContext } from "ol/render";
import { Icon, Style } from "ol/style";
import { LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
const images = require("../img/*.png");
/** Legend
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {boolean=false} options.active control active, default false
 * @param {Object} options.target contaner target element
 */
export default class Legend extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-layer-group fa-fw"></i>';
    super(options);
    this.map = options.map;
    this.container = new Container({
      semantic: "section",
      className: `taskpane no-header`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    this.footer = elt("footer", { className: `footer ol-control` }, elt("button", { className: "button" }, "Button1"), elt("button", { className: "button" }, "Button2"));
    this.container.element.appendChild(this.footer);
    this.setContent();

    this.map.getView().on("change:resolution", (evt) => this.setContent());
    this.legendCanvas = elt("canvas", { width: 100, height: 300 });
  }
  setContent(iconSize = [16, 16]) {
    this.main.innerHTML = "";
    const ls = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse(); //sort layers by index
    const polygon = new Polygon([
      [
        [0, 0],
        [iconSize[0], 0],
        [iconSize[0], iconSize[1]],
        [0, iconSize[1]],
        [0, 0],
      ],
    ]);
    const linestring = new LineString([
      [0, 0],
      [iconSize[0], iconSize[1]],
    ]);
    const point = new Point([iconSize[0] / 2, iconSize[1] / 2]);
    for (const l of ls) {
      const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
      const label = elt("label", {}, l.get("label") || l.get("name"));
      const thematic = elt("div", { className: `thematic` });
      const item = elt("div", { className: "item", dataName: `${l.get("name")}` }, icon, label, thematic);
      this.main.appendChild(item);
      if (l instanceof TileLayer) this.loadImage(icon, images.lc_raster,this.getLegendImage);
      if (l instanceof VectorLayer && typeof l.getStyle() === "function") {
        let style = l.getStyle().call(this, undefined, this.map.getView().getResolution());
        style = Array.isArray(style) ? style : [style];
        if (style.length > 1) {
          this.loadImage(icon, images.lc_theme, this.getLegendImage);
          for (const s of style) {
            const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
            thematic.appendChild(icon);
            const ctx = icon.getContext("2d");
            const vctx = toContext(ctx, {
              size: iconSize,
            });
            vctx.setStyle(s);
            if (s.getFill()) vctx.drawGeometry(polygon);
            if (!s.getFill() && s.getStroke()) vctx.drawGeometry(linestring);
            const imageStyle = s.getImage();
            if (imageStyle instanceof Icon) {
              this.loadImage(icon, imageStyle.getSrc(),this.getLegendImage);
            } else {
              vctx.drawGeometry(point);
            }
            this.getLegendImage(icon)
          }
        }
        if (style.length === 1) {
          style = style[0];
          const ctx = icon.getContext("2d");
          const vctx = toContext(ctx, {
            size: iconSize,
          });
          vctx.setStyle(style);
          if (style.getFill()) vctx.drawGeometry(polygon);
          if (!style.getFill() && style.getStroke()) vctx.drawGeometry(linestring);
          const imageStyle = style.getImage();
          if (imageStyle instanceof Icon) {
            this.loadImage(icon, imageStyle.getSrc(), this.getLegendImage);
          } else {
            vctx.drawGeometry(point);
            
          }
          this.getLegendImage(icon)
        }
      }
    }
  }
  loadImage(icon, src, callback) {
    const img = new Image();
    const ctx = icon.getContext("2d");
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
      if (callback) callback.call(this,icon);
    };
    img.src = src;
  }
  getLegendImage(icon) {
    if(icon) console.log(icon.toDataURL());
    for (const item of this.main.children) {
      const label = item.childNodes[1].innerText;
    }
  }
}
