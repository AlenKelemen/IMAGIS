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
  }


  setContent() {
    this.main.innerHTML = "";
    for (const l of this.map.getLayers().getArray()) {
      const style = l instanceof VectorLayer ? l.getStyle() : undefined;
      for (const e of this.styleIcon(style)) {
          this.main.appendChild(e);
      }
    }

    let i = 0;
    do {
      i++;
      const e = document.createElement("div");
      e.innerHTML = `${i} item row`;
      //this.main.appendChild(e);
    } while (i < 11);
  }
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
