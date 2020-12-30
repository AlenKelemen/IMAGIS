import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
/** create contaner with toggle
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string} options.className Control.element class name
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html string to insert in the control
 * @param {Object} options.select ol/interaction/Select
 * @param {Object} options.target target Container
 */

export default class Properties extends Toggle {
  constructor(options = {}) {
    super(options);
    this.def = options.def;
    this.select = options.select;
    this.noFeaturesTxt = options.noFeaturesTxt || "Odaberi objekte na karti.";
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.header = document.createElement("header");
    this.header.className = "properties-header";
    this.header.innerHTML = `
    <div>Svojstva</div>
     `;
    this.container.element.appendChild(this.header);
    this.body = document.createElement("section");
    this.body.className = "properties-body middle";
    this.body.innerHTML = this.noFeaturesTxt;
    this.container.element.appendChild(this.body);
    this.callback = options.callback;
    this.on("change:active", (evt) => {
      if (evt.active) {
        this.container.element.classList.add("active");
      } else this.container.element.classList.remove("active");
    });
    this.select.on("select", (evt) => {
      const features = evt.target.getFeatures().getArray();
      if (features.length > 0) {
        this.body.classList.remove("middle");
        const item = [];
        this.body.innerHTML = "";
        for (const f of features) {
          const layer = f.get("layer");
          if (item.find((x) => x.layer === layer)) {
            item.find((x) => x.layer === layer).features.push(f);
          } else {
            item.push({
              layer: layer,
              features: [f],
            });
          }
        }
        for (const [index, i] of item.entries()) {
          const ld = document.createElement("div");
          ld.className = "layer";
          ld.innerHTML = `
          <div class="header"><button class="show-more"><i class="far fa-plus"></i></button> ${i.layer.get("label") || i.layer.get("name")} (${i.features.length})</div>
          `;
          this.body.appendChild(ld);
          ld.querySelector('.show-more').addEventListener('click',evt => {
            const e = evt.currentTarget;
            ld.querySelector('.items').style.display = ld.querySelector('.items').style.display === 'none' ? 'block' : 'none';
            e.innerHTML = ld.querySelector('.items').style.display === 'none' ? '<i class="far fa-plus"></i>' : '<i class="far fa-minus"></i>';
          })
          const content = document.createElement('div');
          content.className = 'items';
          if (index === 0) {
              content.style.display = 'block';
              ld.querySelector('.show-more').innerHTML = '<i class="far fa-minus"></i>';
          } else {
              content.style.display = 'none';
              ld.querySelector('.show-more').innerHTML = '<i class="far fa-plus"></i>';
          }
          ld.appendChild(content);
        }
      } else {
        this.body.innerHTML = this.noFeaturesTxt;
        this.body.classList.add("middle");
      }
    });
  }
}
