import 'ol/ol.css';
import '@fortawesome/fontawesome-pro/css/fontawesome.css';
import '@fortawesome/fontawesome-pro/css/regular.min.css';
import './ux.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ScaleLine from 'ol/control/ScaleLine';
import Rotate from 'ol/control/Rotate';
import Zoom from 'ol/control/Zoom';
import {
    register
} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
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
    addMap(){
        this.map = document.createElement('div');
        this.map.className='map';
        document.body.appendChild(this.map)
    }
}