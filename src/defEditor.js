import Control from 'ol/control/Control';
import DefLayers from './defLayers';
/** def JSON editor control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {object} options.def def json to edit
 */

export default class DefEditor extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('textarea')
        });
        this.def = options.def;
        this.element.className =options.className || 'defEditor';
        this.element.innerHTML = JSON.stringify(this.def, null, 2);
        const defLayers = new DefLayers({
            def: this.def,
            map: map
        })
        this.element.addEventListener('input', evt => {
            const v = evt.target.value;
            try {
                defLayers.setDef(JSON.parse(v));
                defLayers.removeVectorLayers();
                defLayers.addVectorLayers();
            } catch (err) {
                console.log('DefEditor err: ', err);
            }
        })
    }
}