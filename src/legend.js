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
      console.log(this.content, item);
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
                        <span class="active" title="Aktivnost sloja"><i class="far fa-square fa-fw"></i></span>
                        <span class="sort" title="Z index"><i class="far fa-bring-forward fa-fw"></i></span>
                        <div class="content" style="display:none">
                            <span><i class="far fa-fog" title="Prozirnost"></i></span>
                            <span><input type="range" min=0 max=1 step=0.01 class="opacity"></span>
                            <div class="info"></div>
                        </div>
                    </div> 
                </div>
                `;
    }
  }
  addHeader(innerHtml) {
    const header = document.createElement("header");
    header.className = "legend-header";
    header.innerHTML = innerHtml;
    this.container.element.appendChild(header);
  }
}
