import Container from "./container";

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
     * HEADER element
     */
    this.header = new Container({
      semantic: "header",
      className: options.headerClass || "map-header control",
    });
    this.map.addControl(this.header);
    /**
     * ASIDE element 
     */
    this.aside = new Container({
      semantic: "aside",
      className: options.asideClass || "map-aside",
    });
    this.map.addControl(this.aside);
    /**
     * FOOTER element
     */
    this.footer = new Container({
      semantic: "footer",
      className: options.footerClass || "map-footer",
    });
    this.map.addControl(this.footer);
  }
  

  getTarget() {
    return this.target;
  }
  getHeader() {
    return this.header;
  }
  getAside() {
    return this.aside;
  }
  getFooter() {
    return this.footer;
  }
}
