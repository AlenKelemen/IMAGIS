import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/main.css";
import Map from "ol/Map";
import View from "ol/View";
import ScaleLine from "ol/control/ScaleLine";
import Rotate from "ol/control/Rotate";
import Zoom from "ol/control/Zoom";

import epsg3765 from "./src/EPSG3765";
import baseDef from "./def.json";
import Container from "./src/container";
import DefLayers from "./src/defLayers";
import DefEditor from "./src/defEditor";
import Geolocator from "./src/geoloc";
import Select from "./src/select";
import Legend from "./src/legend";
import Theme from "./src/theme";
import Properties from "./src/properties";

//local project def
if (localStorage.getItem("def") === null)
  localStorage.setItem("def", JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem("def"));
// ol/map
const mapContainer = document.createElement("main");
mapContainer.className = "map";
document.body.appendChild(mapContainer);
window.map = new Map({
  target: mapContainer,
  view: new View({
    center: def.center,
    zoom: def.zoom,
    projection: new epsg3765()
  }),
  controls: [
    new Zoom(),
    new Rotate({
      tipLabel: "Sjever gore"
    }),
    new ScaleLine()
  ]
});
//layers as defined in def.json
const defLayers = new DefLayers({
  def: def,
  map: map
});
defLayers.addTileLayers();
defLayers.addVectorLayers();
defLayers.addTHLayers();
/* navLeft.addControl(new DefEditor({
    def: def
})); */
//geolocate
const geolocator = new Geolocator({
  map: map,
  className: "geolocator ol-control",
  html: '<i class="far fa-map-marker-alt"></i>',
  tipLabel: "Pokaži moju lokaciju"
});
map.addControl(geolocator);
//select
const select = new Select({
  active: true,
  className: "select-info"
});
map.addInteraction(select);
select.addInfo(map, { className: "select-info" });
select.addUI(map, {
  className: "ol-control select",
  point: {
    className: "select-point",
    html: '<i class="far fa-mouse-pointer"></i>',
    title: "Odaberi objekte"
  }
});
//left controls
const navLeft = new Container({
  className: "nav-left ol-control"
});
map.addControl(navLeft);
//legend
const legend = new Legend({
  className: "legend-toggle",
  html: '<i class="far fa-layer-group"></i>',
  tipLabel: "Legenda & upravljanje kartom",
  dialogClassName: "legend"
});
navLeft.addControl(legend);
const activeLayerInfo = legend.activeLayerInfo();
//theme
const theme = new Theme({
  className: "theme-toggle",
  html: '<i class="far fa-images"></i>',
  tipLabel: "Tematizacija karte",
  dialogClassName: "theme",
  layer: map
    .getLayers()
    .getArray()
    .find(x => x.get("active"))
});
navLeft.addControl(theme);
map.getLayers().on('propertychange', evt => theme.setLayer(evt.target.get('active')));
//properties
const property = new Properties({
  className: "properties-toggle",
  html: '<i class="far fa-info-circle"></i>',
  tipLabel: 'Svojstva',
  select: select
});
navLeft.addControl(property);