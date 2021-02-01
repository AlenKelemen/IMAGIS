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
import { isGeneratorFunction } from "regenerator-runtime";

export default class Config {
  constructor(options = {}) {
    if (!localStorage.getItem("cfg")) {
      localStorage.setItem("cfg", JSON.stringify(def));
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
    return def;
  }
  setCfg(cfg) {
    if (typeof cfg === "object") {
      this.cfg.gitPath = cfg.gitPath || def.gitPath;
      this.cfg.path = cfg.path || def.path;
      this.cfg.zoom = cfg.zoom || def.zoom;
      if (Array.isArray(cfg.center) && cfg.center.length === 2) this.cfg.center = cfg.center;
      else this.cfg.center = def.center;
      if (!cfg.layers) this.cfg.layers = [];
      if (!cfg.sources) this.cfg.sources = def.sources;
    } else {
      this.cfg = def;
    }
  }
  getCfg() {
    return this.cfg;
  }
  /**
   *Create new cfg layer
   *
   * @param {string} [options={ source: "OSM", name: "osm-1" }] layer options
   * @param {string} options.name layer name
   * @param {string} options.source layer source
   * @param {string} [options.label=options.name] layer label
   * @param {string} [options.info=''] layer info
   * @param {float} [options.minResolution=-Infinity] layer min resolution
   * @param {float} [options.maxResolution=Infinity] layer max resolution
   * @param {boolean} [options.visible=true] layer visiblity
   * @param {float} [options.opacity=1] layer opacity [0-1]
   * @param {integer} [options.zIndex=0] layer z index >= 0
   * @return {boolean} succesfull
   * @memberof Config
   */
  layerCreate(options = { source: "OSM", name: "osm-1" }) {
    if (this.cfg.layers.find((x) => x.name === options.name)) {
      console.log(`Name ${options.name} exists, change name.`);
      return false;
    }
    if (!this.cfg.sources.find((x) => x.name === options.source)) {
      console.log(`Source ${options.source} do not exists, change source.`);
      return false;
    }
    this.cfg.layers.push(options);
    return true;
  }
  /**
   *Update cfg layer
   *
   * @param {string} [options={ source: "OSM", name: "osm-1" }] layer options
   * @param {string} options.name layer name
   * @param {string} options.source layer source
   * @param {string} [options.label=options.name] layer label
   * @param {string} [options.info=''] layer info
   * @param {float} [options.minResolution=-Infinity] layer min resolution
   * @param {float} [options.maxResolution=Infinity] layer max resolution
   * @param {boolean} [options.visible=true] layer visiblity
   * @param {float} [options.opacity=1] layer opacity [0-1]
   * @param {integer} [options.zIndex=0] layer z index >= 0
   * @return {boolean} succesfull
   * @memberof Config
   */
  layerUpdate(options = { name: "OSM" }) {
    if (!this.cfg.layers.find((x) => x.name === options.name)) {
      console.log(`Name ${options.name} must exists in cfg.`);
      return false;
    }
    if (options.source && !this.cfg.sources.find((x) => x.name === options.source)) {
      console.log(`Source ${options.source} do not exists, change source.`);
      return false;
    }
    const i = this.cfg.layers.findIndex((x) => x.name === options.name);
    const layer = this.cfg.layers[i];
    for (const key of Object.keys(layer)) {
      if (options[key]) {layer[key] = options[key]; console.log(options,this.cfg.layers[i])}
     
    }
    return true;
  }
}
