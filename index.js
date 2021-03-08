import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "w3-css/w3.css";
import "./src/imagis.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import { elt } from "./src/util";
import epsg3765 from "./src/EPSG3765";
import UX from "./src/ux";
import Legend from "./src/legend";

/**  ol/Map*/
const htrs = new epsg3765();
document.body.appendChild(elt("div", { id: "map" }));
window.map = new Map({
  view: new View({
    //projection: htrs,
    zoom: 0,
    center: [0, 0],
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  controls: [],
  target: "map",
});

/**UX */
map.ux = new UX({
  map: map,
});
map.ux.addImagis(
  new Legend({
    target: map.ux.getImagis(),
  })
);
