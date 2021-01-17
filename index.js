import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";
import { elt } from "./src/util";
import Map from "ol/Map";
import View from "ol/View";
import Select from "ol/interaction/Select";
import defaultCfg from "./cfg.json";
import epsg3765 from "./src/EPSG3765";
import Def from "./src/def";
import Container from "./src/container";
import Toggle from "./src/toggle";
import Legend from "./src/legend";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

window.i = {};

/**  ol/Map*/
i.map = new Map({
  target: elt("main", { className: `main` }),
  view: new View({
    projection: new epsg3765(),
  }),
  controls: [],
});
document.body.appendChild(i.map.getTarget());
/** cfg */

i.cfg = (n) => (n ? i.map.set("cfg", n) : i.map.get("cfg"));
i.map.on("propertychange", (evt) => console.log(evt));
/** defaultCfg or cfg from localStorage */
if (!localStorage.getItem("cfg")) {
  i.cfg(defaultCfg);
  localStorage.setItem("cfg", JSON.stringify(defaultCfg));
} else i.cfg(JSON.parse(localStorage.getItem("cfg")));
