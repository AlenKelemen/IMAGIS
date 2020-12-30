import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Control from "ol/control/Control";
import Container from "./container";
import Toggle from "./toggle";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Draw from "ol/interaction/Draw";
import { point, segment, circle, polygon } from "@flatten-js/core";

/** extended select interactions
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {Object} options.select ol/interaction/Select
 * @param {boolean} [options.clear = true] clear previous on selection
 * @param {ol/Style} style for selection rendering
 * @param {integer} [buffer=5] around rendered linestring in pixels
 */

export default class SelectEx extends Toggle {
  constructor(options = {}) {
    super(options);
    this.select = options.select; //
    this.clear = options.clear || true; //
    this.style = options.style; //
    this.buffer = options.buffer || 5; //
    this.container = new Container({
      semantic: "nav",
      className: options.contanerClassName,
    });
    options.target.addControl(this.container);
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
        this.vectorLayer.setMap(this.getMap());
      } else {
        this.container.element.classList.remove("active");
        this.container.deactivateControls();
        this.vectorLayer.setMap(null);
        this.vectorSource.clear();
      }
    });
    this.line = new Toggle({
      className: "select-line",
      html: '<i class="far fa-heart-rate"></i>',
      tipLabel: "Odaberi objekte koji sijeku nacrtanu liniju",
    });
    this.container.addControl(this.line);
    this.line.draw = new Draw({
      type: "LineString",
      source: this.vectorSource,
      style: this.style,
    });
    this.line.on("change:active", (evt) => {
      if (evt.active) {
        this.getMap().addInteraction(this.line.draw);
        this.line.draw.on("drawend", (evt) => {
          const activeLayer = this.getMap()
            .getLayers()
            .getArray()
            .find((x) => x.get("active"));
          evt.feature.getGeometry().forEachSegment((s, e) => {
            const sls = segment(point(s), point(e));
            for (const l of this.getMap()
              .getLayers()
              .getArray()
              .filter((x) => x instanceof VectorLayer && (x === activeLayer || activeLayer === undefined))) {
              for (const f of l.getSource().getFeatures()) {
                let g = f.getGeometry();
                try {
                  if (g.getType() === "Point") {
                    const intersect = sls.intersect(circle(point(g.getFirstCoordinate()), this.line.bufferRadius * this.getMap().getView().getResolution()));
                    if (intersect.length > 0) this.select.getFeatures().push(f);
                  }
                  if (g.getType() === "LineString")
                    g.forEachSegment((s, e) => {
                      const intersect = sls.intersect(segment(point(s), point(e)));
                      if (intersect.length > 0) this.select.getFeatures().push(f);
                    });
                  if (g.getType() === "Polygon") {
                    const coor = g.getCoordinates();
                    if (coor.length > 0 && coor.flat(Infinity).length > 0) {
                      const p = polygon(g.getCoordinates());
                      const intersect = p.intersect(sls);
                      if (intersect.length > 0) this.select.getFeatures().push(f);
                    }
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
          });
        });
      } else {
        this.getMap().removeInteraction(this.line.draw);
      }
    });
    
  }
}
