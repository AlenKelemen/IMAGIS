import Container from "./container";
import DefLayers from "./defLayers";
/** def JSON editor control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {object} options.def def json to edit
 */

export default class DefEditor extends Container {
  constructor(options = {}) {
    super();
    this.def = options.def;
    this.textarea = document.createElement("textarea");
    this.element.appendChild(this.textarea);
    this.element.className = options.className || "defEditor";
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
  }
}
