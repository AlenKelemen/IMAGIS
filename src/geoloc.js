import Control from 'ol/control/Control';
import Geolocation from 'ol/Geolocation';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style
} from 'ol/style';
import {
    Vector as VectorLayer
} from 'ol/layer';
import {
    Vector as VectorSource
} from 'ol/source';

export default class Geolocator extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        const b = document.createElement('button');
        this.element.appendChild(b);
        this.element.className = options.className; //
        b.innerHTML = options.html || ''; //
        b.title = options.tipLabel; //
        this.active = options.active || false; //initial active
        this.positionFeature = new Feature();
        this.positionFeature.setStyle(new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: '#3399CC'
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        }));
        this.accuracyFeature = new Feature();
        const geolocation = new Geolocation({
            projection: options.map.getView().getProjection(), //options.view
            tracking: true,
            trackingOptions: {
                enableHighAccuracy: true
            }
        });
        geolocation.on('error', e => {
            alert(e.message);
            this.element.disabled = true;
            this.element.title = e.message;
            this.element.classList.add('disabled');
        });
        geolocation.on('change:position', () => {
            if (geolocation.getPosition()) {
                this.positionFeature.setGeometry(new Point(geolocation.getPosition()));
                this.element.color = 'red';
            }
        });
        geolocation.on('change:accuracyGeometry', () => {
            this.accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });
        b.addEventListener('click', evt => {
            if (this.active) {
                this.layer.setMap(null);
                this.layer = undefined;
            } else {
                this.layer = new VectorLayer({
                    map: options.map,
                    source: new VectorSource({
                        features: [this.accuracyFeature, this.positionFeature]
                    })
                });
                if (this.positionFeature) {
                    options.map.getView().fit(geolocation.getAccuracyGeometry().getExtent(), {
                        padding: [50, 50, 50, 50]
                    });
                }
            }
            this.active = !this.active
        });
    }
}