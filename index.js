import "ol/ol.css";
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import "./src/imagis.css";
import Map from "ol/Map";
import View from "ol/View";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import epsg3765 from "./src/EPSG3765";
import Container from "./src/container";
import Toggle from "./src/toggle";
import Button from "./src/button";

window.Imagis = {};

/** UX map contaner */
Imagis.ux = document.createElement("main");
Imagis.ux.className = "map";
document.body.appendChild(Imagis.ux);

/**  ol/Map*/
Imagis.map = new Map({
  target: Imagis.ux,
  view: new View({
    projection: new epsg3765(),
    zoom: 0,
    center: [0, 0],
  }),
  controls: [],
});
/** HEADER */
Imagis.header = new Container({
  semantic: "header",
  className: "map-header control",
});
Imagis.map.addControl(Imagis.header);
/**Toggle for home sidebar */
Imagis.toggleHome = new Toggle({
  html: '<i class="far fa-home"></i>',
  className: "toggle-home",
  tipLabel: "Opći alati",
  active:false
});
Imagis.header.addControl(Imagis.toggleHome);
Imagis.toggleHome.on("change:active", (evt) => Imagis.homeSection.setVisible(evt.active));
/**ASIDE Left and right containers */
Imagis.aside = new Container({
  semantic: "aside",
  className: "map-aside",
});
Imagis.map.addControl(Imagis.aside);
/** Left side container consists of nav with toggles or buttons and section for tasks */
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

/**Toggle for legend task section */
Imagis.legend = new Toggle({
  html: '<i class="far fa-layer-group"></i>',
  tipLabel: "Legenda & upravljanje kartom",
  active:false
});
Imagis.homeNav.addControl(Imagis.legend);
Imagis.homeSection.element.appendChild(Object.assign(document.createElement("div"), { id:'pane',innerText:'TASK PANE'}))
Imagis.legend.on("change:active", (evt) => {
  console.log(evt.active)
  if (evt.active) document.getElementById('pane').style.display='block'
  else document.getElementById('pane').style.display='none'
});


/**Button for example */
Imagis.button = new Button({
  html: '<i class="far fa-asterisk"></i>',
  tipLabel: "Primjer",
  handleClick: () => alert(`Zoom: ${Imagis.map.getView().getZoom()}`),
});
Imagis.homeNav.addControl(Imagis.button);

/** Right nav of aside for buttons and toggles */
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
/** FOOTER*/
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
