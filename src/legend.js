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
    //thematic = true moves icon 16px to right, text right of icon (label text)
    this.loadImage = (url, thematic = false, text = "") =>
      new Promise((resolve, reject) => {
        const icon = elt("canvas", { width: 200, height: 16 });
        text ? (icon.width = 200) : (icon.width = 16); //text ='' > no need for wide icon
        const ctx = icon.getContext("2d");
        const img = new Image();
        img.addEventListener("load", () => {
          thematic ? ctx.drawImage(img, 0, 0, img.width, img.height, 16, 0, 16, 16) : ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
          ctx.textBaseline = "middle";
          thematic ? ctx.fillText(text, 40, 8) : ctx.fillText(text, 24, 8);
          resolve({ icon: icon });
        });
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });
    this.setContent();
    this.map.getView().on("change:resolution", (evt) => this.setContent());
  }

  setContent() {
    const icons = [];
    const layer = this.map.getLayers().item(0);

    if (layer instanceof TileLayer) icons.push(this.loadImage(images.lc_raster, false));

    Promise.all(icons).then((res) => {
      this.main.innerHTML = "";
      for (const [i, v] of res.entries()) {
        const item = elt("div", { className: "item" }, v.icon, elt("span", {}, layer.get("label") || layer.get("name")));
        this.main.appendChild(item);
        const res = this.map.getView().getResolution();
        const inRes = res <= layer.getMaxResolution() && res >= layer.getMinResolution();
        if (layer.getVisible() && inRes) item.style.opacity = "1";
        else item.style.opacity = "0.4";
      }
    });
  }

  getLegendImage(background = "white", size = [200, 200], font = "12px Verdana") {
    const legendImage = elt("canvas", { width: size[0], height: size[1] });
    const lictx = legendImage.getContext("2d");
    const icons = [];
    const res = this.map.getView().getResolution();
    lictx.textBaseline = "middle";
    const make = (layer) => {
      const inRes = res <= layer.getMaxResolution() && res >= layer.getMinResolution();
      if (layer.getVisible() && inRes) {
        if (layer instanceof TileLayer) icons.push(this.loadImage(images.lc_raster, false, layer.get("label") || layer.get("name")));
        if (layer instanceof VectorLayer) {
          const style = layer.getStyle().call(this, undefined, res);
          const item = (style, thematic = false, text = "") => {
            if (style.getImage() && style.getImage() instanceof Icon) icons.push(this.loadImage(style.getImage().getSrc(), thematic, layer.get("label") || layer.get("name")));
            else
              icons.push(
                new Promise((resolve, reject) => {
                  const ex = elt("canvas", { width: 400, height: 16 });
                  const eCtx = ex.getContext("2d");
                  const icon = elt("canvas", { width: 16, height: 16 });
                  const ctx = icon.getContext("2d");
                  const vctx = toContext(ctx, {
                    size: [16, 16], //iconSize,
                  });
                  vctx.setStyle(style);
                  if (style.getFill()) vctx.drawGeometry(this.symbols.polygon);
                  if (!style.getFill() && style.getStroke()) vctx.drawGeometry(this.symbols.linestring);
                  vctx.drawGeometry(this.symbols.point);
                  if (thematic) {
                    eCtx.drawImage(icon, 16, 0);
                  }
                  thematic ? eCtx.drawImage(icon, 16, 0) : eCtx.drawImage(icon, 0, 0);
                  ctx.textBaseline = "middle";
                  thematic ? eCtx.fillText(text, 40, 8) : eCtx.fillText(text, 24, 8);
                  resolve({ icon: ex });
                })
              );
          };
          if (style.length === 1) item(style[0], false, layer.get("legend") || layer.get("name"));
          if (style.length > 1) {
            icons.push(this.loadImage(images.lc_theme, false, layer.get("label") || layer.get("name")));
            for (const [i, s] of style.entries()) {
              const f = layer.get("imagis-style")[i].filter;
              const text = `${f.property} ${f.operator}  ${f.value} `;
              item(s, true, text);
            }
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
      legendImage.height = res.length * 16;
      lictx.fillStyle = background;
      lictx.fillRect(0, 0, legendImage.width, legendImage.height);
      for (const [i, v] of res.entries()) {
        lictx.drawImage(v.icon, 16, i * 16);
      }
      const a = elt("a", { href: legendImage.toDataURL(), download: "legend.png" });
      a.click();
      a.remove();
    });
  }
}
