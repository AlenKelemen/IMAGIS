import Container from "./container";
import Toggle from "./toggle";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";
import { elt } from "./util";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    //header
    this.header = new Container({
      className: "w3-bar", //w3-small
    });
    this.header.element.style.position = "absolute";
    this.map.addControl(this.header);
    this.header.addControl(
      new Toggle({
        name: "imagis",
        className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
        html: `<i class="far fa-home fa-fw"></i><span class="w3-hide-small"> IMAGIS</span>`,
        tipLabel: "tip",
        icon: "fa-home",
        active: true,
        handleClick: (active) => this.imagis.setVisible(active),
      })
    );
    //sidebar
    this.imagis = new Container({
      className: "w3-sidebar w3-bar-block w3-animate-left",
      hiddenClass: "w3-hide",
    });
    this.map.addControl(this.imagis);
    this.addTaskbar(this.imagis);
    this.imagis.getTaskbar().addControl(
      new Toggle({
        name: "imagis",
        className: "w3-bar-item w3-button w3-right w3-padding-small w3-hover-red",
        html: `<i class="far fa-home fa-fw"></i><span class="w3-hide-small"> IMAGIS</span>`,
        tipLabel: "tip",
        icon: "fa-home",
        active: true,
      })
    )
    this.addTaskpane(this.imagis);

  }
  addTaskpane(control) {
    const taskpane = new Container({
      className: "w3-rest  w3-container",
    });
    control.addControl(taskpane);
    control.getTaskpane = () => {
      return taskpane;
    };
  }
  addTaskbar(control) {
    const taskbar = new Container({
      className: "w3-col w3-container w3-blue",
    });
    taskbar.element.style.cssText = "width:20px;height:100%";
    control.addControl(taskbar);
    control.getTaskbar = () => {
      return taskbar;
    };
  }
}
