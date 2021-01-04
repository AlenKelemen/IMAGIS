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
import Select from "ol/interaction/Select";

import baseDef from "./def.json";
import epsg3765 from "./src/EPSG3765";
import Container from "./src/container";
import Toggle from "./src/toggle";
import DefLayers from "./src/defLayers";
import Geolocator from "./src/geoloc";
import Legend from "./src/legend";
import Theme from "./src/theme.js";
import Properties from "./src/properties.js";
import DefEditor from "./src/defEditor";
import SelectInfo from "./src/selectInfo";
import SelectRect from "./src/selectRect";
import SelectEx from "./src/selectEx";

/**  local project def*/
if (localStorage.getItem("def") === null) localStorage.setItem("def", JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem("def"));
/** map contaner */
const mapContainer = document.createElement("main");
mapContainer.className = "map";
document.body.appendChild(mapContainer);

/**  ol/Map*/
window.map = new Map({
  target: mapContainer,
  view: new View({
    center: def.center,
    zoom: def.zoom,
    projection: new epsg3765(),
  }),
  controls: [],
});
/** ol/interaction/Select */
const select = new Select({
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
map.addInteraction(select);
select.setActive(false);

/** Load ol/Layer (s) from def*/
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
  className: "map-header",
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
  className: "map-aside",
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
const legend = new Legend({
  html: '<i class="far fa-layer-group"></i>',
  tipLabel: "Legenda & upravljanje kartom",
  target: sectionHome,
  contanerClassName: "pane-legend",
});
navHome.addControl(legend);

const theme = new Theme({
  html: '<i class="far fa-images"></i>',
  tipLabel: "Tema i stil",
  target: sectionHome,
  contanerClassName: "pane-theme",
  def: def,
  layer: (() => {
    map
      .getLayers()
      .getArray()
      .find((x) => x.get("active"));
  })(),
  callback: (def, layer) => defEditor.setDef(def),
});
map.getLayers().on("propertychange", (evt) => {
  theme.setLayer(evt.target.get("active"));
});
navHome.addControl(theme);

const properties = new Properties({
  select: select,
  html: '<i class="far fa-info-circle"></i>',
  tipLabel: "Info",
  target: sectionHome,
  contanerClassName: "pane-properties",
  readOnly: false,
});
navHome.addControl(properties);

const project = new Project({
  html: '<i class="far fa-book-user"></i>',
  tipLabel: "Projekt",
  target: sectionHome,
  def: JSON.parse(ls.get("def")),
  contanerClassName: "pane-project",
});
navHome.addControl(project);

const defEditor = new DefEditor({
  html: '<i class="far fa-brackets-curly"></i>',
  tipLabel: "Uređenje karte",
  target: sectionHome,
  def: def,
  contanerClassName: "pane-def-editor",
});
navHome.addControl(defEditor);
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

/** rightside, child of aside */

const selectContaner = new Container({
  semantic: "nav",
  className: "nav-select",
});
navRight.addControl(selectContaner);

const selectContanerBase = new Container({
  semantic: "nav",
  className: "select-base ol-control",
});
selectContaner.addControl(selectContanerBase);

const selectToggle = new Toggle({
  html: '<i class="far fa-mouse-pointer"></i>',
  className: "select",
  tipLabel: "Odaberi",
});
selectContanerBase.addControl(selectToggle);

selectToggle.on("change:active", (evt) => {
  select.setActive(evt.active);
});
const selectRectToggle = new Toggle({
  html: '<i class="far fa-lasso"></i>',
  className: "select-rect",
  tipLabel: "Odaberi zahvatom",
});
selectContanerBase.addControl(selectRectToggle);
const selectRect = new SelectRect({
  select: select,
});
selectRectToggle.on("change:active", (evt) => {
  if (evt.active) {
    map.addInteraction(selectRect);
  } else map.removeInteraction(selectRect);
});

const selectEx = new SelectEx({
  select: select,
  html: '<i class="far fa-ellipsis-h"></i>',
  className: "select-more",
  tipLabel: "Odaberi na druge načine",
  target: selectContaner,
  contanerClassName: "select-ex ol-control",
});
selectContanerBase.addControl(selectEx);

/** UX footer control */
const footer = new Container({
  semantic: "footer",
  className: "footer",
});
map.addControl(footer);
legend.activeLayerInfo({
  className: "active-layer-info ol-control",
  targetControl: footer,
});
const selectInfo = new SelectInfo({
  select: select,
  className: "select-info",
});
footer.addControl(selectInfo);
footer.addControl(new ScaleLine());
