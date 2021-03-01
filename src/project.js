import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Select from "ol/interaction/Select";

export default class Project extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle"; //
    if (!options.html) options.html = '<i class="far fa-cog fa-fw"></i>'; //
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
    //main with scroll bar
    this.content();
    //footer
    this.footer = elt("div", { className: "footer center" }, "Pogledaj postavke");
    this.main.appendChild(this.footer);
    //ol/map
    this.map = this.container.getMap();
    //visibility
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => {
      this.container.setVisible(evt.active);
      //select
      this.select = this.map
        .getInteractions()
        .getArray()
        .find((x) => x instanceof Select);
      if (evt.active) {
        this.onSelect();
        this.select.on("select", this.onSelect);
      } else this.select.un("select", this.onSelect);
    });
  }
  //function on select
  onSelect(evt) {
    if (evt) this.features = evt.target.getFeatures().getArray();
    else this.features = this.select.getFeatures().getArray();
    console.log(this.features);
  }
  //this.main content
  content() {
    const n = 150;
    for (let i = 0; i < n; i++) {
      this.main.appendChild(elt("div", { className: `item` }, `item: ${i}`));
    }
  }
}
