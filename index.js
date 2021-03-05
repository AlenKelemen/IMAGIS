import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";
import Map from "ol/Map";
import View from "ol/View";

import epsg3765 from "./src/EPSG3765";
import UX from "./src/ux";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

/**  ol/Map*/
window.map = new Map({
  view: new View({
    projection: new epsg3765(),
    zoom: 0,
    center: [0, 0],
  }),
  controls: [],
});
/**UX */
map.ux = new UX({
  map: map,
});
const ux = map.ux;
map.setTarget(ux.getTarget());

