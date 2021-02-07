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
    this.image = elt("a", { className: "download-image"}, elt('i',{className:'far fa-arrow-to-bottom fa-fw'}));
    this.footer = elt("footer", { className: `footer ol-control` }, this.image, elt("button", { className: "button" }, "Button1"), elt("button", { className: "button" }, "Button2"));
    this.container.element.appendChild(this.footer);

    this.setContent();

    this.map.getView().on("change:resolution", (evt) => this.setContent());
  }
  getLegendImage(linkElement, legendSize = [400, 400], iconSize = [16, 16]) {
    const ls = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse();
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
    const legendImage = elt("canvas", { className: `icon`, width: legendSize[0], height: legendSize[1] });
    const lictx = legendImage.getContext("2d");
    lictx.font = "12px Verdana";
    const loadImage = (url, i) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve([img, i]));
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });
    let icon;
    const r = [];
    let i = 0;
    for (const [j, l] of ls.entries()) {
      if (l instanceof TileLayer) r.push(loadImage(images.lc_raster, i));
      if (l instanceof VectorLayer && typeof l.getStyle() === "function") {
        let style = l.getStyle().call(this, undefined, this.map.getView().getResolution());
        const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
        style = Array.isArray(style) ? style : [style];
        if (style.length > 1) {
          r.push(loadImage(images.lc_theme, i));

         /*  for (const [k,s] of style.entries()) {
            i++;
            const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
            const ctx = icon.getContext("2d");
            const vctx = toContext(ctx, {
              size: iconSize,
            });
            vctx.setStyle(s);
            if (s.getFill()) vctx.drawGeometry(polygon);
            if (!s.getFill() && s.getStroke()) vctx.drawGeometry(linestring);
            const imageStyle = s.getImage();
            if (imageStyle instanceof Icon) {
              r.push(loadImage(imageStyle.getSrc(), i));
            } else {
              vctx.drawGeometry(point);
            }
            lictx.drawImage(icon, 16, i * 16);
            const imagStyle = l.get('imagis-style')[k];
            if(imagStyle && imagStyle.filter){
              const text = `${imagStyle.filter.property} ${imagStyle.filter.operator} ${imagStyle.filter.value}`;
              lictx.fillText(text, 24, i * 16);
            }
          } */
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
            r.push(loadImage(imageStyle.getSrc(), i));
          } else {
            vctx.drawGeometry(point);
          }
          lictx.drawImage(icon, 0, i * 16);
        }
      }
      const labelText = l.get("label") || l.get("name");
      lictx.fillText(labelText, 24, i * 16);
      console.log(labelText, 24, i * 16)
      i++;
    }
    Promise.all(r).then((imgs) => {
      for (const img of imgs) {
        const icon = elt("canvas", { width: iconSize[0], height: iconSize[1] });
        const ctx = icon.getContext("2d");
        ctx.drawImage(img[0], 0, 0, img[0].width, img[0].height, 0, 0, icon.width, icon.height);
        lictx.drawImage(icon, 0, img[1] * 16);
      }
      const ex = elt("canvas", { className: `icon`, width: legendImage.width, height: legendImage.height });
      const exCtx = ex.getContext("2d");
      exCtx.drawImage(legendImage,0,0)
      
      this.image.href=ex.toDataURL();
      this.image.download='legend.png'
    });
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
    for (const [i, l] of ls.entries()) {
      const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
      const label = elt("label", {}, l.get("label") || l.get("name"));
      const thematic = elt("div", { className: `thematic` });
      const item = elt("div", { className: "item", dataName: `${l.get("name")}` }, icon, label, thematic);
      this.main.appendChild(item);
      if (l instanceof TileLayer) this.loadImage(icon, images.lc_raster);
      if (l instanceof VectorLayer && typeof l.getStyle() === "function") {
        let style = l.getStyle().call(this, undefined, this.map.getView().getResolution());
        style = Array.isArray(style) ? style : [style];
        if (style.length > 1) {
          this.loadImage(icon, images.lc_theme);
          for (const [i,s] of style.entries()) {
            const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] }); 
            const label = elt("label",{}, ``);
            const item = elt("div", { className: "item", dataName: `${l.get("name")}` }, icon, label);
            thematic.appendChild(item);
            const imagStyle = l.get('imagis-style')[i];
            if(imagStyle && imagStyle.filter){
              label.innerHTML= `${imagStyle.filter.property} ${imagStyle.filter.operator} ${imagStyle.filter.value}`;
            }
            const ctx = icon.getContext("2d");
            const vctx = toContext(ctx, {
              size: iconSize,
            });
            vctx.setStyle(s);
            if (s.getFill()) vctx.drawGeometry(polygon);
            if (!s.getFill() && s.getStroke()) vctx.drawGeometry(linestring);
            const imageStyle = s.getImage();
            if (imageStyle instanceof Icon) {
              this.loadImage(icon, imageStyle.getSrc());
            } else {
              vctx.drawGeometry(point);
            }
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
            this.loadImage(icon, imageStyle.getSrc());
          } else {
            vctx.drawGeometry(point);
          }
        }
      }
    }
  }
  loadImage(icon, src, callback) {
    const img = new Image();
    const ctx = icon.getContext("2d");
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
      if (callback) callback.call(this, icon);
    };
    img.src = src;
  }
}
