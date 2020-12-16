import Container from "./container";
import Toggle from "./toggle";
import DefLayers from "./defLayers";
/** def JSON editor control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 * @param {ol/control} options.target container target
 * @param {string} options.contanerClassName target contaner class name
 * @param {object} options.def def json to edit
 */

export default class DefEditor extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({
      semantic: "section",
      className: options.contanerClassName,
    });
    this.def = options.def;
    this.addHeader("Postavke karte");
    this.addContent();
    options.target.addControl(this.container);
    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else this.container.element.classList.remove("active");
    });
  }
  addContent() {
    const content = document.createElement("section");
    content.className = "def-editor-content";
    this.textarea = document.createElement("textarea");
    this.textarea.innerHTML = JSON.stringify(this.def, null, 2);
    const defLayers = new DefLayers({
      def: this.def,
      map: map,
    });
    this.textarea.addEventListener("input", (evt) => {
      const v = evt.target.value;
      try {
        defLayers.setDef(JSON.parse(v));
        defLayers.removeVectorLayers();
        defLayers.addVectorLayers();
        defLayers.removeTileLayers();
        defLayers.addTileLayers();
      } catch (err) {
        console.log("DefEditor err: ", err);
      }
    });
    content.appendChild(this.textarea);
    this.container.element.appendChild(content);
  }
  addHeader(innerHtml) {
    const header = document.createElement("header");
    header.className = "def-editor-header";
    header.innerHTML = innerHtml;
    this.container.element.appendChild(header);
  }
}
