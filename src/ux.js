import Container from "./container";
import Toggle from "./toggle";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import { elt } from "./util";

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
        sidebar: [
          {
            name: "close",
            label: "",
            tip: "zatvori",
            icon: "fa-times",
          },
          {
            name: "imagis",
            label: "",
            tip: "tip",
            icon: "fa-home",
            active: true,
          },
        ],
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
        className: "w3-sidebar w3-bar-block w3-animate-left",
        hiddenClass: "w3-hide",
      });
      this.map.addControl(sidebar);
      sidebar.element.style.width = "unset";
      /* //close sidebar button
      const close = elt("button", { className: "w3-bar-item w3-button  w3-padding-small w3-right-align" }, "x");
      close.addEventListener("click", (evt) => {
        toggle.setActive(false);
      }); */
      //sidebar.element.appendChild(close);
      if (item.active === true) toggle.element.classList.add("w3-red");
      else toggle.element.classList.remove("w3-red");
      toggle.on("change:active", (evt) => {
        sidebar.setVisible(evt.active);
        toggle.element.classList.toggle("w3-red");
      });
      //inside sidebar
      if (item.sidebar) {
        for(const item of item.sidebar){
          const toggle = new Toggle({
            html: `<i class="far ${item.icon} fa-fw"></i><span class="w3-hide-small"> ${item.label}</span>`,
            className: "w3-bar-item w3-button w3-padding-small w3-hover-red",
            tipLabel: item.tip,
            active: item.active || false,
            name: item.name,
          });
          sidebar.addControl(toggle);
        }

      }
    }
  }
}
