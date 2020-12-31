import Control from 'ol/control/Control';
import {
    Select
} from 'ol/interaction';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
    point,
    segment,
    polygon
} from '@flatten-js/core';

export default class SelectInSelected extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('button')
        });
        this.element.className = options.className;
        this.element.innerHTML = options.html || '';
        this.element.title = options.tipLabel || '';
        this.select = options.select;
        this.selectStyle = options.selectStyle; // selection draw style
        this.deselect = options.deselect || true; //deselect on click on map
        this.intersect = options.intersect; // select contains and crossing features 
        this.element.addEventListener('click', evt => {
            this.setActive(!this.getActive());
            this.select.setActive(false);
        });
    }
    setActive(b) {
        if (this.getActive() == b) return;
        if (b) {
            this.element.classList.add('active');
            if (this.getParent()) this.getParent().deactivateControls(this); //see container.js for deactivateControls
            const inSelectOptions = {};
            if (this.selectStyle) inSelectOptions.style = this.selectStyle;
            this.inSelect = new Select(inSelectOptions);
            this.getMap().addInteraction(this.inSelect);
            this.inSelect.on('select', evt => {
                for (const f of evt.target.getFeatures().getArray()) {
                    const p = polygon(f.getGeometry().getCoordinates());
                    for (const l of map.getLayers().getArray()) {
                        if (l instanceof VectorLayer)
                            for (const f of l.getSource().getFeatures()) {
                                let g = f.getGeometry();
                                try {
                                    if (g.getType() === 'Point') {
                                        const intersect = p.intersect(point(g.getFirstCoordinate()));
                                        if (intersect.length > 0) {
                                            this.select.getFeatures().push(f);
                                        }
                                    }
                                    if (g.getType() === 'LineString') {
                                        let flag = true;
                                        g.forEachSegment((s, e) => {
                                            try {
                                                const ls = segment(point(s), point(e));
                                                if (this.intersect && p.intersect(ls).length > 0) this.select.getFeatures().push(f);
                                                if (!p.contains(ls)) flag=false;
                                            } catch (err) {}
                                        });
                                        if (flag) this.select.getFeatures().push(f);
                                    }
                                    if (g.getType() === 'Polygon') {
                                        try {
                                            if (p.contains(polygon(g.getCoordinates()))) this.select.getFeatures().push(f);
                                            if (this.intersect && p.intersect(g).length > 0) this.select.getFeatures().push(f);
                                        } catch (err) {}
                                    }
                                } catch (err) {
                                    console.log(err);
                                }

                            }
                        this.select.dispatchEvent('select');
                    }
                }
                this.inSelect.getFeatures().clear();
            });
        } else {
            this.element.classList.remove('active');
            this.inSelect.getFeatures().clear();
            this.getMap().removeInteraction(this.inSelect);
        }
        this.dispatchEvent({
            type: 'change:active',
            key: 'active',
            oldValue: !b,
            active: b
        });
    }
    getActive() {
        return this.element.classList.contains('active');
    }
    /**
     * Parent control (navbar)
     * @return {bool}.
     */
    getParent() {
        if (this.get('parent')) {
            return this.get('parent');
        }
    }
}