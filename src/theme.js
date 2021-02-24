import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Picker from "vanilla-picker";
const images = require('../img/*.png');

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
    this.cp = new Picker({
        popup: 'bottom'
    });
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
    this.setLayer(this.map.getLayers().get('active'))
  }
  setLayer(layer) {
    if (!layer) {
      console.log(layer);
      for (const e of this.main.querySelectorAll('.wrapper')) e.remove();
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
      this.styleSet_(); //set style from def.layer.style to body treeview
    }
  }
  styleSet_() {
    //add style from this.layer.def.layer.style to this.element UI
    for (const e of this.main.querySelectorAll(".wrapper")) e.remove();
   // const style = this.layer.get("def").style; //array of styles in def
   const style = this.layer.get('imagis-style');



    style.forEach((x) => this.styleAdd_()); //add styles to UI
  }
  styleAdd_() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'wrapper';
    this.main.appendChild(this.wrapper); //item wrapper
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
    //check style item
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
styleApply_() { //apply style from UI to def.layer.style and through makeStyle(def.layer.style) apply to layer
    const
        ns = [], //new style
        ds = this.layer.get('imagis-schema'),
        s = sName => this.main.querySelector(`.${sName} .check`);
    for (const i of this.main.querySelectorAll('.item')) {
        const is = {};
        for (const e of i.querySelectorAll('.fa-check-square')) {
            if (e.closest('ul').className === 'resolution') {
                is.resolution = e.closest('ul').querySelector('.resolution').value.split(',');
            }
            if (e.closest('ul').className === 'icon') {
                is.icon = {};
                is.icon.src = e.closest('ul').querySelector('.src').value;
                is.icon.scale = e.closest('ul').querySelector('.scale').value;
                is.icon.anchor = e.closest('ul').querySelector('.anchor').value.split(',');
            }
            if (e.closest('ul').className === 'regularShape') {
                is.regularShape = {};
                is.regularShape.points = e.closest('ul').querySelector('.points').value;
                is.regularShape.radius = e.closest('ul').querySelector('.radius').value;
                is.regularShape.fill = {};
                is.regularShape.fill.color = e.closest('ul').querySelector('.fill.color').style.backgroundColor;
                is.regularShape.stroke = {};
                is.regularShape.stroke.color = e.closest('ul').querySelector('.stroke.color').style.backgroundColor;
                is.regularShape.stroke.width = e.closest('ul').querySelector('.stroke.width').value;
            }
            if (e.closest('ul').className === 'stroke') {
                is.stroke = {};
                is.stroke.color = e.closest('ul').querySelector('.color').style.backgroundColor;
                is.stroke.width = e.closest('ul').querySelector('.width').value;
            }
            if (e.closest('ul').className === 'fill') {
                is.fill = {};
                is.fill.color = e.closest('ul').querySelector('.color').style.backgroundColor;
            }
            if (e.closest('ul').className === 'text') {
                is.text = {};
                if (e.closest('ul').querySelector('.text').value) is.text.text = '*' + e.closest('ul').querySelector('.text').value;
                else is.text.text = e.closest('ul').querySelector('.properties').value;
                is.text.placement = e.closest('ul').querySelector('.placement').value;
                is.text.textBaseline = e.closest('ul').querySelector('.textBaseline').value;
                is.text.scale = e.closest('ul').querySelector('.scale').value;
                is.text.font = e.closest('ul').querySelector('.font').value;
            }
            if (e.closest('ul').className === 'filter') {
                is.filter = {};
                is.filter.property = e.closest('ul').querySelector('.properties').value;
                is.filter.operator = e.closest('ul').querySelector('.operators').value;
                if (e.closest('ul').querySelector('.value').value) is.filter.value = e.closest('ul').querySelector('.value').value;
                else is.filter.value = e.closest('ul').querySelector('.constrains').value;
            }
        }
        ns.push(is);

    }
    this.layer.get('imagis-style').style = ns;
    console.log(this.layer.get('imagis-style'))
    this.layer.setStyle(makeStyle(ns));
}
fillOperators_(itemElement) {
    for (const e of itemElement.querySelectorAll('.operators')) {
        if (!this.layer.getSource().get('schema')) return; // if no def should read props from features
        e.closest('ul').querySelector('.properties').addEventListener('change', evt => {
            e.length = 3;
            const pd = this.layer.getSource().get('schema').properties.find(x => x.Name === evt.target.value);
            if ([6, 7, 8].includes(pd.DataType)) { //numbers
                e.add(new Option('veće od', '>'));
                e.add(new Option('manje od', '<'));
                e.add(new Option('veće ili jednako', '>='));
                e.add(new Option('manje ili jednako', '<='));
            }
            if (pd.DataType === 9) e.add(new Option('sadrži', 'LIKE')); //strings
        });
    }
}
fillProperties_(itemElement) { //fill .text .properties & .filter .properties
    if (!(this.layer || this.layer.getSource().get('schema'))) return; // if no def should read props from features
    for (const e of itemElement.querySelectorAll('.properties')) {
        e.length = 1; //first allways visible
        for (const p of this.layer.getSource().get('schema').properties) e.add(new Option(p.Label, p.Name));
    }
}
fillConstrains_(itemElement) { //fill .filter .constrains
    if (!this.layer.getSource().get('schema')) return; // if no def should read values from features
    for (const e of itemElement.querySelectorAll('.constrains')) {
        e.closest('ul').querySelector('.properties').addEventListener('change', evt => {
            e.length = 1;
            const pd = this.layer.getSource().get('schema').properties.find(x => x.Name === evt.target.value);
            if (pd.Constrains) pd.Constrains.map(x => e.add(new Option(x, x)));
        });
    }
}
fillIcons_(itemElement) { //fill .icons .src select first
    if (!images) return;
    for (const e of itemElement.querySelectorAll('.icon .src')) {
        for (const [key, value] of Object.entries(images)) {
            e.add(new Option(key, key));
        }
        e.selectedIndex = 1;
    }
}
colorPicker_(itemElement) {
    for (const ce of itemElement.querySelectorAll('.color')) {
        ce.addEventListener('click', evt => {
            this.cp.movePopup({
                parent: evt.currentTarget,
                color: evt.currentTarget.style.backgroundColor,
            }, true);
        });
    }
    this.cp.onChange = function (color) {
        this.settings.parent.style.backgroundColor = color.rgbaString;
    };
}
getLayer() {
    return this.layer;
}

}
