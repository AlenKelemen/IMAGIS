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
    const promises = [this.query("mjernaZona"), this.query("vod"), this.query("pmo"), this.query("hidrant")];
    Promise.all(promises).then((r) => {
      const mZ = r[0].getFeatures(); //mjernaZona
      this.content(mZ);
    });
  }
  getInside(feature, layer) {
    if (feature.getGeometry().getType() !== "Polygon") return;
    const p = polygon(feature.getGeometry().getCoordinates());
    let sumLength = 0;
    const insideFeat = [];
    for (const f of layer.getSource().getFeatures()) {
      let flag = false;
      let g = f.getGeometry();
      if (g.getType() === "Point") {
        try {
         
        const intersect = p.intersect(point(g.getFirstCoordinate()));
        
        if (intersect.length > 0) {
          insideFeat.push(f);
        }
      }catch (err) {}
      }
      if (g.getType() === "LineString") {
        g.forEachSegment((s, e) => {
          try {
            const ls = segment(point(s), point(e));
            if (p.contains(ls)) flag = true;
            else flag = false;
          } catch (err) {}
        });
      }
      if (flag) {
        sumLength = sumLength + g.getLength();
        insideFeat.push(f);
      }
    }
    sumLength = (sumLength * 0.001).toFixed(1);
    return { features: insideFeat, length: sumLength };
  }
  getArea(polygon) {
    if (polygon.getGeometry().getType() !== "Polygon") return;
    return (polygon.getGeometry().getArea() * 0.001).toFixed(0);
  }
  content(mZ) {
    const mZSort = mZ.filter((x) => x.get("napomena") !== "Glavne").sort((a, b) => a.get("naziv").toLowerCase().localeCompare(b.get("naziv").toLowerCase()));
    for (const f of mZSort) {
      const consValue=elt("td", {}, "0");
      const cons = elt("tr", {}, elt("td", {}, "Potrošnja m3/mjesec"), consValue);
      const ngsgValue = elt("td", {}, "");
      let unit = elt("td", {}, "NGSG m3/(priključak * dan)");
      const NGSG = elt("tr", {}, unit, elt("td", {}, ngsgValue)); //neizbježni godišnji stvarni gubitci
      const pValue = elt("input", {});
      pValue.value = 30;
      const p = elt("tr", {}, elt("td", {}, "Prosječan tlak mVs"), elt("td", {}, pValue)); //pressure
      const clValue = elt("td", {}, "0");
      const cl = elt("tr", {}, elt("td", {}, "Priključaka/km"), clValue); //connections/km
      const countValue = elt("td", {}, "0");
      const count = elt("tr", {}, elt("td", {}, "Broj priključaka"), countValue);
      const lengthValue = elt("td", {}, "0");
      const length = elt("tr", {}, elt("td", {}, "Dužina mreže km"), lengthValue);
      const area = elt("tr", {}, elt("td", {}, "Površina m2"), elt("td", {}, this.getArea(f)));
      const tbl = elt("table", {}, area, length, count, cl, p, NGSG,cons);
      const container = elt("div", { className: "container" }, tbl);
      container.style.display = "none";
      const btn = elt("button", {}, f.get("naziv"));
      const item = elt("div", { className: "item" }, btn, container);
      item.setAttribute("data-id", f.getId());
      item.setAttribute("data-name", f.get("naziv"));
      this.main.appendChild(item);
      btn.addEventListener("click", (evt) => {
        container.style.display = container.style.display === "none" ? "block" : "none";
        if (container.style.display === "block") this.map.getView().fit(f.getGeometry().getExtent());
        const layers = this.map.getLayers().getArray();
        const insideVod = this.getInside(
          f,
          layers.find((x) => x.get("name") === "vod")
        );
        lengthValue.innerHTML = insideVod.length;
        const insidePmo = this.getInside(
          f,
          layers.find((x) => x.get("name") === "pmo")
        );
        countValue.innerHTML = insidePmo.features.length;
        clValue.innerHTML = (insidePmo.features.length / insideVod.length).toFixed(1);
        const lm = insideVod.length;
        const nc = insidePmo.features.length;
        const lp = nc * 0.02;
        const p = pValue.value;
        if (insidePmo.features.length / insideVod.length >= 20) unit.innerHTML = "NGSG m3/(km * dan)";
        let ngsgCal = ((18 * lm + 0.8 * nc + 25 * lp) * p) / lm;
        if (insidePmo.features.length / insideVod.length >= 20) ngsgCal = (18 * lm + 0.8 * nc + 25 * lp * p) / nc;
        ngsgValue.innerHTML = ngsgCal.toFixed(0);
        //
        let cV = 0;//potrošnja m3/mjesec
        for(const pmo of insidePmo.features){
          cV = cV + pmo.get('UTROSAK');
        }
        consValue.innerHTML = cV;
        console.log(cV)
      });
     
    }
  }

  query(layerName = "mjernaZona") {
    const layer = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("name") === layerName);
    return new Promise(function (resolve, reject) {
      if (!layer) reject();
      const visible = layer.getVisible();
      layer.setVisible(true); //to be loaded!!
      const src = layer.getSource();
      src.once("change", (evt) => {
        layer.setVisible(visible);
        if (src.getState() === "ready") {
          resolve(src);
        }
      });
    });
  }
}
