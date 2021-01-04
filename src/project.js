import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
/** Project editor
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string} options.className Control.element class name
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html string to insert in the control
 * @param {Object} options.target target Container
 * @param {string} options.contanerClassName contaner class name
 */

export default class Project extends Toggle {
  constructor(options = {}) {
    super(options);
    this.def = options.def;
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.header = document.createElement("header");
    this.header.className = "project-header";
    this.header.innerHTML = `
    <div>Projekt</div>
     `;
    this.container.element.appendChild(this.header);
    this.body = document.createElement("section");
    this.body.className = "project-body";
    this.container.element.appendChild(this.body);
    const save = document.createElement("div");
    save.innerHTML = '<i class="far fa-check fa-fw"></i> Spremi';
    save.className = "project-save ol-control";
    save.addEventListener('click', evt =>{
console.log(this.def)
    });
    this.body.appendChild(save);
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
      } else this.container.element.classList.remove("active");
    });
  }
}
