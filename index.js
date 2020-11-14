import 'ol/ol.css';
import '@fortawesome/fontawesome-pro/css/fontawesome.css';
import '@fortawesome/fontawesome-pro/css/regular.min.css';
import './src/main.css';
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

import baseDef from './def.json';
import Container from './src/container';
import DefLayers from './src/defLayers';
import DefEditor from './src/defEditor';


if (localStorage.getItem('def') === null) localStorage.setItem('def', JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem('def'));
def.path = window.location.href.split('/').slice(0, -1).join('/'); //base url

proj4.defs('EPSG:3765',
    '+proj=tmerc +lat_0=0 +lon_0=16.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);
const mapContainer = document.createElement('main');
mapContainer.className = 'map';
document.body.appendChild(mapContainer)
const view = new View({
    center: def.center,
    zoom: def.zoom,
    projection: new Projection({ //hr projection
        code: 'EPSG:3765',
        units: 'm',
        extent: [208311.05, 4614890.75, 724721.78, 5159767.36]
    })
});

const actionbar = new Container({
    className: 'bar action'
});
const statusbar = new Container({
    className: 'bar status'
});
window.map = new Map({
    target: mapContainer,
    view: view,
    controls: [
        new Zoom({
            target: actionbar.element
        }),
        new Rotate({
            target: actionbar.element,
            tipLabel: 'Sjever gore'
        }),
        new ScaleLine({
            target: statusbar.element
        })
    ]
});
map.getControls().getArray().map(x => {
    x.element.className = '';
    x.element.children
});
map.addControl(actionbar);
map.addControl(statusbar);
const menubar = new Container({
    className: 'bar menu'
});
map.addControl(menubar);
const sidebar = new Container({
    className: 'bar side'
});
map.addControl(sidebar);



sidebar.addControl(new DefEditor({
    def: def
}));

const defLayers = new DefLayers({
    def: def,
    map: map
})
defLayers.addTileLayers();
defLayers.addVectorLayers();