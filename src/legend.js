import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import { elt } from "./util";
const images = require("../img/*.png");
/** Legend
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {boolean=false} options.active control active, default false
 * @param {Object} options.target contaner target element
 */
export default class Legend extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-layer-group fa-fw"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container);
    this.container.setVisible(this.active);
    this.headerHtml = options.header || "Header";
    this.contentHtml = options.content || "Content";
    this.footerHtml = options.footer || "Footer";
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("header", { className: `header` }, this.headerHtml);
    this.container.element.appendChild(this.header);
    this.main = elt("main", { className: `main` }, this.contentHtml);
    this.container.element.appendChild(this.main);
    this.footer = elt("footer", { className: `footer ol-control` }, elt("button", { className: "button" }, "Button1"), elt("button", { className: "button" }, "Button2"));
    this.container.element.appendChild(this.footer);
    this.setContent();
  }
  styleIcon(styleFunction, iconSize = [16, 16]) {
    const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
    const ctx = icon.getContext("2d");
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
    if(!styleFunction) img.src = images.lc_raster;
    else{
      const styleArray = styleFunction.call(this,undefined,this.getMap().getView().getResolution());
      if(styleArray.length >1) img.src = images.lc_theme;)
    }
    else if(style.length >1) img.src = images.lc_theme;
    else if(style.length === 1) {
      
      const vctx = toContext(ctx, {
        size: iconSize,
      });
      vctx.setStyle(style);
      if (style.getFill()) {
        vctx.drawGeometry(
          new Polygon([
            [
              [0, 0],
              [iconSize[0], 0],
              [iconSize[0], iconSize[1]],
              [0, iconSize[1]],
              [0, 0],
            ],
          ])
        );
      }
    }
    return icon
  }
  setHeader(html = "Header") {
    this.header = html;
  }

  setContent() {
    this.main.innerHTML = "";
    this.main.appendChild(this.styleIcon())
    this.main.appendChild(this.styleIcon([1,2]))
    //this.main.appendChild(this.styleIcon(this.getMap().getLayers().item(7).getStyle())
    let i = 0;
    do {
      i++;
      const e = document.createElement("div");
      e.innerHTML = `${i} item row`;
      this.main.appendChild(e);
    } while (i < 11);
  }
}
