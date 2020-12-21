import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Toggle from "./toggle";
import Picker from "vanilla-picker";
const images = require("../img/*.png");
import { makeStyle } from "./makeStyle";

/** create contaner with toggle
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 * @param {string[]} options.className clase to add to control
 * @param {string} options.tipLabel html title of the control
 * @param {string} options.html html to insert in the control
 * @param {function} options.handleClick callback on click
 * @param {ol/control} options.target container target
 */

export default class Theme extends Toggle {
  constructor(options = {}) {
    super(options);
    this.container = new Container({ semantic: "section", className: options.contanerClassName });
    options.target.addControl(this.container);
    this.header = document.createElement("header");
    this.header.className = "theme-header";
    this.container.element.appendChild(this.header);
    this.on("change:active", (evt) => {
      if (evt.active) this.container.element.classList.add("active");
      else this.container.element.classList.remove("active");
    });
    this.cp = new Picker({
      popup: "bottom",
    });
    console.log(options.layer)
    this.setLayer(options.layer); // should have get('def')
    this.htmlItem = `
    <ul class="item">
        <li class="caret">Stil <i class="far fa-trash-alt fa-fw style"></i></li>
         <ul class="nested">
            <ul class="resolution">
                <li class="caret"><i class="far fa-square fa-fw"></i> Rezolucija</li>
                <ul class="nested">
                    <li><label>Min, Max</label><input class="resolution" value ="0,1000"></li>
                </ul>
            </ul>
            <ul class="icon">
                <li class="caret"><i class="far fa-square fa-fw"></i> Ikona</li>
                <ul class="nested">
                    <li><label>Ime ikone</label><select class="src"><option selected disabled>odaberi ikonu</option></select></li>
                    <li><label>Skala</label><input class="scale" value ="1"></li>
                    <li><label>Točka umetanja, x,y</label><input class="anchor" value ="0,0"></li>
                </ul>
            </ul>
            <ul class="regularShape">
                <li class="caret"><i class="far fa-square fa-fw"></i> Simetrični simbol</li>
                <ul class="nested">
                    <li><label>Broj točaka</label><input class="points" value="6"></li>
                    <li><label>Polumjer</label><input class="radius" value="4"></li>
                    <li><label>Boja popune</label><div class="fill color"></div></li>
                    <li><label>Boja ruba</label><div class="stroke color"></div></li>
                    <li><label>Debljina ruba</label><input class="stroke width" value="1"></li>
                </ul>
            </ul>
            <ul class="stroke">
                <li class="caret"><i class="far fa-square fa-fw"></i> Rub poligona ili linija</li>
                <ul class="nested">
                    <li><label>Boja</label><div class="color"></div></li>
                    <li><label>Debljina</label><input class="width" value="1"></li>
                </ul>
            </ul>
            <ul class="fill">
                <li class="caret"><i class="far fa-square fa-fw"></i> Popuna poligona</li>
                <ul class="nested">
                    <li><label>Boja</label><div class="color"></div></li>
                </ul>
            </ul>
             <ul class="text">
                <li class="caret"><i class="far fa-square fa-fw"></i> Opis objekata</li>
                <ul class="nested">
                    <li>Tekst || svojstvo iz liste<input class="text" value=""></li>
                    <li>Lista svojstava<select class="properties"><option disabled selected >odaberi svojstvo</option></select></li>
                    <li>Smještaj<select class="placement">
                        <option disabled selected >odaberi smještaj</option>
                        <option value="point">točka</option>
                        <option value= "line">uzduž linije</option>
                    </select></li>
                    <li>CSS Font, poput: bold 18px serif<input class="font" value=""></li>
                    <li>Skala<input class="scale" value="1"></li>
                    <li>Bazna linija<select class="textBaseline">
                        <option disabled selected value= "alphabetic">odaberi baznu liniju</option>
                        <option value="bottom">dno</option>
                        <option value= "top">vrh</option>
                        <option value="middle">sredina</option>
                        <option value= "alphabetic">uobičajeno</option>
                    </select></li>
                </ul>
            </ul>
             <ul class="filter">
                <li class="caret"><i class="far fa-square fa-fw"></i> Filter za stil</li>
                <ul class="nested">
                <li>Svojstvo<select class="properties"><option disabled selected>odaberi svojstvo</option></select></li>
                <li>Operator
                    <select class="operators">
                            <option disabled selected value="=">odaberi operator</option>
                            <option value="=">jednako</option>
                            <option value="!=">različito od</option>
                    </select>
                </li>
                <li>Vrijednost || odaberi iz liste<input class="value" value=""></li>
                <li>Lista pretpostavljenih vrijednosti<select class="constrains"><option disabled selected>Odaberi vrijednost</option></select></li>
                </ul>
            </ul>
         </ul>
    </ul>
    `;
  }
  setLayer(layer) {
    if (!layer) {
      for (const e of this.container.element.querySelectorAll(".wrapper")) e.remove();
      this.header.className = "middle";
      this.header.innerHTML = `Odaberi aktivni sloj u legendi`;
    } else {
      this.layer = layer;
      this.header.className = "top";
      this.header.innerHTML = `
        Tematizacija sloja ${layer.get("label") || layer.get("name") || ""}
        <div>
            <span class="add ol-control" title="Dodaj stil"><i class="far fa-plus fa-fw"></i> Stil</span>
            <span class="apply ol-control" title="Primjeni"><i class="far fa-check fa-fw"></i> Primijeni</span>
        </div>
        `;
      this.header.querySelector(".add").addEventListener("click", (evt) => this.styleAdd_());
      this.header.querySelector(".apply").addEventListener("click", (evt) => this.styleApply_());
    }
  }

  getLayer() {
    return this.layer;
  }
}
