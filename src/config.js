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
import def from "../cfg.json";
/**
 * Imagis maps config as Object sutable to stringify to json
 * ol/Map and ol/Layer - cfg reader/writer
 * Uses GitHub loader for vector sources
 * Layer style must be defined from styleSpec
 *
 * @export
 * @class Config
 */
export default class Config {
  constructor(options = {}) {
    if (!localStorage.getItem("cfg")) localStorage.setItem("cfg", JSON.stringify(def));
    this.cfg = JSON.parse(localStorage.getItem("cfg"));
    this.map = options.map;
    this.localFolder = "/datas";
    this.vc = new VersionControl("fs");
    this.result = this.vc.clone(this.cfg.gitPath, this.localFolder);
  }
  setCfg(cfg){
    this.cfg=cfg;
  }
  getDefault() {
    return JSON.stringify(def);
  }
  writeDefault(update = true) {
    //set layers from default cfg, update= true removes all imagis-cfg layers from map
    if (update) {
      const layersToRemove = [];
      this.map.getLayers().forEach((layer) => {
        if (layer.get("imagis-cfg") != undefined) layersToRemove.push(layer);
      });
      const len = layersToRemove.length;
      for (let i = 0; i < len; i++) {
        this.map.removeLayer(layersToRemove[i]);
      }
    }
    this.cfg = def;
    this.write();
  }

  /**
   *From ol/map to cfg object
   *
   * @return {Object} cfg Object, defines: View, Sources, Layers, Style
   * @memberof Config
   */
  read() {
    const cfg = { sources: [], layers: [] },
      m = this.map,
      v = m.getView();
    cfg.project = m.get("project");
    cfg.gitPath = m.get("gitPath");
    cfg.meta = m.get("meta");
    for (const s of map.get("sources")) {
      cfg.sources.push(s); //non spatial sources (type:'data') saved to map
    }
    cfg.center = v.getCenter();
    cfg.zoom = v.getZoom();
    for (const layer of m.getLayers().getArray()) {
      const i = { name: layer.get("name") };
      if (layer instanceof VectorLayer) i.style = layer.get("imagis-style");
      const st = layer.getSource();
      if (st instanceof OSM && cfg.sources.find((x) => x.type === "osm") === undefined) {
        cfg.sources.push({
          name: layer.getSource().get("name"),
          type: "osm",
        });
      }
      if (st instanceof BingMaps && cfg.sources.find((x) => x.type === "bing") === undefined) {
        cfg.sources.push({
          name: layer.getSource().get("name"),
          type: "bing",
          APIKey: layer.getSource().getApiKey(),
          imagerySet: layer.getSource().getImagerySet(),
        });
      }
      if (st instanceof TileWMS && cfg.sources.find((x) => x.type === "wms" && x.name === layer.get("source")) === undefined) {
        cfg.sources.push({
          name: layer.getSource().get("name"),
          type: "wms",
          path: layer.getSource().getUrls()[0],
          params: layer.getSource().getParams(),
        });
      }
      if (st instanceof VectorSource && cfg.sources.find((x) => ["th", "geojson"].indexOf(x.type) !== -1 && x.name === layer.get("source")) === undefined) {
        cfg.sources.push({
          name: layer.getSource().get("name"),
          type: layer.getSource().get("type"),
          path: layer.getSource().get("path"),
          fileName: layer.getSource().get("fileName"),
          schema: layer.getSource().get("schema"),
        });
      }
      for (const [key, value] of Object.entries(layer.getProperties())) {
        if (key !== "source" && key != "style") {
          if (![Infinity, -Infinity, null, undefined].includes(value)) {
            i[key] = value;
          }
        }
      }
      i.source = layer.getSource().get("name");
      cfg.layers.push(i);
    }
    return cfg;
  }
  /**
   *From cfg object to ol/map
   *
   * @memberof Config
   */
  write() {
    const cfg = this.cfg,
      m = this.map,
      v = m.getView();
    m.set("project", cfg.project);
    m.set("gitPath", cfg.gitPath);
    m.set("meta", cfg.meta);
    m.set(
      "sources",
      cfg.sources.filter((x) => x.type === "data")
    ); //non spatial sources (type:'data') saved to map
    v.setCenter(cfg.center);
    v.setZoom(cfg.zoom);
    //add layers
    for (const l of cfg.layers) {
      const s = cfg.sources.find((x) => x.name === l.source);
      let layer, source;
      switch (s.type) {
        case "osm":
          layer = new TileLayer();
          layer.setSource(new OSM());
          layer.getSource().set("name", s.name);
          break;
        case "bing":
          layer = new TileLayer();
          layer.setSource(
            new BingMaps({
              key: s.APIKey,
              imagerySet: s.imagerySet,
            })
          );
          layer.getSource().set("name", s.name);
          break;
        case "wms":
          layer = new TileLayer();
          layer.setSource(
            new TileWMS({
              url: s.path,
              params: s.params,
              crossOrigin: "anonymous",
            })
          );
          layer.getSource().set("name", s.name);
          break;
        case "geojson":
          layer = new VectorLayer();
          source = new VectorSource({
            loader: (extent, resolution, projection) => {
              this.result.then((r) => {
                this.vc.readFile(this.localFolder + "/" + s.path + "/" + s.fileName + ".json").then((r) => {
                  const features = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3765",
                  }).readFeatures(r);
                  source.addFeatures(features);
                  source.getFeatures().map((x) => x.set("layerName", layer.get('name')));
                  source.getFeatures().map((x) => x.set("objectId", x.getId()));
                });
              });
            },
          });
          source.set("name", s.name);
          source.set("type", s.type);
          source.set("schema", s.schema);
          source.set("path", s.path);
          source.set("fileName", s.fileName);
          layer.setSource(source);
          if (l.active) layer.set("active", l.active);
          break;
        case "th":
          layer = new VectorLayer();
          source = new VectorSource({
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
                  source.getFeatures().map((x) => x.set("layer", layer));
                  source.getFeatures().map((x) => x.set("objectId", x.getId()));
                });
            },
          });
          source.set("name", s.name);
          source.set("type", s.type);
          source.set("path", s.path);
          source.set("schema", s.schema);
          layer.setSource(source);
          if (l.active) layer.set("active", l.active);
          break;
      }
      if (layer) {
        for (const [key, value] of Object.entries(l)) {
          if (key !== "source" && key != "style") layer.set(key, value);
          if (key === "style") {
            if (layer instanceof VectorLayer) {
              layer.setStyle(this.imagisSyle(l.style));
              layer.set("imagis-style", l.style);
            }
          }
          if (key === "maxResolution" && value === null) layer.set(key, Infinity);
          if (key === "minResolution" && value === null) layer.set(key, 0);
        }
        layer.set("imagis-cfg", cfg.meta);
        m.addLayer(layer);
      } else console.log("Layer not written to map (no converter defined):", l);
      const activeLayer = m
        .getLayers()
        .getArray()
        .find((x) => x.get("active") === true);
      m.getLayers().set("active", activeLayer);
    }
  }
  /**
   *Cfg styleSpec to ol/Style function
   *
   * @param {Array} styleSpec from cfg
   * @return {Function} ol/style function
   * @memberof Config
   */
  imagisSyle(styleSpec) {
    if (!styleSpec) return; //default style
    const sp = Array.isArray(styleSpec) ? styleSpec : [styleSpec]; //always as array
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
