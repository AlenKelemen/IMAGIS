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

export default class containerToggle extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({ semantic: "section", className: options.contanerClassName });

    this.addHeader("Header");
    this.addContent(`
    lwkdfvkermvkmvklwkdfvke
    rmvkmvklwkdfvke
    rmvkmvklwkdfvkermv
    kmvklwkdfvkermvkmvklw
    kdfvkermvkmvkl
    wkdfvkermv
    kmvklwkdfvkermvkmvk
    lwkdfvkermvkmvklwkdfvke
    rmvkmvklwkd
    fvkermvkmvkl
    wkdfvkermvkmvk
    lwkdfvkermvkmvklw
    kdfvkermvk
    mvklwkdfvkermvkmvk`);

    options.target.addControl(this.container);

    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else this.container.element.classList.remove("active");
    });
  }
  addContent(innerHtml) {
    const content = document.createElement("section");
    content.className = "content";
    content.innerHTML = innerHtml;
    this.container.element.appendChild(content);
  }
  addHeader(innerHtml) {
    const header = document.createElement("header");
    header.className = "header";
    header.innerHTML = innerHtml;
    this.container.element.appendChild(header);
  }
}
