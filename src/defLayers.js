import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import TileWMS from 'ol/source/TileWMS';
import ImageMapGuide from 'ol/source/ImageMapGuide';
import ImageLayer from 'ol/layer/Image';
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
            if(this.map) this.map.addLayer(layer);
        }

    }
}