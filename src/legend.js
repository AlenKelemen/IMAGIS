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
    this.setContent();
    this.map.getView().on("change:resolution", (evt) => this.setContent());

    this.iconSize = options.iconSize || [16, 16]; //legend icons size
    this.symbols = {
      polygon: new Polygon([
        [
          [0, 0],
          [this.iconSize[0], 0],
          [this.iconSize[0], this.iconSize[1]],
          [0, this.iconSize[1]],
          [0, 0],
        ],
      ]),
      linestring: new LineString([
        [0, 0],
        [this.iconSize[0], this.iconSize[1]],
      ]),
      point: new Point([this.iconSize[0] / 2, this.iconSize[1] / 2]),
    };
    this.image.addEventListener("click", (evt) => this.getLegendImage());
    this.loadImage = (url, thematic = false, thematicText) =>
      new Promise((resolve, reject) => {
        const icon = elt("canvas", { className: `icon`, width: 100, height: 16});
        const ctx = icon.getContext("2d");
        const img = new Image();
        img.addEventListener("load", () => {
          thematic ? ctx.drawImage(img, 0, 0, img.width, img.height, 16, 0, 16,16) :ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16,16); 
          ctx.textBaseline = 'middle';
          thematic ? ctx.fillText(thematicText, 40, 8):ctx.fillText(thematicText, 24, 8);
          resolve({ icon: icon });
        });
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });
  }

  getLegendImage(legendSize = [400, 400], font = "12px Verdana") {
    const legendImage = elt("canvas", { className: `icon`, width: legendSize[0], height: legendSize[1] });
    const lictx = legendImage.getContext("2d");
    const icons = [];
    const res = this.map.getView().getResolution();
    lictx.textBaseline = "middle";
    const make = (layer) => {
      const inRes = res <= layer.getMaxResolution() && res >= layer.getMinResolution();
      if (layer.getVisible() && inRes) {
        if (layer instanceof TileLayer) icons.push(this.loadImage(images.lc_raster));
        if (layer instanceof VectorLayer) {
          const style = layer.getStyle().call(this, undefined, res);
          const item = (style, thematic = false,thematicText) => {
            if (style.getImage() && style.getImage() instanceof Icon) icons.push(this.loadImage(style.getImage().getSrc()));
            else
              icons.push(
                new Promise((resolve, reject) => {
                  const icon = elt("canvas", { className: `icon`, width: 100, height: 16 });
                  const ctx = icon.getContext("2d");
                  const vctx = toContext(ctx, {
                    size: [16,16]//this.iconSize,
                  });
                  vctx.setStyle(style);
                  if (style.getFill()) vctx.drawGeometry(this.symbols.polygon);
                  if (!style.getFill() && style.getStroke()) vctx.drawGeometry(this.symbols.linestring);
                  vctx.drawGeometry(this.symbols.point);
                  resolve({ icon: icon });
                })
              );
          };
          if (style.length === 1) item(style[0]);
          if (style.length > 1) {
            icons.push(this.loadImage(images.lc_theme));
            for (const s of style) item(s, true);
          }
        }
      }
    };
    this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse()
      .map((x) => make(x));

    Promise.all(icons).then((res) => {
      for (const [i, v] of res.entries()) {
        lictx.drawImage(v.icon, 16, i * 16);
      }
      const a = elt("a", { href: legendImage.toDataURL(), download: "legend.png" });
      a.click();
      a.remove();
    });
  }

  setContent() {
    this.main.innerHTML = "";
  }
  loadImage_(icon, src, callback) {
    const img = new Image();
    const ctx = icon.getContext("2d");
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
      if (callback) callback.call(this, icon);
    };
    img.src = src;
  }
}
