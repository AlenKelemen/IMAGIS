import Container from "./container";
import Toggle from "./toggle";
import Button from "./button";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import { elt } from "./util";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    //header
    this.header = new Container({
      name: "header",
      className: "w3-bar", //w3-small
    });
    this.header.element.style.position = "absolute";
    this.map.addControl(this.header);
    this.header.addControl(
      new Toggle({
        name: "imagis",
        className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
        html: `<i class="far fa-home fa-fw"></i><span class="w3-hide-small"> IMAGIS</span>`,
        tipLabel: "IMAGIS",
        active: true,
        activeClass: "w3-red",
        handleClick: (active) => this.imagis.setVisible(active),
      })
    );
    //imagis
    this.imagis = new Container({
      name: "imagis",
      className: "w3-sidebar w3-animate-left",
      hiddenClass: "w3-hide",
    });
    this.map.addControl(this.imagis);
    this.imagis.element.style.cssText = "width:fit-content;";
    //inside sidebar
    //taskbar
    this.addTaskbar(this.imagis);
    //taskbar controls
    this.imagis.getTaskbar().addControl(
      //close sidebar button
      new Button({
        name: "close",
        className: "w3-bar-item w3-button w3-padding-16",
        html: `<i class="far fa-times fa-fw">`,
        tipLabel: "tip",
        handleClick: () => this.header.getActiveControls()[0].element.click(),
      })
    );
  }
  addImagis(control) {
    this.imagis.getTaskbar().addControl(control);
    control.activeClass = "w3-red";
    control.element.classList.add("w3-bar-item", "w3-button", "w3-padding-16");
    control.container.hiddenCless = "w3-hide";
    control.container.element.style.cssText = "width:300px;height:100%";
  }
  getImagis() {
    return this.imagis;
  }
  addTaskbar(control) {
    const taskbar = new Container({
      name: "taskbar",
      className: "w3-col w3-bar-block w3-blue",
      hiddenClass: "w3-hide",
    });
    taskbar.element.style.cssText = "width:fit-content;height:100%";
    control.addControl(taskbar);
    control.getTaskbar = () => {
      return taskbar;
    };
  }
}
