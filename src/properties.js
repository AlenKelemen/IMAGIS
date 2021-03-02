import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Select from "ol/interaction/Select";

export default class Properties extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle"; //
    if (!options.html) options.html = '<i class="far fa-th-list fa-fw"></i>'; //
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container); //options.target (defines map also)
    //header
    this.header = elt("div", { className: "header center" }, "Postavke");
    //main
    this.main = elt("main", { className: `main` }, this.header);
    this.container.element.appendChild(this.main);
    //main content wrapper
    this.wrapper = elt("div", { className: "wrapper" });
    this.main.appendChild(this.wrapper);
    //footer
    this.footer = elt("div", { className: "footer center" }, "Pogledaj postavke");
    this.main.appendChild(this.footer);
    //ol/map
    this.map = this.container.getMap();
    //select depended display of wrapper && visibility on click
    this.container.setVisible(this.active);
    const onSelect = (evt) => this.wrapperSelect(evt.target);
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      const select = this.map
        .getInteractions(select)
        .getArray()
        .find((x) => x instanceof Select);
      if (evt.active && select) {
        this.wrapperSelect(select);
        select.on("select", onSelect);
      } else select.un("select", onSelect);
    });
  }

  //this.wrapper example select depended display
  wrapperSelect(select) {
    if (!select) return;
    const features = select.getFeatures().getArray();
    this.wrapper.innerHTML = features.length === 0 ? '<span class="middle-center">Ništa nije odabrano</span>' : "";
    for (const f of features) {
      const item = elt("div", {}, f.getId().toString());
      item.setAttribute("data-id", f.getId());
      this.wrapper.appendChild(item);
    }
  }

}
