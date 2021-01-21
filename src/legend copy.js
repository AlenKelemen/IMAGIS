import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Control from "ol/control/Control";
import Container from "./container";
import Toggle from "./toggle";
import VectorLayer from "ol/layer/Vector";
import { toContext } from "ol/render";
import { LineString, Point, Polygon } from "ol/geom";
import { Icon, Style } from "ol/style";
import Sortable from "sortablejs";
const images = require("../img/*.gif");
/** Legend
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 * @param {ol/control} options.target container target
 */
export default class containerToggle extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    this.addHeader("Legenda");
    options.target.addControl(this.container);
    this.content = document.createElement("section");
    this.content.className = "legend-content";
    this.container.element.appendChild(this.content);
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
        this.contentUpdate();
      } else {
        this.container.element.classList.remove("active");
      }
    });
  }
  activeLayerInfo(options) {
    const activeInfo = new Control({
      element: document.createElement("div"),
    });
    
    if(options.targetControl)options.targetControl.addControl(activeInfo); else this.getMap().addControl(activeInfo);
    activeInfo.element.className = options.className || "active-info";
    const active = this.getMap()
      .getLayers()
      .getArray()
      .find((x) => x.get("active"));
    if (active) activeInfo.element.innerHTML = "aktivni sloj: " + active.get("label") || active.get("name");
    else activeInfo.element.style.display = "none";
    this.getMap()
      .getLayers()
      .on("propertychange", (evt) => {
        const active = evt.target.get("active");
        if (active) {
          activeInfo.element.style.display = "inline-block";
          activeInfo.element.innerHTML = "aktivni sloj: " + active.get("label") || active.get("name");
        } else {
          activeInfo.element.style.display = "none";
        }
      });
  }
  contentUpdate() {
    this.content.innerHTML = "";
    const ls = this.getMap()
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse(); //sort layers by index
    for (const [i, l] of ls.entries()) {
      const item = document.createElement("div");
      this.content.appendChild(item);
      item.id = l.get("name") || "sloj " + i;
      l.set("name", item.id);
      item.innerHTML = `
                <div class="header">
                    <span class="icon" title="Rasterska podloga"><img src="${images.lc_raster}"></span>
                    <span class="label">${l.get("label") || item.id}</span>
                    <div class="thematic"></div>
                    <div class="sub">
                        <span class="detail" title="Detalji"><i class="far fa-plus fa-fw"></i></span>
                        <span class="visible" title="Vidljivost sloja"><i class="far fa-eye fa-fw"></i></span>
                        <span class="active-layer" title="Aktivnost sloja"><i class="far fa-square fa-fw"></i></span>
                        <span class="sort" title="Z index"><i class="far fa-bring-forward fa-fw"></i></span>
                        <div class="content" style="display:none">
                            <span><i class="far fa-fog" title="Prozirnost"></i></span>
                            <span><input type="range" min=0 max=1 step=0.01 class="opacity"></span>
                            <div class="info"></div>
                        </div>
                    </div> 
                </div>
                `;
      // show thematic legend on icon click
      item.querySelector(".icon").addEventListener("click", (evt) => {
        const e = item.querySelector(".thematic");
        e.style.display = e.style.display === "none" ? "block" : "none";
      });
      //  resolution/visibility zoom depending
      const min = l.getMinResolution() || 0;
      const max = l.getMaxResolution() || Infinity;
      this.getMap()
        .getView()
        .on("change:resolution", () => {
          const res = this.getMap().getView().getResolution();
          item.style.display = res >= min && res <= max ? "block" : "none";
        });
      map.getView().dispatchEvent("change:resolution");
      // opacity ! changes layer opacity
      item.querySelector(".opacity").value = l.getOpacity();
      item.querySelector(".opacity").addEventListener("change", (evt) => {
        l.setOpacity(Number(item.querySelector(".opacity").value));
      });
      //  info
      item.querySelector(".info").innerHTML = l.get("info") || "";
      //  expand/shrink content
      item.querySelector(".header .detail").addEventListener("click", (evt) => {
        const content = item.querySelector(".content");
        content.style.display = content.style.display === "none" ? "block" : "none";
        evt.currentTarget.innerHTML = content.style.display === "none" ? '<i class="far fa-plus fa-fw"></i>' : '<i class="far fa-minus fa-fw"></i>';
      });
      //  show/hide on click ! changes layer visibility
      item.querySelector(".header .visible").innerHTML = l.getVisible() ? '<i class="far fa-eye fa-fw"></i>' : '<i class="far fa-eye-slash fa-fw"></i>';
      item.querySelector(".header .visible").addEventListener("click", (evt) => {
        l.setVisible(!l.getVisible());
        evt.currentTarget.innerHTML = l.getVisible() ? '<i class="far fa-eye fa-fw"></i>' : '<i class="far fa-eye-slash fa-fw"></i>';
      });
      //  active/inactive (for single layer select & similar action) ! changes layer active property
      const active = item.querySelector(".header .active-layer");
      if (l instanceof VectorLayer === false) active.style.visibility = "hidden";
      active.innerHTML = l.get("active") ? '<i class="far fa-check-square fa-fw"></i>' : '<i class="far fa-square fa-fw"></i>';
      active.addEventListener("click", (evt) => {
        const oldValue = l.get("active");
        for (const l_ of ls) {
          l_.set("active", false);
        }
        for (const i of this.content.querySelectorAll(".header .active-layer")) {
          i.innerHTML = '<i class="far fa-square fa-fw"></i>';
        }
        l.set("active", !oldValue);
        active.innerHTML = l.get("active") ? '<i class="far fa-check-square fa-fw"></i>' : '<i class="far fa-square fa-fw"></i>';
        this.getMap()
          .getLayers()
          .set("active", l.get("active") ? l : null);
      });
      this.getMap()
        .getView()
        .on("change:resolution", () => {
          if (item.style.display !== "none") this.getIcons(l, item.querySelector(".icon"), item.querySelector(".thematic"));
        });
      l.on("change:opacity", (evt) => {
        item.querySelector(".icon").style.opacity = evt.target.getOpacity();
      });
      if (l.get("def")) {
        // set layer properties to def if def exists
        l.on("propertychange", (evt) => {
          l.get("def").zIndex = evt.target.getZIndex();
          l.get("def").visible = evt.target.getVisible() === undefined ? true : evt.target.getVisible();
          l.get("def").opacity = evt.target.getOpacity() === undefined ? 1 : evt.target.getOpacity();
          l.get("def").active = evt.target.get("active") === undefined ? false : evt.target.get("active");
          //localStorage.setItem('def', JSON.stringify(this.getMap().get('def')));
        });
      }
      //  z-order
    Sortable.create(this.content, {
      handle: ".sort",
      onEnd: (evt) => {
        for (let i = 0; i < this.content.children.length; i++) {
          const layer = ls.find((x) => x.get("name") === this.content.children[i].id);
          layer.setZIndex(this.content.children.length - i);
        }
      },
    });
    }
  }
  addHeader(innerHtml) {
    const header = document.createElement("header");
    header.className = "legend-header";
    header.innerHTML = innerHtml;
    this.container.element.appendChild(header);
  }
  /** Get icons for layer - from div json & attaches to container */
  getIcons(layer, singleStyleContaner, multipleStyleContainer, iconSize = [16, 16]) {
    if (layer instanceof VectorLayer === false) return;
    singleStyleContaner.title = "";
    multipleStyleContainer.innerHTML = "";
    const thematic = this.styleObj(layer).length > 1; // more styles => show in rows
    for (const [i, style] of this.styleObj(layer).entries()) {
      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        vectorContext = toContext(context, {
          size: iconSize,
        }),
        emptyStyle = style.getImage() === null && style.getText() === null && style.getFill() === null && style.getStroke() === null;
      if (thematic) {
        singleStyleContaner.innerHTML = `<img src="${images.lc_theme}">`;
        singleStyleContaner.title = `Otvori detaljnu legendu`;
        const div = document.createElement("div"),
          span = document.createElement("span");
        div.appendChild(canvas);
        div.appendChild(span);
        if (!emptyStyle) {
          multipleStyleContainer.appendChild(div);
          if (layer.get("def") && layer.get("def").style && layer.get("def").style.filter) {
            const filter = layer.get("def").style[i].filter;
            if (filter) span.innerHTML = filter.property + " " + filter.operator + " " + filter.value;
          }
        }
      } else {
        singleStyleContaner.innerHTML = "";
        singleStyleContaner.appendChild(canvas);
      }
      vectorContext.setStyle(style);
      if (style.getFill() !== null) {
        vectorContext.drawGeometry(
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
      } else {
        vectorContext.drawGeometry(
          new LineString([
            [2, 2],
            [iconSize[0] - 2, iconSize[1] - 2],
          ])
        );
      }
      const img = style.getImage(); /**can have image in every geomType */
      if (img) {
        if (img instanceof Icon) {
          const image = new Image();
          image.onload = () => {
            const newStyle = new Style({
              image: new Icon({
                img: image,
                imgSize: [image.width, image.height],
                scale: Math.min(iconSize[0] / image.width, iconSize[1] / image.height),
              }),
            });
            vectorContext.setStyle(newStyle);
            vectorContext.drawGeometry(new Point([iconSize[0] / 2, iconSize[1] / 2]));
          };
          image.src = img.getSrc();
        } else {
          const legendStyle = style.clone();
          // legendStyle.getImage().setScale(Math.min((iconSize[0] / legendStyle.getImage().getSize()[0]), (iconSize[1] / legendStyle.getImage().getSize()[1])))
          legendStyle.getImage().setScale(Math.min(iconSize[0] / (2 * legendStyle.getImage().getRadius()), iconSize[1] / (2 * legendStyle.getImage().getRadius())));
          vectorContext.setStyle(legendStyle);
          vectorContext.drawGeometry(new Point([iconSize[0] / 2, iconSize[1] / 2]));
        }
      }
    }
  }
  /** Get style as array of object */
  styleObj(layer) {
    if (layer instanceof VectorLayer) {
      const style = typeof layer.getStyle() === "function" ? layer.getStyle().call(this, undefined, this.getMap().getView().getResolution()) : layer.getStyle();
      return Array.isArray(style) ? style : [style];
    } else return null;
  }
}