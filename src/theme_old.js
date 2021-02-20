import Control from 'ol/control/Control';
import VectorLayer from 'ol/layer/Vector';
import {
    toContext
} from 'ol/render';
import {
    LineString,
    Point,
    Polygon
} from 'ol/geom';
import {
    Icon,
    Fill,
    Stroke,
    Circle,
    Text,
    RegularShape,
    Style
} from 'ol/style';
import Sortable from 'sortablejs';
import Picker from 'vanilla-picker';
import {
    makeStyle
} from './style';
const images = require('../../img/*.png');
import 'w3-css/w3.css';

export default class Thematic extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        this.map = options.map || map; //from windows.map=map if map set in main
        this.set('name', options.name);
        this.element.className = `w3-sidebar ${options.className || 'ol-theme'}`;
        this.def = options.def || this.map.def; //if map.def is set in main
        this.setVisible(options.visible || false); // visible
        this.cp = new Picker({
            popup: 'bottom'
        });
        this.htmlItem = `
        <ul class="item">
            <li class="caret">Stil <div class="w3-button style-remove"><i class="far fa-trash-alt w3-text-red"></i></div></li>
            <ul class="nested">
            <ul class="resolution">
                    <li class="caret"><input class="w3-check check" type="checkbox">Rezolucija</li>
                    <ul class="nested">
                        <li><label>Min, Max</label><input class="w3-input w3-border resolution" value ="0,1000"></li>
                    </ul>
                </ul>
                <ul class="icon">
                    <li class="caret"><input class="w3-check check" type="checkbox">Ikona</li>
                    <ul class="nested">
                        <li><label>Ime ikone</label><select class="w3-select w3-border src"><option selected disabled>odaberi ikonu</option></select></li>
                        <li><label>Skala</label><input class="w3-input w3-border scale" value ="1"></li>
                        <li><label>Točka umetanja, x,y</label><input class="w3-input w3-border anchor" value ="0,0"></li>
                    </ul>
                </ul>
                <ul class="regularShape">
                    <li class="caret"><input class="w3-check check" type="checkbox">Simetrični simbol</li>
                    <ul class="nested">
                        <li><label>Broj točaka</label><input class="w3-input w3-border points" value="6"></li>
                        <li><label>Polumjer</label><input class="w3-input w3-border radius" value="4"></li>
                        <li><label>Boja popune</label><div class="w3-border fill color"></div></li>
                        <li><label>Boja ruba</label><div class="w3-border stroke color"></div></li>
                        <li><label>Debljina ruba</label><input class="w3-input w3-border stroke width" value="1"></li>
                    </ul>
                </ul>
                <ul class="stroke">
                    <li class="caret"><input class="w3-check check" type="checkbox">Rub poligona ili linija</li>
                    <ul class="nested">
                        <li><label>Boja</label><div class="w3-border color"></div></li>
                        <li><label>Debljina</label><input class="w3-input w3-border width" value="1"></li>
                    </ul>
                </ul>
                <ul class="fill">
                    <li class="caret"><input class="w3-check check" type="checkbox">Popuna poligona</li>
                    <ul class="nested">
                    <li><label>Boja</label><div class="w3-border color"></div></li>
                    </ul>
                </ul>
                <ul class="text">
                    <li class="caret"><input class="w3-check check" type="checkbox">Opis objekata</li>
                    <ul class="nested">
                        <li>Tekst || svojstvo iz liste<input class="w3-input w3-border text" value=""></li>
                        <li>Lista svojstava<select class="w3-select w3-border properties"><option disabled selected >odaberi svojstvo</option></select></li>
                        <li>Smještaj<select class="w3-select w3-border placement">
                            <option disabled selected >odaberi smještaj</option>
                            <option value="point">točka</option>
                            <option value= "line">uzduž linije</option>
                        </select></li>
                        <li>CSS Font, poput: bold 18px serif<input class="w3-input w3-border font" value=""></li>
                        <li>Skala<input class="w3-input w3-border scale" value="1"></li>
                        <li>Bazna linija<select class="w3-select w3-border textBaseline">
                            <option disabled selected value= "alphabetic">odaberi baznu liniju</option>
                            <option value="bottom">dno</option>
                            <option value= "top">vrh</option>
                            <option value="middle">sredina</option>
                            <option value= "alphabetic">uobičajeno</option>
                        </select></li>
                    </ul>
                </ul>
                <ul class="filter">
                    <li class="caret"><input class="w3-check check" type="checkbox">Filter za stil</li>
                    <ul class="nested">
                    <li>Svojstvo<select class="w3-select w3-border properties"><option disabled selected>odaberi svojstvo</option></select></li>
                    <li>Operator
                        <select class="w3-select w3-border operators">
                                <option disabled selected value="=">odaberi operator</option>
                                <option value="=">jednako</option>
                                <option value="!=">različito od</option>
                        </select>
                    </li>
                    <li>Vrijednost || odaberi iz liste<input class="w3-input w3-border value" value=""></li>
                    <li>Lista pretpostavljenih vrijednosti<select class="w3-select w3-border constrains"><option disabled selected>Odaberi vrijednost</option></select></li>
                    </ul>
                </ul>
            </ul>
        </ul>   
       `;
    }
    _header() { //create header .hrader, with button click events: _applyStyle, _addStyle
        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = `
            <div class="w3-bar">
                <div class="w3-bar-item">Uredi stil sloja ${this.layer.get('label')|| this.layer.get('name')||'Nedostaje ime sloja ...'}</div>
                <div 
                    onclick = "this.closest('.ol-theme').style.display='none'"
                    ontouchend = "this.closest('.ol-theme').style.display='none'"
                    class="w3-bar-item w3-right w3-button"><i class="far fa-times"></i>
                </div>
            </div>
            <div class="w3-bar">
                <div class="w3-bar-item w3-button w3-right style-apply"><i class="far fa-check"></i> Primjeni</div>
                <div class="w3-bar-item w3-button w3-right style-add"><i class="far fa-plus"></i> Stil</div>
        </div>`;
        this.element.appendChild(header);
        this._styleAdd();
    }
    _colorPicker(itemElement) {
        for (const ce of itemElement.querySelectorAll('.color')) {
            ['click', 'touchend'].forEach(event => ce.addEventListener(event, evt => {
                this.cp.movePopup({
                    parent: evt.currentTarget,
                    color: evt.currentTarget.style.backgroundColor,
                }, true);
            }));
        }
        this.cp.onChange = function (color) {
            this.settings.parent.style.backgroundColor = color.rgbaString;
        };
    }
    _fillOperators(itemElement) {
        for (const e of itemElement.querySelectorAll('.operators')) {
            e.closest('ul').querySelector('.properties').addEventListener('change', evt => {
                e.length = 3;
                const pd = this.layer.def.source.schema.properties.find(x => x.Name === evt.target.value);
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
    _fillIcons(itemElement) { //fill .icons .src select first
        if (!images) return;
        for (const e of itemElement.querySelectorAll('.icon .src')) {
            for (const [key, value] of Object.entries(images)) {
                e.add(new Option(key, key));
            }
            e.selectedIndex=1;
        }
    }
    _fillConstrains(itemElement) { //fill .filter .constrains
        for (const e of itemElement.querySelectorAll('.constrains')) {
            //console.log(e, e.closest('ul').querySelector('.properties'))
            e.closest('ul').querySelector('.properties').addEventListener('change', evt => {
                e.length = 1;
                const pd = this.layer.def.source.schema.properties.find(x => x.Name === evt.target.value);
                if (pd.Constrains) pd.Constrains.map(x => e.add(new Option(x, x)));
            });

        }
    }
    _fillProperties(itemElement) { //fill .text .properties & .filter .properties
        for (const e of itemElement.querySelectorAll('.properties')) {
            e.length = 1; //first allways visible
            for (const p of this.layer.def.source.schema.properties) e.add(new Option(p.Label, p.Name));
        }
    }
    _treeEvents(itemElement) { //for treeview caret clicks, uses: .nested .carret .active, call in _styleAdd()
        const tr = itemElement.querySelectorAll('.caret');
        for (const j of tr) {
            ['click', 'touchend'].forEach(event => j.addEventListener(event, evt => {
                evt.stopPropagation();
                if (evt.target !== j) return;
                j.parentElement.querySelector('.nested').classList.toggle('active');
                j.classList.toggle('caret-down');
            }));
        }
    }
    _createItem() { // create new item html element with all events
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.htmlItem;
        const itemElement = wrapper.firstElementChild;
        this._treeEvents(itemElement);
        this._styleRemove(itemElement);
        this._fillIcons(itemElement);
        this._fillProperties(itemElement);
        this._fillConstrains(itemElement);
        this._fillOperators(itemElement);
        this._colorPicker(itemElement);
        return itemElement;
    }
    _styleAdd() { //add style item to this.element .body with all events
        ['click', 'touchend'].forEach(event => this.element.querySelector('.style-add').addEventListener(event, evt => {
            console.log('add new style item');
            this.element.querySelector('.body').appendChild(this._createItem());
        }));
    }
    _styleRemove(itemElement) { //remove selected style item from this.element .body, call in _styleAdd()
        for (const e of itemElement.querySelectorAll('.style-remove')) {
            ['click', 'touchend'].forEach(event => e.addEventListener(event, evt => {
                console.log('removed style item', e.closest('.item'));
                e.closest('.item').remove();
            }));
        }
    }
    _styleSet() { //add style from this.layer.def.layer.style to this.element UI
        if (!(this.layer.def && this.layer.def.layer && this.layer.def.layer.style)) return;
        const style = this.layer.def.layer.style; //array of styles in def
        style.forEach(x => this.element.querySelector('.body').appendChild(this._createItem())); //add styles to UI
        for (const [i, item] of this.element.querySelectorAll('.item').entries()) { //read from style & set values to items html
            for (const e of item.querySelectorAll('input[type=checkbox].check')) { //style checkbox checked?
                e.checked = style[i][e.closest('ul').className] !== undefined;                                                 
            }
            //console.log(style[i]);
            if (style[i].resolution) item.querySelector('.resolution .resolution').value = style[i].resolution.join();
            if (style[i].icon && style[i].icon.src) item.querySelector('.icon .src').value = style[i].icon.src;
            if (style[i].icon && style[i].icon.scale) item.querySelector('.icon .scale').value = style[i].icon.scale;
            if (style[i].icon && style[i].icon.anchor) item.querySelector('.icon .anchor').value = style[i].icon.anchor.join();
            if (style[i].regularShape && style[i].regularShape.src) item.querySelector('.regularShape .points').value = style[i].regularShape.src;
            if (style[i].regularShape && style[i].regularShape.radius) item.querySelector('.regularShape .radius').value = style[i].regularShape.radius;
            if (style[i].regularShape && style[i].regularShape.fill && style[i].regularShape.fill.color) item.querySelector('.regularShape .fill.color').style.backgroundColor = style[i].regularShape.fill.color;
            if (style[i].regularShape && style[i].regularShape.stroke && style[i].regularShape.stroke.color) item.querySelector('.regularShape .stroke.color').style.backgroundColor = style[i].regularShape.stroke.color;
            if (style[i].regularShape && style[i].regularShape.stroke && style[i].regularShape.stroke.width) item.querySelector('.regularShape .stroke.width').value = style[i].regularShape.stroke.width;
            if (style[i].stroke && style[i].stroke.color) item.querySelector('.stroke .color').style.backgroundColor = style[i].stroke.color;
            if (style[i].stroke && style[i].stroke.width) item.querySelector('.stroke .width').value = style[i].stroke.width;
            if (style[i].fill && style[i].fill.color) item.querySelector('.fill .color').style.backgroundColor = style[i].fill.color;
            if (style[i].text && style[i].text.text) {
                if (item.querySelector(`.text .properties select[value="${style[i].text.text}"]`)) {
                    item.querySelector('.text .properties').value = style[i].text.text;
                    item.querySelector('.text .text').value='';
                }
                else item.querySelector('.text .text').value = style[i].text.text;
            }
            if (style[i].text && style[i].text.placement) item.querySelector('.text .placement').value = style[i].text.placement;
            if (style[i].text && style[i].text.textBaseline) item.querySelector('.text .textBaseline').value = style[i].text.textBaseline;
            if (style[i].text && style[i].text.scale) item.querySelector('.text .scale').value = style[i].text.scale;
            if (style[i].text && style[i].text.font) item.querySelector('.text .font').value = style[i].text.font;

            if (style[i].filter && style[i].filter.property) {
                item.querySelector('.filter .properties').value = style[i].filter.property;
                item.querySelector('.filter .properties').dispatchEvent(new Event('change'));
            }
            if (style[i].filter && style[i].filter.operator) item.querySelector('.filter .operators').value = style[i].filter.operator;
            if (style[i].filter && style[i].filter.value) {
                if (item.querySelector(`.filter .constrains select[value="${style[i].filter.value}"]`)) item.querySelector('.filter .constrains').value = style[i].filter.value;
                else item.querySelector('.filter .value').value = style[i].filter.value;
            }
        }
    }
    _styleApply() { //apply style from this.element .body to def.layer.style and through makeStyle(def.layer.style) to layer
        ['click', 'touchend'].forEach(event => this.element.querySelector('.style-apply').addEventListener(event, evt => {
            console.log('apply style')
            const
                ns = [], //new style
                s = sName => this.element.querySelector(`.${sName} .check`);
            for (const i of this.element.querySelectorAll('.item')) {
                const is = {};
                for (const e of i.querySelectorAll('input[type=checkbox]:checked.check')) {
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
            console.log(ns);
            this.layer.setStyle(makeStyle(ns));
        }));
    }
    setLayerByName(name) { //public method creates this.element for layer name calling internal methods '_'
        this.layer = this.map.getLayers().getArray().find(x => x.get('name') === name);
        this.element.innerHTML = ''; //new layer, clear all
        this._header(); //create header
        const body = document.createElement('div');
        body.className = 'body';
        this.element.appendChild(body); //create body
        this._styleSet(); //set style from def.layer.style to body treeview
        this._styleApply(); //apply style from this.element .body to def.layer.style and through makeStyle(def.layer.style) to layer
    }
    getVisible() {
        return this.element.style.display === 'none' ? false : true;
    }
    setVisible(b) { //show/hide sidebar
        this.element.style.display = b ? 'block' : 'none';
        this.dispatchEvent({
            type: 'change:visible',
            key: 'visible',
            oldValue: !b,
            visible: b
        });
    }
    getDisabled() { //disable sidebar
        return this.element.style.pointerEvents === 'none';
    }
    setDisabled(b) {
        this.element.style.pointerEvents = b ? 'none' : 'auto';
        this.dispatchEvent({
            type: 'change:disabled',
            key: 'disabled',
            oldValue: !b,
            disabled: b
        });
    }
}