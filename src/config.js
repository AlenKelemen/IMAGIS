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
  getDefault() {
    return cfg;
  }
  setCfg(cfg) {
    this.cfg = cfg;
  }
  getCfg() {
    return this.cfg;
  }
  getSrc(layerName) {
    return this.cfg.sources.find((x) => x.name === this.cfg.layers.find((x) => x.name === layerName).source);
  }
  filterByType(type = "tile") {
    //'tile','osm','bing','wms','geojson','TH'
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
   * @param {boolean} [create=true]
   * @memberof Proj
   */
  update(create = true,remove=false) {
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
          console.log(layer)
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
    if(remove){
      for(const l of this.map.getLayers().getArray()){
        if(! this.cfg.layers.find(x => x.name === l.get('name'))){
          this.map.removeLayer(l)
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
  cfg2style(styleSpec) {
    if (!styleSpec) return; //default style
    const sp = Array.isArray(styleSpec) ? styleSpec : [styleSpec]; //allways as array
    return function (feature, resolution) {
      const styles = [];
      for (const s of sp) {
        let style = new Style();

        let filterFlag = true,
          resFlag = true;
        if (s.filter && feature) {
          const f = s.filter;
          if (f.value && f.property) {
            const p = feature.get(f.property) || "";
            switch (f.operator) {
              case "=":
                filterFlag = p == f.value;
                break;
              case ">":
                filterFlag = p > f.value;
                break;
              case "<":
                filterFlag = p < f.value;
                break;
              case ">=":
                filterFlag = p >= f.value;
                break;
              case "<=":
                filterFlag = p <= f.value;
                break;
              case "!=":
                filterFlag = p != f.value;
                break;
              case "LIKE":
                filterFlag = p && f.value && (p + "").search(f.value) !== -1;
            }
          }
        }
        if (s.resolution) resFlag = s.resolution[0] < resolution && resolution < s.resolution[1];
        if (filterFlag && resFlag) {
          if (s.fill)
            style.setFill(
              new Fill({
                color: s.fill.color,
              })
            );
          if (s.stroke)
            style.setStroke(
              new Stroke({
                color: s.stroke.color,
                width: s.stroke.width,
              })
            );
          if (s.text) {
            if (!s.text.resolution || (s.text.resolution[0] < resolution && s.text.resolution[1] > resolution)) {
              style.setText(
                new Text({
                  font: s.text.font,
                  scale: s.text.scale,
                  maxAngle: s.text.maxAngle,
                  offsetX: s.text.offsetX,
                  offsetY: s.text.offsetY,
                  placement: s.text.placement, //
                  textAlign: s.text.textAlign,
                  textBaseline: s.text.textBaseline, //
                  padding: s.text.padding,
                })
              );
              if (s.text.text) {
                if (feature) {
                  const text = feature.get(s.text.text); //no feature defined - no text
                  if (!text && s.text.text !== "") {
                    if (s.text.text.startsWith("*")) style.getText().setText(s.text.text.substr(1));
                    else style.getText().setText("");
                  } else style.getText().setText(text + "");
                } else {
                  style.getText().setText(s.text.text + "");
                }
              }
              if (s.text.fill) {
                style.getText().setFill(
                  new Fill({
                    color: s.text.fill.color,
                  })
                );
              }
              if (s.text.stroke) {
                style.getText().setStroke(
                  new Stroke({
                    color: s.text.stroke.color,
                    width: s.text.stroke.width,
                  })
                );
              }
              if (s.text.backgroundStroke) {
                style.getText().setBackgroundStroke(
                  new Stroke({
                    color: s.text.backgroundStroke.color,
                    width: s.text.backgroundStroke.width,
                  })
                );
              }
              if (s.text.backgroundFill) {
                style.getText().setBackgroundFill(
                  new Fill({
                    color: s.text.backgroundFill.color,
                  })
                );
              }
            }
          }
          if (s.circle) {
            style.setImage(
              new Circle({
                radius: s.circle.radius,
                displacement: s.circle.displacement,
                fill: s.circle.fill
                  ? new Fill({
                      color: s.circle.fill.color,
                    })
                  : null,
                stroke: s.circle.stroke
                  ? new Stroke({
                      color: s.circle.stroke.color,
                      width: s.circle.stroke.width,
                    })
                  : null,
              })
            );
          }
          if (s.regularShape) {
            style.setImage(
              new RegularShape({
                points: s.regularShape.points,
                radius: s.regularShape.radius,
                radius1: s.regularShape.radius1,
                radius2: s.regularShape.radius2,
                angle: s.regularShape.angle,
                rotation: s.regularShape.rotation,
                displacement: s.regularShape.displacement,
                fill: s.regularShape.fill
                  ? new Fill({
                      color: s.regularShape.fill.color,
                    })
                  : null,
                stroke: s.regularShape.stroke
                  ? new Stroke({
                      color: s.regularShape.stroke.color,
                      width: s.regularShape.stroke.width,
                    })
                  : null,
              })
            );
          }
          if (s.icon) {
            style.setImage(
              new Icon({
                src: images[s.icon.src],
                anchor: s.icon.anchor,
                anchorOrigin: s.icon.anchorOrigin,
                anchorXUnits: s.icon.anchorXUnits,
                anchorYUnits: s.icon.anchorYUnits,
                color: s.icon.color,
                offset: s.icon.offset,
                displacement: s.icon.displacement,
                offsetOrigin: s.icon.offsetOrigin,
                opacity: s.icon.opacity,
                scale: s.icon.scale,
                rotation: s.icon.rotation,
                size: s.icon.size,
              })
            );
          }
        }
        styles.push(style);
      }
      return styles;
    };
  }
}
