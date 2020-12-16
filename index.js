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

import epsg3765 from "./src/EPSG3765";
import baseDef from "./def.json";
import Container from "./src/container";
import DefLayers from "./src/defLayers";
import DefEditor from "./src/defEditor";
import Toggle from "./src/toggle";
import Geolocator from "./src/geoloc";
import Legend from "./src/legend";
import ContainerToggle from "./src/containerToggle.js";

/**  local project def*/
if (localStorage.getItem("def") === null) localStorage.setItem("def", JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem("def"));
/** map contaner */
const mapContainer = document.createElement("main");
mapContainer.className = "map";
document.body.appendChild(mapContainer);

/**  ol/map*/
window.map = new Map({
  target: mapContainer,
  view: new View({
    center: def.center,
    zoom: def.zoom,
    projection: new epsg3765(),
  }),
  controls: [],
});

/**  load layers from def*/
const defLayers = new DefLayers({
  def: def,
  map: map,
});
defLayers.addTileLayers();
defLayers.addVectorLayers();
defLayers.addTHLayers();

/** UX header control */
const header = new Container({
  semantic: "header",
  className: "header",
});
map.addControl(header);
const nav = new Container({
  className: "ol-control",
});
header.addControl(nav);

/** UX home control */
const toggleHome = new Toggle({
  html: '<i class="far fa-home"></i>',
  className: "toggle-home",
  tipLabel: "Opći alati",
});
nav.addControl(toggleHome);
toggleHome.on("change:active", (evt) => {
  sectionHome.setActive(evt.active);
});

/** aside: UX left & right side controls contaner */
const aside = new Container({
  semantic: "aside",
  className: "aside",
});
map.addControl(aside);

/** UX left side controls, children of aside */
/**Home */
const sectionHome = new Container({
  semantic: "section",
  className: "section home",
});
aside.addControl(sectionHome);
const navHome = new Container({
  semantic: "nav",
  className: "nav home ol-control",
});
sectionHome.addControl(navHome);
/** Home content */
navHome.addControl(
  new DefEditor({
    html: '<i class="far fa-brackets-curly"></i>',
    tipLabel: "Def editor",
    target: sectionHome,
    contanerClassName:'def-editor ol-control'
  })
);
navHome.addControl(
  new ContainerToggle({
    html: '<i class="far fa-brackets"></i>',
    tipLabel: "Container toggle",
    target: sectionHome,
    contanerClassName:'def-editor ol-control'
  })
);


/** UX right side control, child of aside */
const navRight = new Container({
  semantic: "nav",
  className: "nav-right",
});
aside.addControl(navRight);
const rotateZoom = new Container({
  semantic: "nav",
  className: "nav-rotateZoom",
});
navRight.addControl(rotateZoom);
rotateZoom.addControl(
  new Rotate({
    tipLabel: "Sjever gore",
  })
);
rotateZoom.addControl(new Zoom());
/** geolocate control, rightside child of aside */
const geolocator = new Geolocator({
  map: map,
  className: "geolocator ol-control",
  html: '<i class="far fa-map-marker-alt"></i>',
  tipLabel: "Pokaži moju lokaciju",
});
navRight.addControl(geolocator);

/** UX footer control */
const footer = new Container({
  semantic: "footer",
  className: "footer",
});
map.addControl(footer);
footer.addControl(new ScaleLine());
