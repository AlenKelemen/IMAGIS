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
        this.element.className = options.className; //
        this.button = document.createElement('button');
        this.button.innerHTML = options.html || ''; //
        this.button.title = options.tipLabel; //
        this.button.addEventListener('click', evt => {
            this.setActive(!this.getActive());
        });
        this.content = document.createElement('span');
        this.element.appendChild(this.button);
        this.element.appendChild(this.content);

    }
    legend_() {
        //in legend one can change layer opacitiy, visibility, zIndex, active property
        const list = document.createElement('span');
        list.className = 'legend-items';
//
        list.innerText = 'sdfvafdvfdasbvrefgsbgfsbgrbgfbrgbgfbgfbgr'
//
        this.content.appendChild(list);
    }
    setActive(b) {
        this.content.style.display = b ? 'inline-block' : 'none';
        if (this.content.innerHTML === '') this.legend_();
        if (this.getActive() == b) return;
        if (b) {
            this.button.classList.add('active');
            if (this.getParent()) this.getParent().deactivateControls(this); //see container.js for deactivateControls
        } else this.button.classList.remove('active');
        this.dispatchEvent({
            type: 'change:active',
            key: 'active',
            oldValue: !b,
            active: b
        });
    }
    getActive() {
        return this.button.classList.contains('active');
    }
    getParent() {
        if (this.get('parent')) return this.get('parent');
    }

}