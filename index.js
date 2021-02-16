import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";
import Map from "ol/Map";
import View from "ol/View";

import epsg3765 from "./src/EPSG3765";
import UX from "./src/ux";
import Container from "./src/container";
import Toggle from "./src/toggle";
import Legend from "./src/legend";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

import Config from "./src/config";
import Project from "./src/project";

import Select from "./src/select.js";

/**  ol/Map*/
window.map = new Map({
  view: new View({
    projection: new epsg3765(),
    zoom: 0,
    center: [0, 0],
  }),
  controls: [],
});

/**Config map from cfg.json or cfg saved in localStorage */
map.config = new Config({
  map: map,
});
map.config.write();
localStorage.setItem("cfg", JSON.stringify(map.config.read()));

/**UX */
map.ux = new UX({
  map: map,
  headerClass: "ol-control map-header",
  asideClass: "map-aside",
  footerClass: "map-footer",
});
const ux = map.ux;
map.setTarget(ux.getTarget());
/**toggle in header*/
ux.header.home = new Toggle({
  html: '<i class="far fa-home fa-fw"></i> Osnovno',
  className: "toggle",
  tipLabel: "Tip...",
  active: false,
});
ux.header.addControl(ux.header.home);
ux.header.home.on("change:active", (evt) => ux.aside.home.setVisible(evt.active));

/**home taskbar -display when ux.header.home is active
 * in taskbar put app buttons or toggles to invoke apropriate containers (taskpanes) for app dialog
 */
ux.aside.home = new Container({
  semantic: "nav",
  className: "taskbar ol-control",
});
ux.aside.addControl(ux.aside.home);
ux.aside.home.setVisible(ux.header.home.getActive());

/**Tasks goes here*/

map.legend = new Legend({
  target: ux.aside,
  hide: true,
});
ux.aside.home.addControl(map.legend);
map.legend.activeLayerInfo({
  targetControl: ux.footer,
});

ux.aside.home.addControl(
  new Project({
    target: ux.aside,
    map: map,
  })
);

/**toolbar content- buttons for actions on map area like zoom, select, draw, etc */
ux.aside.toolbar = new Container({
  semantic: "nav",
  className: "toolbar",
});
ux.aside.addControl(ux.aside.toolbar);
/**select */
const select = new Select({
  target: ux.aside.toolbar,
  clear: true,
});
select.selectInfo({
  targetControl: ux.footer,
});

/**ol/controls */
ux.aside.toolbar.addControl(
  new Zoom({
    zoomInLabel: Object.assign(document.createElement("i"), { className: "far fa-plus fa-fw" }),
    zoomInTipLabel: "Približi",
    zoomOutTipLabel: "Udalji",
    zoomOutLabel: Object.assign(document.createElement("i"), { className: "far fa-minus fa-fw" }),
  })
);
ux.aside.toolbar.addControl(
  new Rotate({
    tipLabel: "Sjever gore",
    label: Object.assign(document.createElement("i"), { className: "far fa-arrow-alt-up fa-fw" }),
  })
);
/**footer content- informative panes like scaleline */
ux.footer.addControl(new ScaleLine());
