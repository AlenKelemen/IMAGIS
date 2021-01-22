import { Icon, Fill, Stroke, Circle, Text, RegularShape, Style } from "ol/style";
const images = require("../img/*.png");
import BaseObject from "ol/Object";

export default class ImagisStyle extends BaseObject {
  constructor(options = {}) {
    super();
    this.style = [];
  }
  addStyle(style, filter, resolution) {
    this.style.push({
      style: style,
      filter: filter,
      resolution: resolution,
    });
  }
  getStyle() {
    return this.style;
  }
  olStyle(){
      return function(feature, resolution){
        const styles = [];
        for (const i of this.style) {
            const style = style.style,
            filter= style.filter,
            resolution = style.resolution
            
        }
        return styles;
      }
  }
}
