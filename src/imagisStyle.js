import { Icon, Fill, Stroke, Circle, Text, RegularShape, Style } from "ol/style";
const images = require("../img/*.png");
import BaseObject from "ol/Object";

export default class ImagisStyle extends BaseObject {
  constructor(options = {}) {
    super();
    this.style = [];
  }
  set(style, filter, resolution) {
    this.style.push({
      style: style,
      filter: filter,
      resolution: resolution,
    });
  }
  get() {
    return this.style;
  }
}
