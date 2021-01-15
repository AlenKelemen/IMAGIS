import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";

/** thematic editor
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.label html to insert in the control
 * @param {ol/control} options.target container target
 * @param {string} options.contanerClassName contaner class name
 * @param {Object} options.cfg map definition
 */

export default class Legend extends Toggle {
  constructor(options = {}) {
    super(options);
    this.cfg = options.cfg;
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.container.element.classList.add("hidden");
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = document.createElement('header');
    this.header.innerHTML = 'Prostorni slojevi';
    this.header.className ='legend-header';
    this.container.element.appendChild(this.header);
    this.items = document.createElement('article');
    this.items.className ='legend-items';
    this.items.innerHTML = 'opwrigfhropweqigiroepqwgioerngioreqngoieqrngoirengoirewqngoiergniorengioreqngiorengierngiregnoirengirengiorengoireqngqerwingfwdkfgnir3fnmwdfnrifgnjiwrfgnrigfnrreqngkerqgnreqkgn'
    this.container.element.appendChild(this.items);
    this.footer = document.createElement('footer');
    this.footer.className ='legend-footer';
    this.container.element.appendChild(this.footer);



  }

}
