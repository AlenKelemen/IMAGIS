import Container from "./container";
import Toggle from "./toggle";

/** def JSON editor control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 * @param {HTML element} options.target container target
 */

export default class containerToggle extends Toggle {
    constructor(options = {}) {
        super();
        this.handleClick = evt => console.log(evt)
    }
}
