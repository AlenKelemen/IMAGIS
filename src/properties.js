import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
/** create contaner with toggle
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.callback callback on click
 * @param {ol/control} options.target container target
 */

export default class Properties extends Toggle {
  constructor(options = {}) {
    super(options);
    this.def = options.def;
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
        this.onActive();
        if (this.callback) this.callback.call(this); //
      } else this.container.element.classList.remove("active");
    });
  }
  onActive() {
    this.getMap().getInteractions().on("add", (evt) => {
      console.log(evt);
    });
  }
}
