import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import BingMaps from "ol/source/BingMaps";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import VersionControl from "./vcs";

export default class Def {
  constructor(options = {}) {
    this.def = options.def;
    this.map = options.map;
  }
  /**
   * map properties from def, changet only to def
   * events saved to def
   */
  toMap() {
    const d = this.def,
      m = this.map;
    m.set("project", d.project);
    m.getView().setCenter(d.center);
    m.getView().on("change:center", (evt) => (d.center = evt.target.getCenter()));
    m.getView().setZoom(d.zoom);
    m.getView().on("change:resolution", (evt) => (d.zoom = evt.target.getZoom()));
  }
  addLayers() {
    for (const [i, l] of this.def.layers.entries()) {
      const sourceDef = this.def.sources.find((x) => x.name === l.source);
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
      }; 
      if (["th", "TH"].includes(sourceDef.type)){
        const layer = new VectorLayer(base);
        const source = new VectorSource({
          loader: (extent, resolution, projection) => {
            fetch(sourceDef.path)
            .then(r => r.json())
            .then(r => {
              const geojson = {
                type: "FeatureCollection",
                features: []
              };
              for (const item of r) {
                geojson.features.push({
                  type: "Feature",
                  properties: {
                    company_id: item.company_id,
                    device_id: item.device_id,
                    device_name: item.device_name,
                    gain_id: item.gain_id,
                    info_id: item.info_id
                  },
                  id: item.device_id,
                  geometry: {
                    type: "Point",
                    coordinates: [item.longitude, item.latitude]
                  }
                });
              }
              const features = new GeoJSON({
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3765"
              }).readFeatures(geojson);
              source.addFeatures(features);
              source.getFeatures().map(x => x.set("layer", layer));
            });
          }
        });
        layer.setSource(source);
        this.map.addLayer(layer);
      }
      
      
    }
  }
  
}
