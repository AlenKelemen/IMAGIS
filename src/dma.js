import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import VectorLayer from "ol/layer/Vector";
import { point, segment, circle, polygon } from "@flatten-js/core";

export default class DMA extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-share-square"></i>';
    super(options);
    const srcName = options.srcName || "VodoopskrbaMjernaZona"; //
    this.container = new Container({
      semantic: "section",
      className: `taskpane no-header no-footer`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    this.mzLayer = this.map
      .getLayers()
      .getArray()
      .find((x) => x.getSource().get("name") === srcName);
    if (!this.mzLayer || this.mzLayer instanceof VectorLayer === false) return;
    const src = this.mzLayer.getSource();
    src.once("change", (evt) => {
      if (src.getState() === "ready") {
        //console.log(src.getFeatures());
        this.content(src.getFeatures());
      }
    });
  }
  content(features) {
    const fo = features.filter((x) => x.get("napomena") !== "Glavne").sort((a, b) => a.get("naziv").toLowerCase().localeCompare(b.get("naziv").toLowerCase()));
    for (const f of fo) {
      const btnLocate = elt("button", {}, elt("i", { className: "far fa-map-marker-alt fa-fw" }), elt("span", {}, " Prikaži"));
      const stats = elt("div", { className: "stats-info" }, elt("table", {}));
      const locate = elt("ul", { className: "nested" }, elt("li", {}, btnLocate, stats));
      btnLocate.setAttribute("data-name", f.getId());
      const label = elt("li", {}, elt("span", { className: "caret" }, f.get("naziv") || ""), locate);
      const item = elt("ul", { className: "item" }, label);
      this.main.appendChild(item);
      //fit
      btnLocate.addEventListener("click", (evt) => {
        //console.log(evt.currentTarget.dataset.name);
        const extent = f.getGeometry().getExtent();
        this.map.getView().fit(extent);
      });
      //stats
      let a = "";
      if (f.getGeometry().getType() === "Polygon") {
        a = f.getGeometry().getArea();
        a = (a / 1000).toFixed(0);
      }
      const area = elt("tr", {}, elt("td", {}, "Površina m2"), elt("td", {}, a));
      stats.appendChild(area);
      const vod = this.map
        .getLayers()
        .getArray()
        .find((x) => x.get("name") === "vod")
        .getSource();

      vod.once("change", (evt) => {
        if (vod.getState() === "ready") {
          const statVod = vod.getFeatures().filter((x) => x.get("MjernaZona") === f.get("naziv"));
          let sumLength = statVod.reduce((sumLength, cv,) => sumLength + cv.getGeometry().getLength(),0).toFixed(0);
          const length = elt("tr", {}, elt("td", {}, "Dužina cjevovoda m"), elt("td", {}, sumLength || ""));
          stats.appendChild(length);
        }
      });
      const pmo = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("name") === "pmo")
      .getSource();
      pmo.once("change", (evt) => {
        if (pmo.getState() === "ready") {
          const statPmo = pmo.getFeatures().filter((x) => x.get("MjernaZona") === f.get("naziv"));
          const count = elt("tr", {}, elt("td", {}, "Broj priključaka"), elt("td", {}, pmo.getFeatures().length));
          stats.appendChild(count);
        }
      });
    //toggle caret
    const toggler = this.main.getElementsByClassName("caret");
    for (let i = 0; i < toggler.length; i++) {
      toggler[i].addEventListener("click", function () {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
      });
    }
  }
}
