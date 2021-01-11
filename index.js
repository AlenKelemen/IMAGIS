import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";

import Map from "ol/Map";
import View from "ol/View";
import Select from "ol/interaction/Select";
/**
 * baseDef Imagis definition JSON file.
 * @type {Object}
 */
import cfg from "./cfg.json";
import epsg3765 from "./src/EPSG3765";
import Def from "./src/def";
import Container from "./src/container";
import Toggle from "./src/toggle";
import Control from "ol/control/Control";
import DefLayers from "./src/defLayers";

window.Imagis = {};

/** baseDef or def from localStorage */
if (!localStorage.getItem("cfg")) {
  Imagis.cfg = cfg;
  localStorage.setItem("cfg", JSON.stringify(Imagis.cfg));
} else Imagis.cfg = JSON.parse(localStorage.getItem("cfg"));

/** UX map contaner */
Imagis.ux = document.createElement("main");
Imagis.ux.className = "map";
document.body.appendChild(Imagis.ux);

/**  ol/Map*/
Imagis.map = new Map({
  target: Imagis.ux,
  view: new View({
    projection: new epsg3765(),
  }),
  controls: [],
});
/**Map from cfg */
Imagis.def = new Def({
  cfg: Imagis.cfg,
  map: Imagis.map,
});
Imagis.def.toMap();

/**layers from cfg */
Imagis.def.toLayers();
Imagis.def.toLayers();

/** ol/interaction/Select */
Imagis.select = new Select({
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
Imagis.map.addInteraction(Imagis.select);
Imagis.select.setActive(false);

/** UX header control */
Imagis.header = new Container({
  semantic: "header",
  className: "map-header",
});
Imagis.map.addControl(Imagis.header);
Imagis.nav = new Container({
  className: "ol-control",
});
Imagis.header.addControl(Imagis.nav);

/** aside: UX left & right side controls contaner */
Imagis.aside = new Container({
  semantic: "aside",
  className: "map-aside",
});
Imagis.map.addControl(Imagis.aside);

/** UX footer control */
Imagis.footer = new Container({
  semantic: "footer",
  className: "map-footer",
});
Imagis.map.addControl(Imagis.footer);
