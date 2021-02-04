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
      className: `taskpane no-header`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.contentHtml = options.content || "Content";
    this.footerHtml = options.footer || "Footer";
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
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
      console.log(l instanceof VectorLayer ? l.getStyle() : undefined)
     // this.styleIcon(l instanceof VectorLayer ? l.getStyle() : undefined);
      /* if (!l.get("name")) l.set("name", i);
      if (!l.get("label")) l.set("label", l.get("name"));
      const thematic = elt("div", { className: "thematic" });
      const icons = this.styleIcon(l instanceof VectorLayer ? l.getStyle() : undefined);
      //thematic labels- from imagis style .filter
      const imagisStyle = l.get("imagis-style");
      if (imagisStyle && imagisStyle.length > 1)
        for (const [i, v] of imagisStyle.entries()) {
          let label = "";
          if (v.filter) label = v.filter.property + " " + v.filter.operator + " " + v.filter.value;
          const icon = icons[i + 1]; //icons[0] is for header item,thematic icons are starting from icon[1]
          const item = elt("div", { className: "item" }, icon, label);
          thematic.appendChild(item);
        }
      //
      const label = l.get("label");
     const item = elt("div", { className: "item", id: l.get("name") }, icons[0], label, thematic);
      this.main.appendChild(item); */
    }
  }

  getImage(size = [100, 100]) {
    const m = new Image();
    const c = elt("canvas", { width: size[0], height: size[1] });
    const ctx = c.getContext("2d");
    const ls = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse(); //sort layers by index
    for (const [i, l] of ls.entries()) {
      if (!l.get("name")) l.set("name", i);
      if (!l.get("label")) l.set("label", l.get("name"));
      const icons = this.styleIcon(l instanceof VectorLayer ? l.getStyle() : undefined);
      for (const i of icons) {
        ctx.drawImage(i, 0, 0);
        console.log(i.toDataURL());
      }
    }
    //return c.toDataURL();
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
    else if (typeof style === "object" && Array.isArray(style) === false) style = [style];
    console.log(style)
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
    const loadImage = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });
    if (style !== undefined) {
      for (const [i, s] of Object.entries(style)) {
        r.push(loadImage(images.lc_raster));
      }
    }

    Promise.all(r).then((imgs) => {
      for (const img of imgs) {
        const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
        const ctx = icon.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
        console.log(icon, img);
      }
    });
  }
}
