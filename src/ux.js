import Container from "./container";
import Toggle from "./toggle";
import Button from "./button";

export default class UX {
  constructor(options = {}) {
    this.map = options.map;
    if (!this.map) {
      console.log("please set options.map");
      return;
    }
    this.target = document.createElement("main");
    this.target.className = "map";
    document.body.appendChild(this.target);
    this.map.setTarget(this.target);
    /** HEADER */
    this.header = new Container({
      semantic: "header",
      className: options.headerClass || "map-header control",
    });
    this.map.addControl(this.header);
    /**ASIDE Left and right containers */
    this.aside = new Container({
      semantic: "aside",
      className: options.asideClass || "map-aside",
    });
    this.map.addControl(this.aside);
    /** FOOTER*/
    this.footer = new Container({
      semantic: "footer",
      className: options.footerClass || "map-footer",
    });
    this.map.addControl(this.footer);
  }
  addHeaderToggle(options = {}) {
    const toggle = new Toggle({
      html: options.html || '<i class="far fa-home"></i>',
      className: options.className || "toggle",
      tipLabel: options.tipLabel || "Tip...",
      active: options.active,
      handleClick: options.handleClick,
    });
    this.header.addControl(toggle);
    return toggle;
  }
  addTaskBar(options = {}) {
    const taskBar = new Container({
      semantic: "nav",
      className: options.className || "taskbar",
      handleClick: options.handleClick,
    });
    this.aside.addControl(taskBar);
    return taskBar;
  }
  addTaskToggle(options = {}) {
    const taskbar = options.taskbar;
    const taskToggle = new Toggle({
      html: options.html || '<i class="far fa-layer-group"></i>',
      tipLabel: options.html || "Legenda & upravljanje kartom",
      handleClick: options.handleClick,
    });
    taskbar.addControl(taskToggle);
    return taskToggle;
  }
  addTaskPane(options = {}) {
    const taskPane = new Container({
      semantic: "section",
      className: options.className || "taskpane",
    });
    this.aside.addControl(taskPane);
    return taskPane;
  }

  hide(control, b) {
    control.element.style.display = b ? "none" : "";
  }
  getHide(control) {
    return control.element.style.display === "none";
  }
  toggleHide(control) {
    this.hide(control, !this.getHide(control));
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
