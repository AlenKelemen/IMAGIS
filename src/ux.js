import Container from "./container";
import Toggle from "./toggle";
import { Rotate, Zoom, ScaleLine, Control } from "ol/control";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    if (!this.map) {
      console.log("please set options.map");
      return;
    }
    /**
     * Map target element
     */
    this.target = document.createElement("main");
    this.target.className = "map";
    document.body.appendChild(this.target);
    this.map.setTarget(this.target);
    /**
     * WRAPPER element
     */
    this.wrapper = new Container({
      className: options.wrapperClass || "wrapper",
    });
    this.map.addControl(this.wrapper);

    /**
     * TASK element
     */
    this.task = new Container({
      className: options.wrapperClass || "task",
    });
    this.map.addControl(this.task);

    /** in WRAPPER */
    /**
     * HEADER element
     */
    this.header = new Container({
      className: options.headerClass || "header",
    });
    this.wrapper.addControl(this.header);
    /**
     * ASIDE element
     */
    this.aside = new Container({
      className: options.asideClass || "aside",
    });
    this.wrapper.addControl(this.aside);
    /**
     * FOOTER element
     */
    this.footer = new Container({
      className: options.footerClass || "footer",
    });
    this.wrapper.addControl(this.footer);

    /**
     * in HEADER
     */
    this.imagis = new Toggle({
      html: '<i class="far fa-home fa-fw"></i> Imagis',
      className: "imagis",
      tipLabel: "Tip...",
      active: false,
    });
    this.header.addControl(this.imagis);
    /**
     * in ASIDE
     */
    this.toolbar = new Container({
      className: "toolbar",
    });
    this.aside.addControl(this.toolbar);
    /**
     * in FOOTER
     */

    this.footer.addControl(new ScaleLine());
  }
  getTarget() {
    return this.target;
  }
}
