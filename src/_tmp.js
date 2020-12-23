import Control from "ol/control/Control";
import olSelect from "ol/interaction/Select";
import {
  DragZoom,
  DragBox,
  Draw
} from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  point,
  segment,
  circle,
  polygon
} from '@flatten-js/core';
import Container from "./container";
import Toggle from "./toggle";

/** Select
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {boolean} options.active Initial select interaction is active or not
 * @param {string} options.className Select contaner className
 * @param {string} options.point.className Select by point toggle className
 * @param {string} options.point.html Select by point toggle innerHTML
 * @param {string} options.point.title Select by point toggle tipLabel
 * @param {string} options.rect.className Select by rectangle toggle className
 * @param {string} options.rect.html Select by rectangle toggle innerHTML
 * @param {string} options.rect.title Select by rectangle toggle tipLabel
 * @param {integer} [options.line.buffer=5] Buffer radius around points in pixel
 * @param {string} options.line.className Select by line toggle className
 * @param {string} options.line.html Select by line toggle innerHTML
 * @param {string} options.line.title Select by line toggle tipLabel
 * @param {string} options.poly.className Select by polygon toggle className
 * @param {string} options.poly.html Select by polygon toggle innerHTML
 * @param {string} options.poly.title Select by polygon toggle tipLabel
 */

