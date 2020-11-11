import Control from 'ol/control/Control';
/** Container for controls
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clases to add to control
 * @param {boolean[=true]} options.visible initally visible
 */

export default class Container extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        this.element.className = options.className || 'container'; // className
        this.controls_ = [];
    }
    setVisible(visible) { // set element visible
        this.element.style.display = visible ? 'block' : 'none';
        this.dispatchEvent({
            type: 'change:active',
            key: 'active',
            oldValue: !visible,
            active: visible
        });
    }
    getVisible() { // get element visible
        return this.element.style.display === 'none' ? false : true;
    }
    addControl(control) { // ad control
        this.controls_.push(control);
        control.setTarget(this.element);
        control.set('parent', this);
        if (this.getMap()) this.getMap().addControl(control);
    }
    removeControl(control) {
        this.controls_.splice(this.controls_.findIndex(x => x === control), 1);
        this.getMap().removeControl(control);
    }
    getControls() {
        return this.controls_;
    }
    /** Get active controls in a container
     * @return {object []} active controls
     */
    getActiveControls() {
        var active = [];
        for (const control of this.controls_) {
            if (control.getActive()) active.push(control);
        }
        return active;
    }
     /** Deactivate all controls in a container
      * @param {_ol_control_} except a control to keep active, if except == undefined all controls are deactivated
      */
     deactivateControls(except) {
         for (const control of this.controls_) {
             if (control !== except) {
                 if (control.getActive()) control.setActive(false);
             }
         }
     }
}