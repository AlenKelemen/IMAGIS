import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import BingMaps from "ol/source/BingMaps";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VersionControl from "./vcs";
import Layer from "ol/layer/Layer";
import { Icon, Fill, Stroke, Circle, Text, RegularShape, Style } from "ol/style";
const images = require("../img/*.png");
import cfg from "../cfg.json";

export default class Config {
  constructor(options = {}) {
    if (!localStorage.getItem("cfg")) {
      localStorage.setItem("cfg", JSON.stringify(cfg));
    }
    this.cfg = JSON.parse(localStorage.getItem("cfg"));
    this.map = options.map;
    this.localFolder = "/datas";
    this.vc = new VersionControl("fs");
    this.result = this.vc.clone(this.cfg.gitPath, this.localFolder);
  }
  /**
   *return hardcoded cfg
   *
   * @return {*} 
   * @memberof Config
   */
  getDefault() {
    return cfg;
  }
  setCfg(cfg) {
    this.cfg = cfg;
  }
  getCfg() {
    return this.cfg;
  }
  /**
   *Layer cfg source
   *
   * @param {string} layerName
   * @return {Object} layer source as defined in cfg
   * @memberof Config
   */
  getSrc(layerName) {
    return this.cfg.sources.find((x) => x.name === this.cfg.layers.find((x) => x.name === layerName).source);
  }
  /**
   *Filter cfg sources for type
   *
   * @param {string} [type="tile"] 'tile','osm','bing','wms','geojson','TH'
   * @return {Array} layers for type
   * @memberof Config
   */
  filterByType(type = "tile") {
    const r = [];
    for (const [i, l] of this.cfg.layers.entries()) {
      if (type === "tile" && ["osm", "bing", "wms"].includes(this.getSrc(l.name).type)) r.push(l);
      if (type === "osm" && type === this.getSrc(l.name).type) r.push(l);
      if (type === "bing" && type === this.getSrc(l.name).type) r.push(l);
      if (type === "wms" && type === this.getSrc(l.name).type) r.push(l);
      if (type === "geojson" && type === this.getSrc(l.name).type) r.push(l);
      if (type === "th" && type === this.getSrc(l.name).type) r.push(l);
    }
    return r;
  }
  /**
   *Layers defined in cfg and missing in map/existig in map
   *
   * @return {Object} missig layers, exist layers
   * @memberof Config
   */
  check() {
    const r = { exist: [], missing: [] };
    for (const [i, l] of this.cfg.layers.entries()) {
      if (
        this.map
          .getLayers()
          .getArray()
          .find((x) => x.get("name") === l.name)
      )
        r.exist.push(l);
      else r.missing.push(l);
    }
    return r;
  }
  /**
   * Reads cfg object and creates or updates layers
   * Changes in layer properties in ol changes cfg
   * Source and style can't be updated this way
   * For source a new layer must be defined
   * Ol style changes are not saved to cfg
   *
   * @param {boolean} [create=true] create layers in map if needed
   * @param {boolean} [remove=false] remove layers in map which are not in cfg
   * @memberof Proj
   */
  update(create = true, remove = false) {
    const c = this.check();
    if (create) {
      // creates only missing layers
      for (const l of c.missing) {
        const s = this.getSrc(l.name);
        let layer;
        if (s.type === "osm") {
          layer = new TileLayer();
          layer.setSource(new OSM());
          this.map.addLayer(layer);
        }
        if (s.type === "bing") {
          layer = new TileLayer();
          layer.setSource(
            new BingMaps({
              key: s.APIKey,
              imagerySet: s.imagerySet,
            })
          );
          this.map.addLayer(layer);
        }
        if (s.type === "wms") {
          layer = new TileLayer();
          layer.setSource(
            new TileWMS({
              url: s.path,
              params: s.params,
              crossOrigin: "anonymous",
            })
          );
          this.map.addLayer(layer);
        }
        if (s.type === "geojson") {
          layer = new VectorLayer();
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
          source.set("schema", s.schema);
          layer.setSource(source);
          layer.setStyle(this.cfg2style(l.style));
          this.map.addLayer(layer);
        }
        if (s.type === "th") {
          layer = new VectorLayer();
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
          source.set("schema", s.schema);
          layer.setSource(source);
          layer.setStyle(this.cfg2style(l.style));
          this.map.addLayer(layer);
        }
        if (layer)
          for (const [key, value] of Object.entries(l)) {
            if (key !== "source" && key != "style") layer.set(key, value);
          }
        layer.set("cfg", l);
        layer.on("propertychange", (evt) => {
          console.log(layer);
          const newValue = evt.target.get(evt.key);
          l[evt.key] = newValue;
          console.log(l[evt.key]);
        });
      }
    } else {
      //updates existing map layers for properties defined in cfg for layer
      for (const l of c.exist) {
        const layer = this.map
          .getLayers()
          .getArray()
          .find((x) => x.get("name") === l.name);
        for (const [key, value] of Object.entries(l)) {
          if (key !== "source" && key != "style") layer.set(key, value);
          if (key === "style") {
            if (layer instanceof VectorLayer) layer.setStyle(this.cfg2style(l.style));
          }
        }
      }
    }
    if (remove) {
      for (const l of this.map.getLayers().getArray()) {
        if (!this.cfg.layers.find((x) => x.name === l.get("name"))) {
          this.map.removeLayer(l);
        }
      }
    }
  }
  cfg2View() {
    const cfg = this.cfg,
      m = this.map,
      v = m.getView();
    m.set("project", cfg.project);
    v.setCenter(cfg.center);
    v.on("change:center", (evt) => (cfg.center = evt.target.getCenter()));
    v.setZoom(cfg.zoom);
    v.on("change:resolution", (evt) => (cfg.zoom = evt.target.getZoom()));
  }
  updateView() {
    const cfg = this.cfg,
      m = this.map,
      v = m.getView();
    v.setZoom(this.cfg.zoom);
    v.setCenter(this.cfg.center);
    v.set("project", this.cfg.project);
  }
  
}