import 'ol/ol.css';
import '@fortawesome/fontawesome-pro/css/fontawesome.css';
import '@fortawesome/fontawesome-pro/css/regular.min.css';
import './ux.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ScaleLine from 'ol/control/ScaleLine';
import Rotate from 'ol/control/Rotate';
import Zoom from 'ol/control/Zoom';
import Projection from 'ol/proj/Projection';
import {
    register
} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

import def from './def.json';
/**
 *
 *
 * @export
 * @class UX
 * @extends {Control}
 * @param {Object=} options Control options. 
 */
export default class UX {
    constructor(options = {}) {
        this.addMap();
    }
    addMap() {
        proj4.defs('EPSG:3765',
            '+proj=tmerc +lat_0=0 +lon_0=16.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        register(proj4);
        this.map = document.createElement('div');
        this.map.className = 'map';
        document.body.appendChild(this.map)
        const view = new View({
            center: def.center,
            zoom: def.zoom,
            projection: new Projection({ //hr projection
                code: 'EPSG:3765',
                units: 'm',
                extent: [208311.05, 4614890.75, 724721.78, 5159767.36]
            })
        });
        window.map = new Map({
            target: this.map,
            view: view,
            controls: [
                new ScaleLine(),
                new Rotate({
                    tipLabel: 'Sjever gore'
                }),
                new Zoom({
                    zoomInTipLabel: 'Približi',
                    zoomOutTipLabel: 'Udalji'
                })
            ]
        });
    }
}