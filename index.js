import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import epsg3765 from "./src/EPSG3765";
import UX from "./src/ux";
import Proj from "./src/proj";
import cfg from "./cfg.json";

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

map.proj = new Proj({
  cfg:cfg,
  map:map
})
map.proj.cfg2View();
map.proj.update();


