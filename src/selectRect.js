import { DragZoom, DragBox } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
/**
 * Select rectangle interaction
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {Object} options.select ol/interaction/Select
 * @param {boolean} [options.clear = true] clear previous on selection
 */
export default class SelectRect extends DragBox {
  constructor(options = {}) {
    super();
    this.select = options.select; //
    this.clear = options.clear || true; //
    this.on("boxstart", (evt) => {
      this.selectedFeatures = this.select.getFeatures();
      if (this.clear) this.selectedFeatures.clear();
    });
    this.on("boxend", (evt) => {
      const rotation = this.select.getMap().getView().getRotation();
      const oblique = rotation % (Math.PI / 2) !== 0;
      const candidateFeatures = oblique ? [] : this.selectedFeatures;
      const extent = this.getGeometry().getExtent();
      const layers = this.select
        .getMap()
        .getLayers()
        .getArray()
        .filter((x) => x instanceof VectorLayer);
      const activeLayer = layers.find((x) => x.get("active"));
      for (const l of layers) {
        l.getSource().forEachFeatureIntersectingExtent(extent, (feature) => {
          const styles = l.getStyle().call(this, feature, this.select.getMap().getView().getResolution());
          for (const style of styles) {
            const emptyStyle = style.getImage() === null && style.getText() === null && style.getFill() === null && style.getStroke() === null;
            if ((activeLayer === undefined || activeLayer === l) && l.getVisible() && emptyStyle === false) candidateFeatures.push(feature);
          }
        });
      }
      if (oblique) {
        const anchor = [0, 0];
        const geometry = this.getGeometry().clone();
        geometry.rotate(-rotation, anchor);
        const extent$1 = geometry.getExtent();
        candidateFeatures.forEach((feature) => {
          const geometry = feature.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          if (geometry.intersectsExtent(extent$1)) {
            this.selectedFeatures.push(feature);
          }
        });
      }
      this.select.dispatchEvent("select");
    });
  }
  setClear(b) {
    this.clear = b;
  }
  getClear() {
    return this.clear;
  }
}
