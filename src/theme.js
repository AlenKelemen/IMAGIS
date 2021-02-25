import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Picker from "vanilla-picker";
import { labelCache } from "ol/render/canvas";

export default class Theme extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-images fa-fw"></i>';
    super(options);
    this.container = new Container({
      semantic: "section",
      className: `taskpane`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.header = elt("div", { className: "header" });
    this.main = elt("main", { className: `main` }, this.header);
    this.container.element.appendChild(this.main);
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
    this.map.getLayers().on("change:active", (evt) => this.setLayer(evt.target.get("active")));
    this.setLayer(this.map.getLayers().get("active"));
  }
  setLayer(layer) {
    this.layer = layer;
    if (!layer) {
        this.header.className = 'middle';
        this.header.innerHTML = `Odaberite aktivni sloj u legendi`;
    } else {
        this.header.className = 'header column';
        this.header.innerHTML = `Tematizacija sloja ${layer.get('label')||layer.get('name')||''}
        <div class='right'>
        <span class="add" title="Dodaj stil"><i class="far fa-plus fa-fw"></i> Stil</span>
        <span class="apply" title="Primjeni"><i class="far fa-check fa-fw"></i> Primijeni</span>
    </div>
        `;
    }
  }
}
