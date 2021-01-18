
import Button from "./button";
/** configuration file editor
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.label html to insert in the control
 * @param {ol/control} options.target container target
 * @param {string} options.contanerClassName contaner class name
 */
export default class Cfg extends Button {
    constructor(options = {}) {
        super(options);
    }
    
}