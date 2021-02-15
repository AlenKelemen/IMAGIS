import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import OlSelect from "ol/interaction/Select";
import { DragZoom, DragBox } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import { elt } from "./util";

export default class Select extends Container {
  constructor(options = {}) {
    super(options);
    this.clear = options.clear || false; //clear previusly selected
    this.map = options.map;
    this.container = new Container({
      semantic: "div",
      className: `select ol-control`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.activeLayer = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("active"));
    this.olSelect = new OlSelect({
      hitTolerance: 5,
      filter: (feature, layer) => {
        if (!this.activeLayer) return true;
        else return layer === this.activeLayer;
      },
    });
    this.map.addInteraction(this.olSelect);
    this.olSelect.setActive(false);
    this.selectPoint();
    this.selectRectangle();
  }
  selectInfo(options) {
    const info = new Control({
      element: elt("div", { className: "select-info" }),
    });
    if (options.targetControl) options.targetControl.addControl(info);
    
    else this.map.addControl(info);
    info.element.innerHTML = "Odabrano: 0";
    if (options.tipLabel) info.element.title = options.tipLabel;
    this.olSelect.on("select", (evt) => {
      info.element.innerHTML = "Odabrano: " + evt.target.getFeatures().getLength();
    });
  }
  selectRectangle() {
    const toggle = new Toggle({
      html: '<i class="far fa-stop fa-fw"></i>',
      className: "toggle select",
      tipLabel: "Odaberi crtnjem pravokutnika",
    });
    this.container.addControl(toggle);
    toggle.on("change:active", (evt) => {
      this.olSelect.setActive(evt.active);
      const dragBox = new DragBox();
      this.map.removeInteraction(
        this.map
          .getInteractions()
          .getArray()
          .find((x) => x instanceof DragBox)
      );
      if (evt.active) this.map.addInteraction(dragBox);
      dragBox.on("boxstart", (evt) => {
        const selectedFeatures = this.olSelect.getFeatures();
        if (this.clear && !event.shiftKey) this.olSelect.getFeatures().clear();
      });

      dragBox.on("boxend", (evt) => {
        const rotation = this.map.getView().getRotation();
        const oblique = rotation % (Math.PI / 2) !== 0;
        const candidateFeatures = oblique ? [] : this.olSelect.getFeatures();
        const extent = dragBox.getGeometry().getExtent();
        const layers = this.map
          .getLayers()
          .getArray()
          .filter((x) => x instanceof VectorLayer);
        const activeLayer = layers.find((x) => x.get("active"));
        for (const l of layers) {
          l.getSource().forEachFeatureIntersectingExtent(extent, (feature) => {
            const styles = l.getStyle().call(this, feature, this.map.getView().getResolution());
            for (const style of styles) {
              const emptyStyle = style.getImage() === null && style.getText() === null && style.getFill() === null && style.getStroke() === null;
              if ((activeLayer === undefined || activeLayer === l) && l.getVisible() && emptyStyle === false) candidateFeatures.push(feature);
            }
          });
        }
        if (oblique) {
          const anchor = [0, 0];
          const geometry = dragBox.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          const extent$1 = geometry.getExtent();
          candidateFeatures.forEach((feature) => {
            const geometry = feature.getGeometry().clone();
            geometry.rotate(-rotation, anchor);
            if (geometry.intersectsExtent(extent$1)) {
              this.olSelect.getFeatures().push(feature);
            }
          });
        }
        this.olSelect.dispatchEvent("select");
      });
    });
  }
  selectPoint() {
    const toggle = new Toggle({
      html: '<i class="far fa-mouse-pointer fa-fw"></i>',
      className: "toggle select",
      tipLabel: "Odaberi",
    });
    this.container.addControl(toggle);
    toggle.on("change:active", (evt) => {
      this.olSelect.setActive(evt.active);
    });
  }
  setClear(b) {
    this.clear = b;
  }
  getClear() {
    return this.clear;
  }
}
