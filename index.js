import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/main.css";
import Map from "ol/Map";
import View from "ol/View";
import ScaleLine from "ol/control/ScaleLine";
import Rotate from "ol/control/Rotate";
import Zoom from "ol/control/Zoom";
import Projection from "ol/proj/Projection";
import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";

import baseDef from "./def.json";
import Container from "./src/container";
import DefLayers from "./src/defLayers";
import DefEditor from "./src/defEditor";
import Toggle from "./src/toggle";

if (localStorage.getItem("def") === null) localStorage.setItem("def", JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem("def"));
def.path = window.location.href.split("/").slice(0, -1).join("/"); //base url

proj4.defs("EPSG:3765", "+proj=tmerc +lat_0=0 +lon_0=16.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);
const mapContainer = document.createElement("main");
mapContainer.className = "map";
document.body.appendChild(mapContainer);
const view = new View({
  center: def.center,
  zoom: def.zoom,
  projection: new Projection({
    //hr projection
    code: "EPSG:3765",
    units: "m",
    extent: [208311.05, 4614890.75, 724721.78, 5159767.36],
  }),
});
window.map = new Map({
  target: mapContainer,
  view: view,
  controls: [],
});

const header = new Container({
  semantic: "header",
  className: "header",
});
map.addControl(header);
const gui = new Container({
  className: "ol-control",
});
header.addControl(gui);

const aside = new Container({
  // contaner for left & right side controls
  semantic: "aside",
  className: "aside",
});
map.addControl(aside);
const section = new Container({// left side taskpane section
  semantic: "section",
  className: "section",
});
aside.addControl(section);
const navRight = new Container({  // right side controls
  semantic: "nav",
  className: "nav-right",
});
aside.addControl(navRight);
const taskpane = new Container({
  semantic: "section",
  className: "taskpane",
});
section.addControl(taskpane);
const nav = new Container({
    semantic: "nav",
    className: "nav-left",
  });
  section.addControl(nav);
navRight.addControl(
  new Rotate({
    tipLabel: "Sjever gore",
  })
);
navRight.addControl(new Zoom());

const footer = new Container({
  semantic: "footer",
  className: "footer",
});
map.addControl(footer);
footer.addControl(new ScaleLine());

const guiNav = new Toggle({
  html: '<i class="far fa-plus"></i>',
  tipLabel: "show/hide section",
});
gui.addControl(guiNav);
guiNav.on("change:active", (evt) => {
  section.setVisible(!evt.active);
});
taskpane.addControl(
  new DefEditor({
    def: def,
  })
);
const defLayers = new DefLayers({
  def: def,
  map: map,
});
defLayers.addTileLayers();
defLayers.addVectorLayers();
