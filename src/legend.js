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
    this.image = elt("button", { className: "download-image" }, elt("i", { className: "far fa-arrow-to-bottom fa-fw" }));
    this.footer = elt("footer", { className: `footer ol-control` }, this.image, elt("button", { className: "button" }, "Button1"), elt("button", { className: "button" }, "Button2"));
    this.container.element.appendChild(this.footer);
    this.symbols = {
      polygon: new Polygon([
        [
          [0, 0],
          [16, 0],
          [16, 16],
          [0, 16],
          [0, 0],
        ],
      ]),
      linestring: new LineString([
        [0, 0],
        [16, 16],
      ]),
      point: new Point([16 / 2, 16 / 2]),
    };
    this.image.addEventListener("click", (evt) => this.getLegendImage());
    this.setContent();
    this.map.getView().on("change:resolution", (evt) => this.setContent());
  }
  /**
   *Style icon
   *
   * @param {Array} style
   * @memberof Legend
   * @return {Promise}
   */

  drawIcon(style, label, thematic) {
    if (!style || style.length) return;
    return new Promise((resolve, reject) => {
      const icon = elt("canvas", { width: 16, height: 16 });
      const ctx = icon.getContext("2d");
      const vctx = toContext(ctx, {
        size: [16, 16],
      });
      vctx.setStyle(style);
      if (style.getFill()) vctx.drawGeometry(this.symbols.polygon);
      if (!style.getFill() && style.getStroke()) vctx.drawGeometry(this.symbols.linestring);
      if (style.getImage() && style.getImage() instanceof Icon) {
        const img = new Image();
        img.addEventListener("load", () => {
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
          resolve({ icon: icon, label: label, thematic: thematic });
        });
      }
      vctx.drawGeometry(this.symbols.point);
      resolve({ icon: icon, label: label, thematic: thematic });
    });
  }
  loadImage(url, label, thematic) {
    return new Promise((resolve, reject) => {
      const icon = elt("canvas", { width: 16, height: 16 });
      const ctx = icon.getContext("2d");
      const img = new Image();
      img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
        resolve({ icon: icon, label: label, thematic: thematic });
      });
      img.src = url;
    });
  }
  getStyles(layer, resolution) {
    if (layer instanceof VectorLayer) {
      if (!(layer.getStyle() && typeof layer.getStyle() === "function")) return;
      const styles = layer.getStyle().call(this, undefined, resolution);
      if (!Array.isArray(styles)) return;
      else return { thematic: styles.length > 1, styles: styles };
    } else return { thematic: false, styles: [] };
  }
  getLabels(layer) {
    const label = layer.get("label") || layer.get("name") || "";
    const imagisStyle = layer.get("imagis-style");
    const thematic = [];
    if (imagisStyle)
      for (const is of imagisStyle) {
        if (is.filter) thematic.push(`${is.filter.property} ${is.filter.operator}  ${is.filter.value} `);
      }
    return { label: label, thematic: thematic };
  }
  getItemsContent() {
    const promises = [];
    const resolution = this.map.getView().getResolution();
    const layers = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse();
    for (const l of layers) {
      const labelsInfo = this.getLabels(l, this.getStyles(l, resolution));
      const stylesInfo = this.getStyles(l, resolution);
      const label = labelsInfo.label;
      if (!stylesInfo.styles.length) promises.push(this.loadImage(images.lc_raster, label, false));
      if (stylesInfo.styles.length > 1) promises.push(this.loadImage(images.lc_theme, label, false));
      for (const [i, style] of stylesInfo.styles.entries()) {
        if (labelsInfo.thematic[i]) label = labelsInfo.thematic[i];
        promises.push(this.drawIcon(style, label, labelsInfo.thematic.length !== 0));
      }
    }
    return promises;
  }
  setContent() {
    const promises = this.getItemsContent();
    Promise.all(promises).then((r) => {
      for (const row of r) {
        console.log(row);
      }
    });
  }
  getLegendImage() {
    const promises = this.getItemsContent();
    const legendImage = (items) => {
      const canvas = elt("canvas", { width: 400, height: 16 * items });
      const ctx = canvas.getContext("2d");
     ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.textBaseline = "middle"; 
      return canvas;
    };
    Promise.all(promises).then((r) => {
      console.log(r.icon);
      const canvas = legendImage(r.length);
      const ctx = canvas.getContext("2d");
      for (const [i, v] of r.entries()) {
        console.log(i, v);
        if (v.thematic) {
          ctx.drawImage(v.icon, 16, i * 16);
          ctx.fillText(v.label, 40, i * 16 + 8);
        } else {
          ctx.drawImage(v.icon, 0, i * 16);
          ctx.fillText(v.label, 24, i * 16 + 8);
        }
      }
      console.log(canvas);
      const a = elt("a", { href: canvas.toDataURL(), download: "legend.png" });
      a.click();
      a.remove();
    });
  }
}