export default class Select extends olSelect {
  constructor(options = {}) {
    super({
      hitTolerance: 2,
      multi: true // A boolean that determines if the default behaviour should select only single features or all (overlapping) features
    });
    this.setActive(options.active || false); // innitial
  }
  addUI(control, options = {}) {
    this.ui = new Container({
      className: options.className || "ol-control select"
    });
    control.addControl(this.ui);
    this.point = new Toggle({
      className: options.point.className || "select-point",
      html: options.point.html || '<i class="far fa-mouse-pointer"></i>',
      tipLabel: options.point.title || "Odaberi objekte",
      handleClick: () => {
        this.setActive(this.point.getActive());
        this.getMap().removeInteraction(this.dragBox);
        this.getMap().removeInteraction(this.line.draw);
      }
    });
    this.ui.addControl(this.point);
    this.rect = new Toggle({
      className: options.rect.className || "select-rect",
      html: options.rect.html || '<i class="far fa-stop"></i>',
      tipLabel: options.rect.title || "Odaberi unutar pravokutnika",
      handleClick: () => {
        this.setActive(this.rect.getActive());
        this.getMap().removeInteraction(this.line.draw);
        this.getMap().removeInteraction(this.poly.draw);
        if (this.poly.layer) this.poly.layer.setMap(null);
        if (this.rect.getActive()) {
          const selectedFeatures = this.getFeatures();
          this.dragBox = new DragBox();
          this.getMap().addInteraction(this.dragBox);
          this.dragBox.on('boxstart', evt => {
            this.getMap().removeInteraction(this.getMap().getInteractions().getArray().find(x => x instanceof DragZoom));
            selectedFeatures.clear();
          });
          this.dragBox.on('boxend', evt => {
            const map = this.getMap();
            map.addInteraction(new DragZoom());
            const rotation = map.getView().getRotation();
            const oblique = rotation % (Math.PI / 2) !== 0;
            const candidateFeatures = oblique ? [] : selectedFeatures;
            const extent = this.dragBox.getGeometry().getExtent();
            const activeLayer = map.getLayers().getArray().find(x => x.get('active'));
            for (const l of map.getLayers().getArray()) {
              if (l instanceof VectorLayer)
                l.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
                  const styles = l.getStyle().call(this, feature, map.getView().getResolution());
                  for (const style of styles) {
                    const emptyStyle = style.getImage() === null && style.getText() === null && style.getFill() === null && style.getStroke() === null;
                    if ((activeLayer === undefined || activeLayer === l) && l.getVisible() && emptyStyle === false) candidateFeatures.push(feature);
                  }
                });
            }
            if (oblique) {
              const anchor = [0, 0];
              const geometry = this.dragBox.getGeometry().clone();
              geometry.rotate(-rotation, anchor);
              const extent$1 = geometry.getExtent();
              candidateFeatures.forEach(function (feature) {
                const geometry = feature.getGeometry().clone();
                geometry.rotate(-rotation, anchor);
                if (geometry.intersectsExtent(extent$1)) {
                  selectedFeatures.push(feature);
                }
              });
            }
            this.dispatchEvent('select');
          });
        }
        else {
          this.getMap().removeInteraction(this.dragBox);
        }
      }
    });
    this.ui.addControl(this.rect);

    this.line = new Toggle({
      className: options.line.className || 'select-line',
      html: options.line.html || '<i class="far fa-heart-rate"></i>',
      tipLabel: options.line.title || 'Odaberi objekte koji sijeku nacrtanu liniju',
      handleClick: () => {
        this.setActive(false);
        this.line.bufferRadius = options.line.buffer || 5; // buffer radius around points in pixel
        if (this.line.getActive()) {
          this.getMap().removeInteraction(this.dragBox);
          this.getMap().removeInteraction(this.poly.draw);
          if (this.poly.layer) this.poly.layer.setMap(null);
          this.line.source = new VectorSource();
          this.line.layer = new VectorLayer({
            source: this.line.source
          });
          this.line.layer.setMap(this.getMap());
          const drawOptions = {
            source: this.line.source,
            type: 'LineString'
          };
          if (options.line.selectStyle) drawOptions.style = options.line.selectStyle;
          this.line.draw = new Draw(drawOptions);
          this.getMap().addInteraction(this.line.draw);
          this.line.draw.on('drawend', evt => {
            const activeLayer = this.getMap().getLayers().getArray().find(x => x.get('active'));
            this.getFeatures().clear();
            evt.feature.getGeometry().forEachSegment((s, e) => {
              const sls = segment(point(s), point(e));
              for (const l of this.getMap().getLayers().getArray().filter(x => x instanceof VectorLayer && (x === activeLayer || activeLayer === undefined))) {
                for (const f of l.getSource().getFeatures()) {
                  let g = f.getGeometry();
                  try {
                    if (g.getType() === 'Point') {
                      const intersect = sls.intersect(circle(point(g.getFirstCoordinate()), this.line.bufferRadius * this.getMap().getView().getResolution()));
                      if (intersect.length > 0) this.getFeatures().push(f);
                    }
                    if (g.getType() === 'LineString')
                      g.forEachSegment((s, e) => {
                        const intersect = sls.intersect(segment(point(s), point(e)));
                        if (intersect.length > 0) this.getFeatures().push(f);
                      });
                    if (g.getType() === 'Polygon') {
                      const coor = g.getCoordinates();
                      if (coor.length > 0 && coor.flat(Infinity).length > 0) { // poligoni sa []
                        const p = polygon(g.getCoordinates());
                        const intersect = p.intersect(sls);
                        if (intersect.length > 0) this.getFeatures().push(f);
                      }
                    }
                  } catch (err) {
                    console.log(err);
                  }
                }
              }
            });
            this.dispatchEvent('select');
          });
          this.line.source.on('addfeature', evt => {
            if (this.line.source) this.line.source.clear();
          });
        }
        else {
          this.getMap().removeInteraction(this.line.draw);
          this.line.layer.setMap(null);
        }
      }
    });
    this.ui.addControl(this.line);

    this.poly = new Toggle({
      className: options.poly.className || 'select-poly',
      html: options.poly.html || '<i class="far fa-monitor-heart-rate"></i>',
      tipLabel: options.poly.title || 'Odaberi objekte unutar nacrtanog poligona',
      handleClick: () => {
        this.setActive(false);
        if (this.poly.getActive()) {
          const activeLayer = this.getMap().getLayers().getArray().find(x => x.get('active'));
          this.getMap().removeInteraction(this.line.draw);
          if (this.line.layer) this.line.layer.setMap(null);
          this.getMap().removeInteraction(this.dragBox);
          this.poly.source = new VectorSource();
          this.poly.layer = new VectorLayer({
            source: this.poly.source
          });
          this.poly.layer.setMap(this.getMap());
          const drawOptions = {
            source: this.poly.source,
            type: 'Polygon'
          };
          if (options.poly.selectStyle) drawOptions.style = options.poly.selectStyle;
          this.poly.draw = new Draw(drawOptions);
          this.getMap().addInteraction(this.poly.draw);
          this.poly.draw.on('drawend', evt => {
            this.getFeatures().clear();
            const p = polygon(evt.feature.getGeometry().getCoordinates());
            for (const l of this.getMap().getLayers().getArray().filter(x => x instanceof VectorLayer && (x === activeLayer || activeLayer === undefined))) {
              for (const f of l.getSource().getFeatures()) {
                let g = f.getGeometry();
                try {
                  if (g.getType() === 'Point') {
                    const intersect = p.intersect(point(g.getFirstCoordinate()));
                    if (intersect.length > 0) {
                      this.getFeatures().push(f);
                    }
                  }
                  if (g.getType() === 'LineString') {
                    g.forEachSegment((s, e) => {
                      try {
                        const ls = segment(point(s), point(e));
                        if (p.contains(ls)) this.getFeatures().push(f);
                      } catch (err) { }
                    });
                  }
                  if (g.getType() === 'Polygon') {
                    try {
                      if (p.contains(polygon(g.getCoordinates()))) this.getFeatures().push(f);
                    } catch (err) { }
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
            this.dispatchEvent('select');
          });
          this.poly.source.on('addfeature', evt => {
            if (this.poly.source) this.poly.source.clear();
          });
        }
        else {
          this.getMap().removeInteraction(this.poly.draw);
          this.poly.layer.setMap(null);
        }
      }
    })
    this.ui.addControl(this.poly);
    this.inside = new Toggle({
      className: options.inside.className || 'select-in-selected',
      html: options.inside.html || '<i class="far fa-layer-plus"></i>',
      tipLabel: options.inside.title || 'Odaberi objekte koji se nalaze unutar ili sijeku odabrani objekt'
    })
    this.inside.on('change:active', evt => {
      if (evt.active) {
        const activeLayer = this.getMap().getLayers().getArray().find(x => x.get('active'));
        this.getFeatures().clear();
        this.setActive(false);
        const inSelectOptions = {};
        if (this.selectStyle) inSelectOptions.style = this.selectStyle;
        this.inSelect = new olSelect(inSelectOptions);
        this.getMap().addInteraction(this.inSelect);
        this.inSelect.on('select', evt => {
          for (const f of evt.target.getFeatures().getArray()) {
            const p = polygon(f.getGeometry().getCoordinates());
            for (const l of this.getMap().getLayers().getArray().filter(x => x instanceof VectorLayer && (x === activeLayer || activeLayer === undefined))) {
              for (const f of l.getSource().getFeatures()) {
                let g = f.getGeometry();
                try {
                  if (g.getType() === 'Point') {
                    const intersect = p.intersect(point(g.getFirstCoordinate()));
                    if (intersect.length > 0) {
                      this.getFeatures().push(f);
                    }
                  }
                 /*  if (g.getType() === 'LineString') {
                    let flag = true;
                    g.forEachSegment((s, e) => {
                      try {
                        const ls = segment(point(s), point(e));
                        //if (options.inside.intersect && p.intersect(ls).length > 0) this.getFeatures().push(f);
                        if (!p.contains(ls)) flag = false;
                      } catch (err) { }
                    });
                    //if (flag) this.getFeatures().push(f);
                  } */
                  if (g.getType() === 'Polygon') {
                    try {
                      if (p.contains(polygon(g.getCoordinates()))) this.getFeatures().push(f);
                      if (options.inside.intersect && p.intersect(g).length > 0) this.getFeatures().push(f);
                    } catch (err) { }
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
          }
          this.dispatchEvent('select');
          this.inSelect.getFeatures().clear();
        });
      }
      else {
        this.inSelect.getFeatures().clear();
        this.getMap().removeInteraction(this.inSelect);
      }
    });
    this.ui.addControl(this.inside);

  }

  addInfo(control, options) {
    this.info = new Control({
      element: document.createElement("span")
    });
    this.info.element.className =
      options.className || "select-info";
    this.info.element.innerHTML = "Odabrano: 0";
    this.on("select", evt => {
      this.info.element.innerHTML =
        "Odabrano: " + evt.target.getFeatures().getLength();
    });
    control.addControl(this.info);
  }
}
