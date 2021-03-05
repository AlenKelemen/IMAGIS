import Projection from 'ol/proj/Projection';
import {
    register
} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

export default class EPSG3765 extends Projection {
    constructor() {
        proj4.defs('EPSG:3765',
            '+proj=tmerc +lat_0=0 +lon_0=16.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        register(proj4);
        super({
            code: 'EPSG:3765',
            units: 'm',
            extent: [208311.05, 4614890.75, 724721.78, 5159767.36]
        });
    }
    getCenter(){
        const e = this.getExtent();
        return [(e[0]+e[2])/2, (e[1]+e[3])/2]
    }
}