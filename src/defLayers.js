import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VersionControl from './vcs';
import {
    makeStyle
} from './makeStyle';
/** Load layers as defined in def.json
 * @constructor
 * @param {Object=} options DefLayers options
 * @param {object} options.def def json
 * @param {object} options.map ol/map
 */

export default class DefLayers {
    constructor(options = {}) {
        this.def = options.def;
        this.map = options.map;
        this.localFolder = '/datas';
        this.vc = new VersionControl("fs");
        this.result = this.vc.clone(this.def.gitPath, this.localFolder);
    }
    getTHLayers() {
        const r = [];
        for (const [i, l] of this.def.layers.entries()) {
            const source = this.def.sources.find(x => x.name === l.source);
            if (['th', 'TH'].includes(source.type)) {
                r.push(l)
            }
        }
        return r;
    }
    addTHLayers() {
        for (const [i, l] of this.getTHLayers().entries()) {
            const s = this.def.sources.find(x => x.name === l.source);
            const base = {
                maxResolution: l.maxResolution,
                minResolution: l.minResolution,
                maxZoom: l.maxZoom,
                minZoom: l.minZoom,
                visible: l.visible,
                opacity: l.opacity,
                zIndex: l.zIndex || i, //if no l.zIndex in def take sequence
                name: l.name,
                label: l.label,
                info: l.info,
                translucent: l.translucent, //for traslucent tiled layer
                def: l
            };
            const layer = new VectorLayer(base);
            const source = new VectorSource({
                loader: (extent, resolution, projection) => {
                    fetch(s.path)
                        .then(r => r.json())
                        .then(r => {
                            const geojson = {
                                type: 'FeatureCollection',
                                features: []
                            };
                            for (const item of r) {
                                geojson.features.push({
                                    type: 'Feature',
                                    properties: {
                                        company_id: item.company_id,
                                        device_id: item.device_id,
                                        device_name: item.device_name,
                                        gain_id: item.gain_id,
                                        info_id: item.info_id
                                    },
                                    id: item.device_id,
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [
                                            item.longitude,
                                            item.latitude
                                        ]
                                    }
                                });
                            }
                            const features = new GeoJSON({
                                dataProjection: 'EPSG:4326',
                                featureProjection: 'EPSG:3765'
                            }).readFeatures(geojson);
                            source.addFeatures(features);
                        });
                }
            });
            layer.setSource(source);
            //add style
            if (l.style) layer.setStyle(makeStyle(l.style));
            layer.getSource().set('def', s);
            if (this.map) this.map.addLayer(layer);
        }
    }
    getTileLayers() {
        const r = [];
        for (const [i, l] of this.def.layers.entries()) {
            const source = this.def.sources.find(x => x.name === l.source);
            if (['osm', 'bing', 'wms'].includes(source.type)) {
                r.push(l)
            }
        }
        return r;
    }
    addTileLayers() {
        for (const [i, l] of this.getTileLayers().entries()) {
            const s = this.def.sources.find(x => x.name === l.source);
            const base = {
                maxResolution: l.maxResolution,
                minResolution: l.minResolution,
                maxZoom: l.maxZoom,
                minZoom: l.minZoom,
                visible: l.visible,
                opacity: l.opacity,
                zIndex: l.zIndex || i, //if no l.zIndex in def take sequence
                name: l.name,
                label: l.label,
                info: l.info,
                translucent: l.translucent, //for traslucent tiled layer
                def: l
            };
            const layer = new TileLayer(base);
            if (s.type === 'osm') layer.setSource(new OSM());
            if (s.type === 'bing')
                layer.setSource(new BingMaps({
                    key: s.APIKey,
                    imagerySet: s.imagerySet
                }));
            if (s.type === 'wms')
                layer.setSource(
                    new TileWMS(({
                        url: s.path,
                        params: s.params,
                        crossOrigin: 'anonymous'
                    }))
                );
            layer.getSource().set('def', s);
            if (this.map) this.map.addLayer(layer);
        }
    }
    removeTileLayers() { // remove 'osm', 'bing', 'wms' layers defined in def from map
        for (const [i, l] of this.getTileLayers().entries()) {
            this.map.removeLayer(this.map.getLayers().getArray().find(x => x.get('name') === l.name));
        }
    }
    getVectorLayers() { //get 'geojson' layers from def
        const r = [];
        for (const [i, l] of this.def.layers.entries()) {
            const source = this.def.sources.find(x => x.name === l.source);
            if (['geojson'].includes(source.type)) {
                r.push(l)
            }
        }
        return r;
    }
    addVectorLayers() {
        for (const [i, l] of this.getVectorLayers().entries()) {
console.log(s)
            const s = this.def.sources.find(x => x.name === l.source);
            const base = {
                maxResolution: l.maxResolution,
                minResolution: l.minResolution,
                maxZoom: l.maxZoom,
                minZoom: l.minZoom,
                visible: l.visible,
                opacity: l.opacity,
                zIndex: l.zIndex || i, //if no l.zIndex in def take sequence
                name: l.name,
                label: l.label,
                info: l.info,
                translucent: l.translucent, //for traslucent tiled layer
                def: l
            };
            const layer = new VectorLayer(base);
            const source = new VectorSource({
                loader: (extent, resolution, projection) => {
                    this.result.then(r => {
                        this.vc.readFile(this.localFolder + '/' + this.def.path + '/' + l.name + '.json').then(r => {
                            const features = new GeoJSON({
                                dataProjection: 'EPSG:4326',
                                featureProjection: 'EPSG:3765'
                            }).readFeatures(r);
                            source.addFeatures(features);
                            source.getFeatures().map(x => x.set('layer', layer));
                        })
                    });
                }
            });
            layer.setSource(source);
            //add style
            if (l.style) layer.setStyle(makeStyle(l.style));
            layer.getSource().set('def', s);
            if (this.map) this.map.addLayer(layer);
        }

    }
    removeVectorLayers() { // remove 'geojson' layers defined in def from map
        for (const [i, l] of this.getVectorLayers().entries()) {
            this.map.removeLayer(this.map.getLayers().getArray().find(x => x.get('name') === l.name));
        }
    }
    setStyle() { // set style from def to named layers 
        if (l.style) layer.setStyle(makeStyle(l.style));
    }
    setDef(def) { //change def
        this.def = def;
    }
}