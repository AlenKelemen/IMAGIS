import Control from "ol/control/Control";
import Container from "./container";
import Toggle from "./toggle";

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
    this.header.innerHTML = `Proširene mogućnosti odabira`;
    this.container.element.appendChild(this.header);
    this.body = document.createElement("section");
    this.body.className = "select-ex-body";
    this.container.element.appendChild(this.body);
    options.target.addControl(this.container);
    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else this.container.element.classList.remove("active");
    });

    this.line = new Toggle({
      className: "select-line",
      html: '<i class="far fa-heart-rate"></i>',
      tipLabel: "Odaberi objekte koji sijeku nacrtanu liniju",
    });
    this.container.addControl(this.line)
    this.body.appendChild(this.line.element);

    this.poly = new Toggle({
      className: "select-poly",
      html: '<i class="far fa-monitor-heart-rate"></i>',
      tipLabel: "Odaberi objekte unutar nacrtanog poligona",
    });
    this.container.addControl(this.poly)
    this.body.appendChild(this.poly.element);
    
    this.inside = new Toggle({
      className: "select-inside",
      html: '<i class="far fa-layer-plus"></i>',
      tipLabel: "Odaberi objekte koji se nalaze unutar ili sijeku odabrani objekt",
    });
    this.container.addControl(this.inside)
    this.body.appendChild(this.inside.element);


  }
}
