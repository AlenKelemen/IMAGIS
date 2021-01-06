import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";

import Map from "ol/Map";
import View from "ol/View";
import Select from "ol/interaction/Select";
/**
 * baseDef Imagis definition JSON file.
 * @type {Object}
 */
import baseDef from "./def.json";
import epsg3765 from "./src/EPSG3765";
import Container from "./src/container";
import Toggle from "./src/toggle";
import Control from "ol/control/Control";
import DefLayers from "./src/defLayers";

window.Imagis = {};

/** baseDef or def from localStorage */
if (!localStorage.getItem("def")) {
  Imagis.def = baseDef;
  localStorage.setItem("def", JSON.stringify(Imagis.def));
} else Imagis.def = JSON.parse(localStorage.getItem("def"));

/** map contaner */
Imagis.mapEl = document.createElement("main");
Imagis.mapEl.className = "map";
document.body.appendChild(Imagis.mapEl);

/**  ol/Map*/
Imagis.mapOl = new Map({
  target: Imagis.mapEl,
  view: new View({
    center: Imagis.def.centar,
    zoom: Imagis.def.center,
    projection: new epsg3765(),
  }),
  controls: [],
});

/** ol/interaction/Select */
Imagis.selectOl = new Select({
  hitTolerance: 5,
  filter: (feature, layer) => {
    const activeLayer = map
      .getLayers()
      .getArray()
      .find((x) => x.get("active"));
    if (!activeLayer) return true;
    else return layer === activeLayer;
  },
});
Imagis.mapOl.addInteraction(Imagis.selectOl);
Imagis.selectOl.setActive(false);

/** Load ol/Layer (s) from def*/
Imagis.defLayers = new DefLayers({
  def: Imagis.def,
  map: Imagis.map,
});
Imagis.defLayers.addTileLayers();
Imagis.defLayers.addVectorLayers();
Imagis.defLayers.addTHLayers();

Imagis.mapOl.addControl(
  new Control({
    element: document.createElement("div"),
  })
);
