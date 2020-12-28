import Control from "ol/control/Control";
import Container from "./container";
import Toggle from "./toggle";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Draw from "ol/interaction/Draw";
import { point, segment, circle, polygon } from "@flatten-js/core";

/** create contaner with toggle
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 * @param {ol/control} options.target container target
 */

export default class SelectEx extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    this.header = document.createElement("header");
    this.header.className = "select-ex-header";
    this.header.innerHTML = `Dodatne mogućnosti odabira`;
    this.container.element.appendChild(this.header);
    options.target.addControl(this.container);
    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else this.container.element.classList.remove("active");
    });

    this.menu = new Container({
      semantic: "section",
      className: "select-ex-menu",
    });
    this.container.addControl(this.menu);

    this.line = new Toggle({
      className: "select-line",
      html: '<i class="far fa-heart-rate"></i>',
      tipLabel: "Odaberi objekte koji sijeku nacrtanu liniju",
    });
    this.menu.addControl(this.line);

    this.poly = new Toggle({
      className: "select-poly",
      html: '<i class="far fa-monitor-heart-rate"></i>',
      tipLabel: "Odaberi objekte unutar nacrtanog poligona",
    });
    this.menu.addControl(this.poly)

    this.inside = new Toggle({
      className: "select-inside",
      html: '<i class="far fa-layer-plus"></i>',
      tipLabel: "Odaberi objekte koji se nalaze unutar ili sijeku odabrani objekt",
    });
    this.menu.addControl(this.inside)
  }
}
