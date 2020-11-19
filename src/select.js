import Control from 'ol/control/Control';
import olSelect from 'ol/interaction/Select';
import Container from './container';
import Toggle from './toggle';


export default class Select extends olSelect {
    constructor(options = {}) {
        super({
            hitTolerance: 2,
            multi: true // A boolean that determines if the default behaviour should select only single features or all (overlapping) features
        });
        this.setActive(options.active || false); // innitial
        this.info = new Control({
            element: document.createElement('span')
        })
        this.info.element.className = options.className || 'select-info ol-unselectable';
        this.info.element.innerHTML = 'Odabrano: 0';
        this.on('select', evt => {
            this.info.element.innerHTML = 'Odabrano: ' + evt.target.getFeatures().getLength();
        });
        this.ui = new Container({
            className: 'select-container'
        });
        this.ui.addControl(new Toggle({
            className: 'select-point ol-control',
            html: '<i class="far fa-mouse-pointer"></i>',
            tipLabel: 'Odaberi objekte'
        }))
    }
}