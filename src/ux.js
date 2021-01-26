import Container from "./container";
import Toggle from "./toggle";
import Button from "./button";
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
  /**
   *Add toggle button to HEADER element
   *
   * @param {*} [options={}]
   * @return {*} 
   * @memberof UX
   */
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
  /**
   *TASKBAR (sidebar with buttons)
   *
   * @param {*} [options={}]
   * @return {*} 
   * @memberof UX
   */
  addTaskBar(options = {}) {
    const taskBar = new Container({
      semantic: "nav",
      className: options.className || "taskbar",
      handleClick: options.handleClick,
    });
    this.aside.addControl(taskBar);
    return taskBar;
  }
/**
 *Add toggle button to TASKBAR with optional container in ASIDE element
 *
 * @param {*} [options={}]
 * @return {*} 
 * @memberof UX
 */
addTask(options = {}) {
    const container = new Container({
      semantic: "section",
      className: `${options.className || "task"}-taskpane`,
    });
    if (options.taskpane === undefined || options.taskpane === true) this.aside.addControl(container);
    const taskToggle = new Toggle({
      html: options.html || '<i class="far fa-layer-group"></i>',
      tipLabel: options.tipLabel || "Task",
      className: options.className || "task",
    });
    options.taskbar.addControl(taskToggle);
    return { toggle: taskToggle, container: container };
  }
/**
 *Add TOOLBAR (sidebar) with buttons, standard zoom and rotate buttons are included
 *
 * @return {*} 
 * @memberof UX
 */
addToolBar(){
    const toolbar = new Container({
      semantic: "nav",
      className: "toolbar",
    });
    this.aside.addControl(toolbar);
    const rotateZoom = new Container({
      semantic: "nav",
      className: "rotate-zoom",
    });
    toolbar.addControl(rotateZoom);
    rotateZoom.addControl(
      new Rotate({
        tipLabel: "Sjever gore",
        label: Object.assign(document.createElement("i"), { className: "far fa-arrow-alt-up" }),
      })
    );
    rotateZoom.addControl(
      new Zoom({
        className: "zoom",
        zoomInLabel: Object.assign(document.createElement("i"), { className: "far fa-plus" }),
        zoomInTipLabel: "Približi",
        zoomOutTipLabel: "Udalji",
        zoomOutLabel: Object.assign(document.createElement("i"), { className: "far fa-minus" }),
      })
    );
    return toolbar;
  }
  /**
   *Add control to footer
   *
   * @memberof UX
   */
  addInfo(){

  }
/**
 * Hide control (display:'none')
 * @param {*} control 
 * @param {*} b 
 */
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
