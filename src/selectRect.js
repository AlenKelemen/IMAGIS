import { DragZoom, DragBox } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
/**
 *select rectangle function
 *
 * @export
 * @param {ol​/interaction​/Select} select
 */
export default function selectRect(select, active) {
  const selectedFeatures = select.getFeatures();
  const dragBox = new DragBox();
  if (active) {
    select.getMap().addInteraction(dragBox);
    dragBox.on("boxstart", (evt) => {
      select.getMap().removeInteraction(
        select
          .getMap()
          .getInteractions()
          .getArray()
          .find((x) => x instanceof DragZoom)
      );
      selectedFeatures.clear();
      dragBox.on("boxend", (evt) => {
        select.getMap().addInteraction(new DragZoom());
        const rotation = map.getView().getRotation();
        const oblique = rotation % (Math.PI / 2) !== 0;
        const candidateFeatures = oblique ? [] : selectedFeatures;
        const extent = dragBox.getGeometry().getExtent();
        const activeLayer = select
          .getMap()
          .getLayers()
          .getArray()
          .find((x) => x.get("active"));
        for (const l of select
          .getMap()
          .getLayers()
          .getArray()
          .filter((x) => x instanceof VectorLayer)) {
          l.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
            const styles = l.getStyle().call(this, feature, select.getMap().getView().getResolution());
            for (const style of styles) {
              const emptyStyle = style.getImage() === null && style.getText() === null && style.getFill() === null && style.getStroke() === null;
              if ((activeLayer === undefined || activeLayer === l) && l.getVisible() && emptyStyle === false) candidateFeatures.push(feature);
            }
          });
        }
      });
    });
  } else {
    select.getMap().removeInteraction(dragBox);
  }
}
