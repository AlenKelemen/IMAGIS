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
import Legend from "./src/legend";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import ImageState from "ol/ImageState";
import Button from "./src/button";

import ImagisStyle from "./src/imagisStyle";

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
/**Map with layers as defined in cfg */
Imagis.def = new Def({
  cfg: Imagis.cfg,
  map: Imagis.map,
});
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
  className: "map-header control",
});
Imagis.map.addControl(Imagis.header); /** UX home control */
Imagis.toggleHome = new Toggle({
  html: '<i class="far fa-home"></i>',
  className: "toggle-home",
  tipLabel: "Opći alati",
});
Imagis.header.addControl(Imagis.toggleHome);
Imagis.toggleHome.on("change:active", (evt) => Imagis.homeSection.setVisible(evt.active));

/** aside: UX left & right side controls contaner */
Imagis.aside = new Container({
  semantic: "aside",
  className: "map-aside",
});
/** UX left side child of aside */
Imagis.map.addControl(Imagis.aside);
Imagis.homeSection = new Container({
  visible: false,
  semantic: "section",
  className: "map-aside-section home-section",
  name: "home",
});
Imagis.aside.addControl(Imagis.homeSection);
Imagis.homeNav = new Container({
  semantic: "nav",
  className: "home-nav control",
  name: "homeNav",
});
Imagis.homeSection.addControl(Imagis.homeNav);
Imagis.homeNav.addControl(
  new Legend({
    cfg: Imagis.cfg,
    html: '<i class="far fa-layer-group"></i>',
    tipLabel: "Legenda & upravljanje kartom",
    target: Imagis.homeSection,
    contanerClassName: "map-aside-nav-section legend control",
    name: "legend",
  })
);
Imagis.legend = Imagis.homeNav.getControls("legend");
/***Update map from new cfg */
Imagis.cfgUpdate = new Button({
  html: '<i class="far fa-cog"></i>',
  handleClick: (evt) => {
    // console.log('Updated cfg:',Imagis.cfg)
    Imagis.def.setCfg(Imagis.cfg);
    Imagis.legend.setCfg(Imagis.cfg);
  },
});
Imagis.homeNav.addControl(Imagis.cfgUpdate);
Imagis.cfgUpdate.element.click();
/** UX right side child of aside */
Imagis.aside.right = new Container({
  semantic: "nav",
  className: "right-nav",
  name: "rightNav",
});
Imagis.aside.addControl(Imagis.aside.right);

Imagis.aside.right.rotateZoom = new Container({
  semantic: "nav",
  className: "rotate-zoom",
  name: "rotateZoom",
});
Imagis.aside.right.addControl(Imagis.aside.right.rotateZoom);
Imagis.aside.right.rotateZoom.addControl(
  new Rotate({
    className: "ol-rotate control",
    tipLabel: "Sjever gore",
    label: Object.assign(document.createElement("i"), { className: "far fa-arrow-alt-up" }),
  })
);
Imagis.aside.right.rotateZoom.addControl(
  new Zoom({
    className: "ol-zoom control",
    zoomInLabel: Object.assign(document.createElement("i"), { className: "far fa-plus" }),
    zoomInTipLabel: "Približi",
    zoomOutTipLabel: "Udalji",
    zoomOutLabel: Object.assign(document.createElement("i"), { className: "far fa-minus" }),
  })
);
Imagis.aside.right.rotateZoom.getControls().map((x) => x.element.classList.remove("ol-control"));

/** UX footer control */
Imagis.footer = new Container({
  semantic: "footer",
  className: "map-footer",
});
Imagis.map.addControl(Imagis.footer);
Imagis.footer.addControl(
  new ScaleLine({
    className: "ol-scale-line",
  })
);

Imagis.map
  .getLayers()
  .getArray()
  .find((x) => x.get("name") === "vod");

Imagis.imagisStyle = new ImagisStyle();
const s = Imagis.map
  .getLayers()
  .getArray()
  .find((x) => x.get("name") === "TH")
  .getStyle()
  .call(this, undefined, null)[0];
Imagis.imagisStyle.addStyle(s, { a: 1 }, [1, 2]);
Imagis.imagisStyle.on("change", (evt) => console.log(evt));
Imagis.imagisStyle.changed();
