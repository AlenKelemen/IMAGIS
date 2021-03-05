import Container from "./container";
import Toggle from "./toggle";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    this.headerItems = [
      {
        name: "water",
        label: "Voda",
        tip: "tip",
        icon: "fa-water",
      },
      {
        name: "imagis",
        label: "IMAGIS",
        tip: "tip",
        icon: "fa-home",
        active: true,
      },
    ];
    this.navbarItems = [
      {
        name: "imagis", //sidebar name
        navbar: [
          {
            name: "legend",
            label: "Legenda",
            tip: "Legenda",
            icon: "fa-layers",
          },
        ],
      },
      {
        name: "water", //sidebar name
        navbar: [
          {
            name: "legend",
            label: "Legenda",
            tip: "Legenda",
            icon: "fa-layers",
          },
        ],
      },
    ];

    this.setSidebar();
    this.header = new Container({
      className: "w3-bar", //w3-small
    });
    this.map.addControl(this.header);
    this.setHeader();
    this.setNavbar();
  }
  setNavbar() {
    //set sidebar's navbar items
    for (const ni of this.navbarItems) {
      const sidebar = map
        .getControls()
        .getArray()
        .find((x) => x.get("name") === ni.name);
        const navbar = new Container({
          className: "w3-bar-block", //w3-small
        });
        sidebar.addControl(navbar);
        const toggle = new Toggle({
          html: `<i class="far ${ni.icon} fa-fw"></i><span class="w3-hide-small"> ${ni.label}</span>`,
          className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
          tipLabel: ni.tip,
          active: ni.active || false,
          name: ni.name,
        });
        navbar.addControl(toggle);

    }
  }

  setSidebar() {
    for (const hi of this.headerItems) {
      const sidebar = new Container({
        className: "w3-sidebar",
        name: hi.name,
        hiddenClass: "w3-hide",
      });
      this.map.addControl(sidebar);
    }
  }
  setHeader() {
    for (const hi of this.headerItems) {
      const toggle = new Toggle({
        html: `<i class="far ${hi.icon} fa-fw"></i><span class="w3-hide-small"> ${hi.label}</span>`,
        className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
        tipLabel: hi.tip,
        active: hi.active || false,
        name: hi.name,
      });
      this.header.addControl(toggle);
      const sidebar = this.map
        .getControls()
        .getArray()
        .find((x) => x.get("name") === hi.name);
      if (hi.active === true) toggle.element.classList.add("w3-red");
      else toggle.element.classList.remove("w3-red");
      toggle.on("change:active", (evt) => {
        sidebar.setVisible(evt.active);
        toggle.element.classList.toggle("w3-red");
      });
    }
  }
}
