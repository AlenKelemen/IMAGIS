import Control from 'ol/control/Control';
/** Container for controls
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string[='legend']} options.className 
 */
export default class Legend extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        this.element.className = options.className || 'legend'; //
    }
    addButton(options = {}) {
        this.button = document.createElement('button');
        this.button.innerHTML = options.html || ''; //
        this.button.title = options.tipLabel; //
        this.button.addEventListener('click', evt => {
            this.setActive(!this.getActive());
        });
        this.element.appendChild(this.button);
    }
}