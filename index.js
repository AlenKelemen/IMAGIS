import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";
import Map from "ol/Map";
import View from "ol/View";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import epsg3765 from "./src/EPSG3765";
import UX from "./src/ux";

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
  headerClass: "map-header ol-control",
  asideClass: "map-aside",
  footerClass: "map-footer",
});
const ux = map.ux;
map.setTarget(ux.getTarget());
/**home tasks */
ux.addHeaderToggle({
  html: '<i class="far fa-home"></i>',
  className: "toggle-home",
  tipLabel: "Opći alati",
  active:false,
  handleClick:evt=>ux.toggleHide(ux.homeBar)
});
ux.homeBar = ux.addTaskBar({
  className:'taskbar ol-control'
});
ux.legend = ux.addTaskToggle({
  taskbar:ux.homeBar,
  handleClick:evt=>ux.toggleHide(ux.homePane)
})
ux.homePane = ux.addTaskPane({
  className:'taskpane ol-control'
});

