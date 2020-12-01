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
import Geolocator from './src/geoloc';
import Select from './src/select';
import Legend from './src/legend';

//local project def
if (localStorage.getItem('def') === null) localStorage.setItem('def', JSON.stringify(baseDef));
const def = JSON.parse(localStorage.getItem('def'));
// ol/map
const mapContainer = document.createElement('main');
mapContainer.className = 'map';
document.body.appendChild(mapContainer)
window.map = new Map({
    target: mapContainer,
    view: new View({
        center: def.center,
        zoom: def.zoom,
        projection: new epsg3765()
    }),
    controls: []
});
//UX
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
const navRight = new Container({ // side menu right
    semantic: 'nav',
    className: 'nav-right'
});
const navLeft = new Container({ // side menu left
    semantic: 'nav',
    className: 'nav-left'
});

//map.addControl(header);
map.addControl(aside);
map.addControl(footer);

aside.addControl(navLeft);
aside.addControl(navRight);
navRight.addControl(new Zoom({}));
navRight.addControl(new Rotate({
    tipLabel: 'Sjever gore'
}));
const legend = new Legend({
    className: 'legend',
    html: '<i class="far fa-layer-group"></i>',
    tipLabel: 'Legenda'
});
navLeft.addControl(legend);
//layers as defined in def.json
const defLayers = new DefLayers({
    def: def,
    map: map
});
defLayers.addTileLayers();
defLayers.addVectorLayers();
defLayers.addTHLayers();
/* navLeft.addControl(new DefEditor({
    def: def
})); */
//geolocate
const geolocator = new Geolocator({
    map: map,
    className: 'geolocator ol-control',
    html: '<i class="far fa-map-marker-alt"></i>',
    tipLabel: 'Pokaži moju lokaciju'
});
navRight.addControl(geolocator);
//select
const select = new Select({
    active: true,
    className: 'select-info'
});
map.addInteraction(select);
select.addInfo(footer, { className: 'select-info' });
select.addUI(navRight, {
    point: {
        className: 'select-point',
        html: '<i class="far fa-mouse-pointer"></i>',
        title: 'Odaberi objekte'
    }
});
//scale line - last control, variying width
footer.addControl(new ScaleLine({
    target: footer.element
}));