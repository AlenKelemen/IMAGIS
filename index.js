import 'ol/ol.css';
import '@fortawesome/fontawesome-pro/css/fontawesome.css';
import '@fortawesome/fontawesome-pro/css/regular.min.css';
import './src/main.css';
import Map from 'ol/Map';
import View from 'ol/View';
import ScaleLine from 'ol/control/ScaleLine';
import Rotate from 'ol/control/Rotate';
import Zoom from 'ol/control/Zoom';

import epsg3765 from './src/EPSG3765';
import baseDef from './def.json';
import Container from './src/container';
import DefLayers from './src/defLayers';
import DefEditor from './src/defEditor';


if (localStorage.getItem('def') === null) localStorage.setItem('def', JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem('def'));
def.path = window.location.href.split('/').slice(0, -1).join('/'); //base url

const mapContainer = document.createElement('main');
mapContainer.className = 'map';
document.body.appendChild(mapContainer)
const view = new View({
    center: def.center,
    zoom: def.zoom,
    projection: new epsg3765()
});
const header = new Container({ //menu
    semantic: 'header',
    className: 'ol-control'
});
const footer = new Container({ //status
    semantic: 'footer'
});
const aside = new Container({ // contaner for left & right side menus, taskpanes etc
    semantic: 'aside'
});
const nav = new Container({ // side menu
    semantic: 'nav'
});
window.map = new Map({
    target: mapContainer,
    view: view,
    controls: [
        new Zoom({
            target: nav.element
        }),
        new Rotate({
            target: nav.element,
            tipLabel: 'Sjever gore'
        }),
        new ScaleLine({
            target: footer.element
        })
    ]
});
map.addControl(header);
map.addControl(aside);
map.addControl(footer);

header.element.innerHTML = '<button>IMAGIS</button>'
aside.addControl(new DefEditor({
    def: def
}));
aside.addControl(nav);

const defLayers = new DefLayers({
    def: def,
    map: map
});
defLayers.addTileLayers();
defLayers.addVectorLayers();