import Control from "ol/control/Control";

/** Properties
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object} options Control options.
 * @param {string} options.className
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 
 */
export default class Legend extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement("button")
        });
        this.element.className = options.className; //
        this.element.innerHTML = options.html; //
        this.element.title = options.tipLabel; //
        //property dialog
        this.content = new Control({
            element: document.createElement("div")
        });
        this.content.element.className =
            options.dialogClassName || "properties ol-control";

        const evtFunction = evt => {
            if (
                // add connent control to map only on first click
                this.getMap()
                    .getControls()
                    .getArray()
                    .find(x => x === this.content) === undefined
            )
                this.getMap().addControl(this.content);
            if (this.getParent()) this.getParent().deactivateControls(this); //see navbar.js for deactivateControls
            if (evt && evt.preventDefault) {
                evt.preventDefault();
                evt.stopPropagation();
                this.setActive(!this.getActive());
                if (options.handleClick) options.handleClick.call(this, evt);
            }
        };
        this.element.addEventListener("click", evtFunction);
    }
    properties_() {

    }
    setActive(b) {
        if (this.content.element.innerHTML === "") this.properties_();
        if (this.getActive() == b) return;
        if (b) {
            this.content.element.classList.add("active");
            this.element.classList.add("active");
            if (this.getParent()) this.getParent().deactivateControls(this); //see container.js for deactivateControls
        } else {
            this.content.element.classList.remove("active");
            this.element.classList.remove("active");
        }
        this.dispatchEvent({
            type: "change:active",
            key: "active",
            oldValue: !b,
            active: b
        });
    }
    getActive() {
        return this.element.classList.contains("active");
    }
    getParent() {
        if (this.get("parent")) return this.get("parent");
    }
}