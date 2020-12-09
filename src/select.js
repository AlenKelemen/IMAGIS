import Control from "ol/control/Control";
import olSelect from "ol/interaction/Select";
import {
  DragZoom,
  DragBox
} from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import Container from "./container";
import Toggle from "./toggle";


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
      }
    });
    this.ui.addControl(this.point);
    this.rect = new Toggle({
      className: options.rect.className || "select-rect",
      html: options.rect.html || '<i class="far fa-stop"></i>',
      tipLabel: options.rect.title || "Odaberi unutar pravokutnika",
      handleClick: () => {
        this.setActive(this.rect.getActive());
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
