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
import { makeStyle } from "./makeStyle";

export default class Def {
  constructor(options = {}) {
    this.cfg = options.cfg;
    this.map = options.map;
    this.localFolder = "/datas";
    this.vc = new VersionControl("fs");
    this.result = this.vc.clone(this.cfg.gitPath, this.localFolder);
    this.toMap();
    this.toLayers();
  }
  /**
   * map properties from cfg, changet only to def
   * events saved to cfg
   */
  toMap() {
    const cfg = this.cfg,
      m = this.map;
    m.set("project", cfg.project);
    m.getView().setCenter(cfg.center);
    m.getView().on("change:center", (evt) => (cfg.center = evt.target.getCenter()));
    m.getView().setZoom(cfg.zoom);
    m.getView().on("change:resolution", (evt) => (cfg.zoom = evt.target.getZoom()));
  }
  toLayers() {
    //layer's source can't be changed
    for (const [i, l] of this.cfg.layers.entries()) {
      const layer = this.map
        .getLayers()
        .getArray()
        .find((x) => x.get("name") === l.name);
      if (!layer) {
        const s = this.cfg.sources.find((x) => x.name === l.source);
        if (s.type === "osm") {
          layer = new TileLayer({
            name: l.name,
          });
          layer.setSource(new OSM());
          this.map.addLayer(layer);
        }
        if (s.type === "bing") {
          layer = new TileLayer({
            name: l.name,
          });
          layer.setSource(
            new BingMaps({
              key: s.APIKey,
              imagerySet: s.imagerySet,
            })
          );
          this.map.addLayer(layer);
        }
        if (s.type === "wms") {
          layer = new TileLayer({
            name: l.name,
          });
          layer.setSource(
            new TileWMS({
              url: s.path,
              params: s.params,
              crossOrigin: "anonymous",
            })
          );
          this.map.addLayer(layer);
        }
        if (["geojson"].includes(s.type)) {
          layer = new VectorLayer({
            name: l.name,
          });
          const source = new VectorSource({
            loader: (extent, resolution, projection) => {
              this.result.then((r) => {
                this.vc.readFile(this.localFolder + "/" + this.cfg.path + "/" + l.name + ".json").then((r) => {
                  const features = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3765",
                  }).readFeatures(r);
                  source.addFeatures(features);
                  source.getFeatures().map((x) => x.set("layer", layer));
                });
              });
            },
          });
          layer.setSource(source);
          this.map.addLayer(layer);
        }
        if (["th", "TH"].includes(s.type)) {
          layer = new VectorLayer({
            name: l.name,
          });
          const source = new VectorSource({
            loader: (extent, resolution, projection) => {
              fetch(s.path)
                .then((r) => r.json())
                .then((r) => {
                  const geojson = {
                    type: "FeatureCollection",
                    features: [],
                  };
                  for (const item of r) {
                    geojson.features.push({
                      type: "Feature",
                      properties: {
                        company_id: item.company_id,
                        device_id: item.device_id,
                        device_name: item.device_name,
                        gain_id: item.gain_id,
                        info_id: item.info_id,
                      },
                      id: item.device_id,
                      geometry: {
                        type: "Point",
                        coordinates: [item.longitude, item.latitude],
                      },
                    });
                  }
                  const features = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3765",
                  }).readFeatures(geojson);
                  source.addFeatures(features);
                });
            },
          });
          layer.setSource(source);
          this.map.addLayer(layer);
        }
      }
      for (const [key, value] of Object.entries(l)) {
        if (key !== "source" && key != "style") layer.set(key, value);
        if (key === "style") {
          if (layer instanceof VectorLayer) layer.setStyle(makeStyle(value));
        }
      }
    }
  }
}
