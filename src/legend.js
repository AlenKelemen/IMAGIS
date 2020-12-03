import Control from "ol/control/Control";
import VectorLayer from "ol/layer/Vector";
import Sortable from "sortablejs";
const images = require("../img/*.gif");
/** Container for controls
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string} options.className
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {html element} options.target target element to insert legend dialog
 * @param {function} options.handleClick callback when control is clicked
 
 */
export default class Legend extends Control {
  constructor(options = {}) {
    super({
      element: document.createElement("button")
    });
    this.element.className = options.className; //
    this.element.innerHTML = options.html; //
    this.element.title = options.tipLabel; //

    //legend dialog
    this.content = document.createElement("div");
    this.content.className = "legend";
    if (options.target) options.target.appendChild(this.content);

    const evtFunction = evt => {
      if (this.getParent()) this.getParent().deactivateControls(this); //see navbar.js for deactivateControls
      if (evt && evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
        this.setActive(!this.getActive());
        if (options.handleClick) options.handleClick.call(this, evt);
      }
    };
    this.element.addEventListener("click", evtFunction);
  }

  legend_() {
    //in legend one can change layer opacitiy, visibility, zIndex, active property
    const list = document.createElement("div");
    list.className = "legend-items";
    this.content.appendChild(list);
    const ls = this.getMap()
      .getLayers()
      .getArray()
      .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
      .reverse(); //sort layers by index
    for (const [i, l] of ls.entries()) {
      const item = document.createElement("div");
      list.appendChild(item);
      item.id = l.get("name") || "sloj " + i;
      l.set("name", item.id);
      item.innerHTML = `
                <div class="header">
                    <span class="icon" title="Rasterska podloga"><img src="${
                      images.lc_raster
                    }"></span>
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
      // show thematic legend on click
      item.querySelector(".icon").addEventListener("click", evt => {
        const e = item.querySelector(".thematic");
        e.style.display = e.style.display === "none" ? "block" : "none";
      });
      //  resolution/visibility zoom depending
      const min = l.getMinResolution() || 0;
      const max = l.getMaxResolution() || Infinity;
      this.getMap()
        .getView()
        .on("change:resolution", () => {
          const res = this.getMap()
            .getView()
            .getResolution();
          item.style.display = res >= min && res <= max ? "block" : "none";
        });
      map.getView().dispatchEvent("change:resolution");
      // opacity ! changes layer opacity
      item.querySelector(".opacity").value = l.getOpacity();
      item.querySelector(".opacity").addEventListener("change", evt => {
        l.setOpacity(Number(item.querySelector(".opacity").value));
      });
      //  info
      item.querySelector(".info").innerHTML = l.get("info") || "";
      //  expand/shrink content
      item.querySelector(".header .detail").addEventListener("click", evt => {
        const content = item.querySelector(".content");
        content.style.display =
          content.style.display === "none" ? "block" : "none";
        evt.currentTarget.innerHTML =
          content.style.display === "none"
            ? '<i class="far fa-plus fa-fw"></i>'
            : '<i class="far fa-minus fa-fw"></i>';
      });
      //  show/hide on click ! changes layer visibility
      item.querySelector(".header .visible").innerHTML = l.getVisible()
        ? '<i class="far fa-eye fa-fw"></i>'
        : '<i class="far fa-eye-slash fa-fw"></i>';
      item.querySelector(".header .visible").addEventListener("click", evt => {
        l.setVisible(!l.getVisible());
        evt.currentTarget.innerHTML = l.getVisible()
          ? '<i class="far fa-eye fa-fw"></i>'
          : '<i class="far fa-eye-slash fa-fw"></i>';
      });
      //  active/inactive (for single layer select & similar action) ! changes layer active property
      const active = item.querySelector(".header .active");
      if (l instanceof VectorLayer === false)
        active.style.visibility = "hidden";
      active.innerHTML = l.get("active")
        ? '<i class="far fa-check-square fa-fw"></i>'
        : '<i class="far fa-square fa-fw"></i>';
      active.addEventListener("click", evt => {
        const oldValue = l.get("active");
        for (const l_ of ls) {
          l_.set("active", false);
        }
        for (const i of list.querySelectorAll(".header .active")) {
          i.innerHTML = '<i class="far fa-square fa-fw"></i>';
        }
        l.set("active", !oldValue);
        active.innerHTML = l.get("active")
          ? '<i class="far fa-check-square fa-fw"></i>'
          : '<i class="far fa-square fa-fw"></i>';
        this.getMap()
          .getLayers()
          .set("active", l.get("active") ? l : null);
      });
      //icons
      this.getMap()
        .getView()
        .on("change:resolution", () => {
          //if (item.style.display !== 'none')
          //this.getIcons(l, item.querySelector('.icon'), item.querySelector('.thematic'));
        });
      l.on("change:opacity", evt => {
        item.querySelector(".icon").style.opacity = evt.target.getOpacity();
      });
      if (l.get("def")) {
        // set layer properties to def if def exists
        l.on("propertychange", evt => {
          l.get("def").zIndex = evt.target.getZIndex();
          l.get("def").visible =
            evt.target.getVisible() === undefined
              ? true
              : evt.target.getVisible();
          l.get("def").opacity =
            evt.target.getOpacity() === undefined ? 1 : evt.target.getOpacity();
          l.get("def").active =
            evt.target.get("active") === undefined
              ? false
              : evt.target.get("active");
          //localStorage.setItem('def', JSON.stringify(this.getMap().get('def')));
        });
      }
    }
    //  z-order
    Sortable.create(list, {
      handle: ".sort",
      onEnd: evt => {
        for (let i = 0; i < list.children.length; i++) {
          const layer = ls.find(x => x.get("name") === list.children[i].id);
          layer.setZIndex(list.children.length - i);
        }
      }
    });
  }
  setActive(b) {
    if (this.content.innerHTML === "") this.legend_();
    if (this.getActive() == b) return;
    if (b) {
      this.content.classList.add("active");
      this.element.classList.add("active");
      if (this.getParent()) this.getParent().deactivateControls(this); //see container.js for deactivateControls
    } else {
      this.content.classList.remove("active");
      this.element.classList.remove("active");
    }
    this.dispatchEvent({
      type: "change:active",
      key: "active",
      oldValue: !b,
      active: b
    });
  }
  getActive() {
    return this.element.classList.contains("active");
  }
  getParent() {
    if (this.get("parent")) return this.get("parent");
  }
}
