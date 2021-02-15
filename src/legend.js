import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import { toContext } from "ol/render";
import { Icon, Style } from "ol/style";
import { LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
import { keys } from "regenerator-runtime";
import Sortable from "sortablejs";
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
    this.hideButton = elt("button", { className: "hide" }, elt("i", { className: "far fa-lightbulb-on fa-fw" }));
    this.saveButton = elt("button", { className: "edit" }, elt("i", { className: "far fa-save fa-fw" }));
    this.footer = elt("footer", { className: `footer ol-control` }, this.image, this.hideButton, this.saveButton);
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
    this.image.addEventListener("click", (evt) => this.getLegendImage(this.map.getView().getResolution()));
    this.hideButton.addEventListener("click", (evt) => this.togglelHide());
    this.saveButton.addEventListener("click", (evt) => this.save());
    this.hide = false;
    if (options.hide) this.togglelHide();
    this.setContent(this.map.getView().getResolution());
    this.map.getView().on("change:resolution", (evt) => this.setContent(evt.target.getResolution()));
  }
  //save to cfg.json
  save() {
    if(map.config) localStorage.setItem("cfg", JSON.stringify(map.config.read()));
  }
  activeLayerInfo(options) {
    const activeInfo = new Control({
      element: elt("div", { className: "active-layer-info" }),
    });
    if (options.targetControl) options.targetControl.addControl(activeInfo);
    else this.map.addControl(activeInfo);
    const active = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("active"));
    if (active) activeInfo.element.innerHTML = "aktivni sloj: " + active.get("label") || active.get("name");
    else activeInfo.element.style.display = "none";
    //active layer property of layers collection (null if no layer active)
    this.map.getLayers().on("propertychange", (evt) => {
      const active = evt.target.get("active");
      if (active) {
        activeInfo.element.style.display = "inline-block";
        activeInfo.element.innerHTML = "aktivni sloj: " + active.get("label") || active.get("name");
      } else {
        activeInfo.element.style.display = "none";
      }
    });
  }
  setContent(resolution) {
    const promises = this.getItemsContent(resolution);
    this.itemElements = [];
    Promise.all(promises).then((r) => {
      this.main.innerHTML = "";
      this.items = r.filter((x) => x.thematic === false);
      const thematicItems = r.filter((x) => x.thematic === true);
      for (const i of this.items) {
        const layer = i.layer;
        const icon = i.icon;
        const label = i.label;
        const head = elt("div", { className: "head" }, icon, elt("span", {}, label));
        const thematic = elt("div", { className: "thematic" });
        const t = thematicItems.filter((x) => x.layer === layer);
        for (const ti of t) thematic.appendChild(elt("div", {}, ti.icon, elt("span", {}, ti.label)));
        const plus = elt("span", {}, elt("i", { className: "far fa-plus fa-fw" }));
        const visibility = elt("span", {}, elt("i", { className: "far fa-eye fa-fw" }));
        const active = elt("span", { className: "active" }, elt("i", { className: "far fa-square fa-fw" }));
        active.setAttribute("data-name", layer.get("name"));
        const sort = elt("span", { className: "sort" }, elt("i", { className: "far fa-bring-forward fa-fw" }));
        const tools = elt("div", { className: "tools" }, plus, visibility, active, sort);
        const opacity = elt("input", { type: "range", min: "0", max: "1", step: "0.01" });
        const info = elt("div", { className: "info" });
        const detail = elt("div", { className: "detail" }, elt("i", { className: "far fa-fog fa-fw" }), opacity, info);
        const item = elt("div", { className: "item" }, head, thematic, tools, detail);
        item.setAttribute("data-name", layer.get("name"));
        this.main.appendChild(item);
        //active: set active layer to work with (selection, draw, stats, ...)
        if (layer instanceof VectorLayer === false) active.style.visibility = "hidden";
        active.innerHTML = layer.get("active") ? '<i class="far fa-check-square fa-fw"></i>' : '<i class="far fa-square fa-fw"></i>';
        active.addEventListener("click", (evt) => {
          const layers = this.map.getLayers().getArray();
          const e = this.main.querySelectorAll(".active");
          const currentLayer = layers.find((x) => x.get("name") === active.dataset.name);
          for (const i of e) i.innerHTML = '<i class="far fa-square fa-fw"></i>';
          for (const layer of layers) if (layer !== currentLayer) layer.set("active", false);
          currentLayer.set("active", !currentLayer.get("active"));
          evt.currentTarget.innerHTML = currentLayer.get("active") ? '<i class="far fa-check-square fa-fw"></i>' : '<i class="far fa-square fa-fw"></i>';
          //active layer property of layers collection (null if no layer active)
          this.map.getLayers().set("active", layer.get("active") ? layer : null);
        });
        //plus: show/hide additional tools/info in legend
        detail.style.display = "none";
        plus.addEventListener("click", (evt) => {
          detail.style.display = detail.style.display === "none" ? "block" : "none";
          evt.currentTarget.innerHTML = detail.style.display === "none" ? '<i class="far fa-plus fa-fw"></i>' : '<i class="far fa-minus fa-fw"></i>';
        });
        //opacity:
        opacity.value = layer.getOpacity();
        opacity.addEventListener("change", (evt) => {
          layer.setOpacity(Number(opacity.value));
        });
        //visibility: toggle layer visibility
        if (layer.getVisible()) visibility.firstChild.className = "far fa-eye fa-fw";
        else visibility.firstChild.className = "far fa-eye-slash fa-fw";
        visibility.addEventListener("click", (evt) => {
          if (!this.getVisible(layer)) return;
          layer.setVisible(!layer.getVisible());
          if (layer.getVisible()) visibility.firstChild.className = "far fa-eye fa-fw";
          else visibility.firstChild.className = "far fa-eye-slash fa-fw";
        });
        //hide/show layers with layer.getMaxResolution() && resolution > layer.getMinResolution())
        if (this.hide) item.style.display = this.getVisible(layer) ? "block" : "none";
        item.style.opacity = this.getVisible(layer) ? "1" : "0.4";
      }
      //sort: sort layer zIndex by dragging
      Sortable.create(this.main, {
        handle: ".sort",
        onEnd: (evt) => {
          for (let i = 0; i < this.main.children.length; i++) {
            const layer = this.map
              .getLayers()
              .getArray()
              .find((x) => x.get("name") === this.main.children[i].dataset.name);
            if (layer) layer.setZIndex(this.main.children.length - i);
          }
        },
      });
    });
  }
  togglelHide() {
    this.hide = !this.hide;
    if (this.hide) this.hideButton.firstChild.className = "far fa-lightbulb fa-fw";
    else this.hideButton.firstChild.className = "far fa-lightbulb-on fa-fw";
    const elements = Array.from(this.main.children);
    for (const l of this.map.getLayers().getArray()) {
      const visible = this.getVisible(l);
      const e = elements.find((x) => x.dataset.name === l.get("name"));
      if (e) {
        e.style.opacity = 1;
        e.style.display = "block";
        if (this.hide) {
          e.style.display = visible ? "block" : "none";
        } else {
          e.style.opacity = visible ? "1" : "0.4";
        }
      }
    }
  }
  drawIcon(style, label, thematic, layer) {
    if (!style || style.length) return;
    return new Promise((resolve, reject) => {
      const icon = elt("canvas", { width: 16, height: 16 });
      const ctx = icon.getContext("2d");
      const vctx = toContext(ctx, {
        size: [16, 16],
      });
      if (style.getFill()) {
        vctx.setStyle(style);
        vctx.drawGeometry(this.symbols.polygon);
      }
      if (!style.getFill() && style.getStroke()) {
        vctx.setStyle(style);
        vctx.drawGeometry(this.symbols.linestring);
      }
      if (style.getImage()) {
        if (style.getImage() instanceof Icon) {
          const img = new Image();
          img.addEventListener("load", () => {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
            resolve({ icon: icon, label: label, thematic: thematic, layer: layer });
          });
          img.src = style.getImage().getSrc();
        } else {
          vctx.setStyle(style);
          vctx.drawGeometry(this.symbols.point);
        }
      }
      resolve({ icon: icon, label: label, thematic: thematic, layer: layer });
    });
  }
  loadImage(url, label, thematic, layer) {
    return new Promise((resolve, reject) => {
      const icon = elt("canvas", { width: 16, height: 16 });
      const ctx = icon.getContext("2d");
      const img = new Image();
      img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
        resolve({ icon: icon, label: label, thematic: thematic, layer: layer });
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
  getItemsContent(resolution) {
    const promises = [];
    const layers = this.map
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse();
    for (const l of layers) {
      const labelsInfo = this.getLabels(l, this.getStyles(l, resolution));
      const stylesInfo = this.getStyles(l, resolution);
      const label = labelsInfo.label;
      if (!stylesInfo.styles.length) promises.push(this.loadImage(images.lc_raster, label, false, l));
      if (stylesInfo.styles.length > 1) promises.push(this.loadImage(images.lc_theme, label, false, l));
      for (const [i, style] of stylesInfo.styles.entries()) {
        if (labelsInfo.thematic[i]) label = labelsInfo.thematic[i];
        promises.push(this.drawIcon(style, label, labelsInfo.thematic.length !== 0, l));
      }
    }
    return promises;
  }
  getVisible(layer) {
    const resolution = this.map.getView().getResolution();
    return resolution < layer.getMaxResolution() && resolution > layer.getMinResolution();
  }
  getLegendImage(resolution) {
    const promises = this.getItemsContent(resolution);
    const legendImage = (items) => {
      const canvas = elt("canvas", { width: 300, height: 18 * items });
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.textBaseline = "middle";
      return canvas;
    };
    Promise.all(promises).then((r) => {
      const canvas = legendImage(r.length);
      const ctx = canvas.getContext("2d");
      const vr = r.filter((x) => this.getVisible(x.layer) && x.layer.getVisible());
      for (const [i, v] of vr.entries()) {
        if (v.thematic) {
          ctx.drawImage(v.icon, 16, i * 18);
          ctx.fillText(v.label, 40, i * 18 + 8);
        } else {
          ctx.drawImage(v.icon, 0, i * 18);
          ctx.fillText(v.label, 24, i * 18 + 8);
        }
      }
      const a = elt("a", { href: canvas.toDataURL(), download: "legend.png" });
      a.click();
      a.remove();
    });
  }
}
