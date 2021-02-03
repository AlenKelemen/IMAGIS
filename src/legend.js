import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import { elt } from "./util";
import { toContext } from "ol/render";
import { Icon, Style } from "ol/style";
import { LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
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
    this.footer = elt("footer", { className: `footer ol-control` }, elt("button", { className: "button" }, "Button1"), elt("button", { className: "button" }, "Button2"));
    this.container.element.appendChild(this.footer);
    this.setContent();
    //this.map.getView().on("change:resolution", evt => this.setContent())
  }

  setContent() {
    this.main.innerHTML = "";
    const ls = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse(); //sort layers by index
    for (const [i, l] of ls.entries()) {
      if (!l.get("name")) l.set("name", i);
      if (!l.get("label")) l.set("label", l.get("name"));
      const thematic = elt("div", { className: "thematic" });
      const icons = this.styleIcon(l instanceof VectorLayer ? l.getStyle() : undefined);
      //thematic labels- from imagis style .filter
      const imagisStyle = l.get("imagis-style");
      if (imagisStyle && imagisStyle.length > 1)
        for (const [i, v] of imagisStyle.entries()) {
          let label = "";
          if (v.filter) label = v.filter.property + " " + v.filter.operator + " " + v.filter.value;
          const icon = icons[i+1];//icons[0] is for header item,thematic icons are starting from icon[1]
          const item = elt("div", { className: "item" }, icon, label);
          thematic.appendChild(item);
        }
      //
      const label = l.get("label");
      const item = elt("div", { className: "item", id: l.get("name") }, icons[0], label, thematic);
      this.main.appendChild(item);
    }
  }
  /**
   * Layer style icons
   *
   * @param {Object} style ol/style
   * @param {Array} [iconSize=[16, 16]] canvas size
   * @return {Array} canvas icons
   * @memberof Legend
   */
  styleIcon(style, iconSize = [16, 16]) {
    const r = [];
    if (typeof style === "function") style = style.call(this, undefined, this.map.getView().getResolution());
    else if (typeof style === "object") style = [style];
    const ce = function () {
      const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
      const ctx = icon.getContext("2d");
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
      const vctx = toContext(ctx, {
        size: iconSize,
      });
      return { img: img, icon: icon, ctx: ctx, vctx: vctx };
    };
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
    if (style == undefined) {
      style = [];
      const el = ce();
      el.img.src = images.lc_raster;
      r.push(el.icon);
    }
    if (style.length > 1) {
      const el = ce();
      el.img.src = images.lc_theme;
      r.push(el.icon);
    }
    for (const [i, s] of Object.entries(style)) {
      const el = ce();
      el.ctx.fillStyle = "#F2F2F2";
      el.ctx.fillRect(0, 0, el.icon.width, el.icon.height);
      if (s instanceof Style) {
        el.vctx.setStyle(s);
        if (s.getFill()) el.vctx.drawGeometry(polygon);
        if (!s.getFill() && s.getStroke()) el.vctx.drawGeometry(linestring);
        const imageStyle = s.getImage();
        if (imageStyle) {
          el.vctx.drawGeometry(point);
          if (imageStyle instanceof Icon) el.img.src = imageStyle.getSrc();
        }
      }
      r.push(el.icon);
    }
    return r;
  }
}
