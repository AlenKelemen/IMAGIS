import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Picker from "vanilla-picker";

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
    this.main = elt("main", { className: `main` });
    this.container.element.appendChild(this.main);
    this.header = document.createElement("div");
    this.header.className = "header";
    this.main.appendChild(this.header);
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
    this.setLayer(
      this.map
        .getLayers()
        .getArray()
        .find((x) => x.get("active"))
    );
  }
  setLayer(layer) {
    if (!layer) {
      console.log(layer);
      //for (const e of this.content.querySelectorAll('.wrapper')) e.remove();
      this.header.className = "middle-center";
      this.header.innerHTML = `Odaberi aktivni sloj u legendi`;
    } else {
      this.layer = layer;
      this.header.className = "header columns";
      this.header.innerHTML = `
          Tematizacija sloja ${layer.get("label") || layer.get("name") || ""}
          <div class='right'>
              <span class="add" title="Dodaj stil"><i class="far fa-plus fa-fw"></i> Stil</span>
              <span class="apply" title="Primjeni"><i class="far fa-check fa-fw"></i> Primijeni</span>
          </div>
          `;
      this.header.querySelector(".add").addEventListener("click", (evt) => this.styleAdd_());
      this.header.querySelector(".apply").addEventListener("click", (evt) => this.styleApply_());
      //this.styleSet_(); //set style from def.layer.style to body treeview
    }
  }
  styleSet_() {
    //add style from this.layer.def.layer.style to this.element UI
    for (const e of this.content.querySelectorAll(".wrapper")) e.remove();
    const style = this.layer.get("def").style; //array of styles in def
    style.forEach((x) => this.styleAdd_()); //add styles to UI
  }
  styleAdd_() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'wrapper';
    this.content.appendChild(this.wrapper); //item wrapper
    this.wrapper.innerHTML = this.htmlItem; //item ul
    //style items accordion style item
    for (const j of this.wrapper.querySelectorAll('.caret')) {
        j.addEventListener('click', evt => {
            evt.stopPropagation();
            if (evt.target !== j) return;
            j.parentElement.querySelector('.nested').style.display = j.parentElement.querySelector('.nested').style.display === 'block' ? 'none' : 'block';
            j.classList.toggle('caret-down');
        });
    }
    //chech style item
    for (const j of this.wrapper.querySelectorAll('.fa-square, .fa-check-square')) {
        j.addEventListener('click', evt => {
            evt.stopPropagation();
            const cl = evt.currentTarget.classList;
            if (cl.contains('fa-square')) {
                cl.remove('fa-square');
                cl.add('fa-check-square');
            } else {
                cl.add('fa-square');
                cl.remove('fa-check-square');
            }
        });
    }
    //remove style
    this.wrapper.querySelector('.style').addEventListener('click', evt => {
        evt.stopPropagation();
        evt.currentTarget.closest('.wrapper').remove();
    });
    this.fillIcons_(this.wrapper);
    this.fillProperties_(this.wrapper);
    this.fillConstrains_(this.wrapper);
    this.fillOperators_(this.wrapper);
    this.colorPicker_(this.wrapper)
}
}
