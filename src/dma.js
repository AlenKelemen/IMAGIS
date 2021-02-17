import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import VectorLayer from "ol/layer/Vector";

export default class DMA extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-share-square"></i>';
    super(options);
    const srcName = options.srcName || "VodoopskrbaMjernaZona"; //
    this.container = new Container({
      semantic: "section",
      className: `taskpane no-header no-footer`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    this.mzLayer = this.map
      .getLayers()
      .getArray()
      .find((x) => x.getSource().get("name") === srcName);
    if (!this.mzLayer || this.mzLayer instanceof VectorLayer === false) return;
    const src = this.mzLayer.getSource();
    src.once("change", (evt) =>{
      if (src.getState() === "ready") {
        console.log(src.getFeatures());
        this.content(src.getFeatures());
      }
    });
  }
  content(features) {
    const fo = features.sort((a,b)=>a.get('naziv').toLowerCase().localeCompare(b.get('naziv').toLowerCase()))
    for(const f of fo){
        console.log(f.get('naziv'));
        const locate=elt('ul',{className:'nested'},elt('li',{},'lociraj'),elt('li',{},'ohih'));
        const label =elt('li',{},elt('span',{className:'caret'},f.get('naziv')||''),locate)
        
        const item = elt('ul',{className:'item'},label)
        this.main.appendChild(item)
    }
    const toggler = this.main.getElementsByClassName("caret");
    
    for (let i = 0; i < toggler.length; i++) {
        
        toggler[i].addEventListener("click", function() {
            console.log(this.parentElement)
          this.parentElement.querySelector(".nested").classList.toggle("active");
          this.classList.toggle("caret-down");
        })
    }

  }
}
