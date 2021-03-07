import Control from 'ol/control/Control';
/** Push button: just executes options.handleClick on click/touch
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *	@param {string[]} options.className clases to add to control
 *	@param {String} options.title title of the control
 *	@param {boolean} options.disabled control disabled, default false
 *	@param {String} options.html html to insert in the control
 *	@param {function} options.handleClick callback when control is clicked
 */
export default class Button extends Control {
    constructor(options = {}) {
        const e = document.createElement('button');
        super({ element: e });
        this.setDisabled(options.disabled);
        this.set("name", options.name || "button");
        this.element.className = options.className;
        this.element.innerHTML = options.html || '';
        this.element.title = options.title || '';
        const evtFunction = evt => {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            if (options.handleClick) options.handleClick.call(this, evt);
        };
        this.element.addEventListener("click", evtFunction);
    }
    getDisabled() {
        return this.element.style.pointerEvents === 'none';
    }
    setDisabled(b) {
        this.element.style.pointerEvents = b ? 'none': 'auto';
        this.dispatchEvent({ type: 'change:disabled', key: 'disabled', oldValue: !b, disabled: b });
    }
}