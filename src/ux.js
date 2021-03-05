import Container from "./container";
import Toggle from "./toggle";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    this.items = [
      {
        name: "imagis",
        label: "IMAGIS",
        tip: "tip",
        icon: "fa-home",
        active: true,
        sidebar: {
          navbar: [
            {
              name: "imagis",
              label: "",
              tip: "tip",
              icon: "fa-home",
              active: true,
            },
          ],
        },
      },
    ];
    this.header = new Container({
      className: "w3-bar", //w3-small
    });
    this.header.element.style.position = "absolute";
    this.map.addControl(this.header);
    for (const i of this.items) {
      this.add(i);
    }
  }
  add(item) {
    //header toggle
    const toggle = new Toggle({
      html: `<i class="far ${item.icon} fa-fw"></i><span class="w3-hide-small"> ${item.label}</span>`,
      className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
      tipLabel: item.tip,
      active: item.active || false,
      name: item.name,
    });
    this.header.addControl(toggle);
    //sidebar
    if (item.sidebar) {
      const sidebar = new Container({
        className: "w3-sidebar w3-display-container",
        hiddenClass: "w3-hide",
      });
      this.map.addControl(sidebar);
      if (item.active === true) toggle.element.classList.add("w3-red");
      else toggle.element.classList.remove("w3-red");
      toggle.on("change:active", (evt) => {
        sidebar.setVisible(evt.active);
        toggle.element.classList.toggle("w3-red");
      });
      //navbar in sidebar
      if (item.sidebar.navbar) {
        const navbar = new Container({
          className: "w3-bar-block w3-left",
          hiddenClass: "w3-hide",
        });
        sidebar.addControl(navbar);
        navbar.element.style.display='inline-block';
        //navbar items
        for (const item of item.sidebar.navbar) {
          const toggle = new Toggle({
            html: `<i class="far ${item.icon} fa-fw"></i><span class="w3-hide-small"> ${item.label}</span>`,
            className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
            tipLabel: item.tip,
            active: item.active || false,
            name: item.name,
          });
          navbar.addControl(toggle);
          const pane = new Container({
            className: "w3-container w3-right",
            hiddenClass: "w3-hide",
          });
          sidebar.addControl(pane);
          pane.element.style.display='inline-block';
        }
      }
    }
  }
}
