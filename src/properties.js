import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
/** create contaner with toggle
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string} options.className Control.element class name
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html string to insert in the control
 * @param {Object} options.select ol/interaction/Select
 * @param {Object} options.target target Container 
 */

export default class Properties extends Toggle {
  constructor(options = {}) {
    super(options);
    this.def = options.def;
    this.select = options.select;
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.header = document.createElement("header");
    this.header.className = "properties-header";
    this.header.innerHTML = `
    <div>Svojstva</div>
     `;
    this.container.element.appendChild(this.header);
    this.body = document.createElement("section");
    this.body.className = "properties-body";
    this.container.element.appendChild(this.body);
    this.callback = options.callback;
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
      } else this.container.element.classList.remove("active");
    });
   
  }

}
