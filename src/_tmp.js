import Control from 'ol/control/Control';
import olSelect from 'ol/interaction/Select';
import moment from 'moment';
import 'w3-css/w3.css';

export default class Properties extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        this.map = options.map || map; //from windows.map=map if map set in main
        this.set('name', options.name || 'properties'); // control name
        this.element.className = `w3-sidebar ${options.className || 'ol-properties'}`;
        this.def = options.def || this.map.def; //if map.def is set in main
        this.onChange = options.onChange; // function when feature properties changed
        this.readOnly = options.readOnly; // edit properties or read only
        this.setVisible(options.visible || false); // visible
        this.body = document.createElement('div');
        this.element.appendChild(this.body);
        this.map.getInteractions().on('add', evt => {
            if (evt.element instanceof olSelect) {
                const select = evt.element;
                select.on('select', evt => {
                    const item = [];
                    this.body.innerHTML = '';
                    for (const f of select.getFeatures().getArray()) {
                        if (item.find(x => x.layer === select.getLayer(f))) {
                            item.find(x => x.layer === select.getLayer(f)).features.push(f);
                        } else {
                            item.push({
                                layer: select.getLayer(f),
                                features: [f]
                            });
                        }
                    }
                    for (const [index, i] of item.entries()) {
                        const ld = document.createElement('div');
                        ld.className = 'layer';
                        ld.innerHTML = `
                        <div class="header"><button class="w3-button show-more"><i class="far fa-plus"></i></button> ${i.layer.get('label') || i.layer.get('name')} (${i.features.length})</div>
                        `;
                        ['click', 'touchend'].forEach(event => ld.querySelector('.show-more').addEventListener(event, evt => {
                            const e = evt.currentTarget;
                            ld.querySelector('.items').style.display = ld.querySelector('.items').style.display === 'none' ? 'block' : 'none';
                            e.innerHTML = ld.querySelector('.items').style.display === 'none' ? '<i class="far fa-plus"></i>' : '<i class="far fa-minus"></i>';
                        }));
                        this.body.appendChild(ld);
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
                        this._dialog(i.layer, i.features, content);
                    }
                });
            }
        });
        this.map.getInteractions().on('remove', evt => {
            if (evt.element instanceof olSelect) {
                this.body.innerHTML = '';
            }
        });
    }
    _dialog(layer, features, element) {
        const props = []; //consolidated props
        for (const f of features) {
            for (const key of f.getKeys()) {
                if (key !== f.getGeometryName() && props.find(x => x.Name === key) === undefined) {
                    props.push(layer.def.source.schema.properties.find(x => x.Name === key) || {
                        Name: key
                    });
                    props[props.length - 1].values = [];
                }
            }
        }
        for (const f of features) {
            for (const p of props) {
                if (p.values.indexOf(f.get(p.Name)) === -1) {
                    p.values.push(
                        f.get(p.Name)
                    );
                }
            }
        }
        for (const p of props) {
            if (!p.Hidden) { //in layer.def.source.schema.properties
                const div = document.createElement('div'),
                    label = document.createElement('label');
                let input = document.createElement('input');
                div.className = 'item';
                input.className = 'w3-input w3-border input';
                if (p.Constrains && !this.readOnly) {
                    input = document.createElement('select');
                    input.className = 'w3-select w3-border input';
                    for (const constrain of p.Constrains) {
                        const option = document.createElement('option');
                        option.value = constrain;
                        option.innerHTML = constrain;
                        input.appendChild(option);
                    }
                    if (p.values.length > 1) input.options[input.options.length] = new Option('*VARIRA*', '*VARIRA*');
                }
                label.innerText = p.Label || p.Name;
                input.value = p.values.length > 1 ? '*VARIRA*' : p.values[0];
                input.id = p.Name; // id = property name
                input.disabled = this.readOnly;
                div.appendChild(label);
                div.appendChild(input);
                element.appendChild(div);
                switch (p.DataType) {
                    case undefined || null || 0 || '':
                        console.log('dataType: undefined ||null||0||"" for:' + input.id);
                        break;
                    case 1: //boolean
                        input.setAttribute('type', 'checkbox');
                        input.className = 'w3-check w3-border input';
                        if (item.values.length > 1) {
                            input.indeterminate = true;
                        } else {
                            input.checked = item.values[0];
                        }
                        break;
                    case 3: //datetime
                        input.placeholder = 'YYYY-MM-DD HH:mm:ss';
                        input.addEventListener('focus', evt => {
                            input.oldValue = evt.target.value;
                        });
                        input.addEventListener('change', evt => {
                            let value = evt.target.value;
                            if (value == '') return;
                            let momentValue = moment(value, 'YYYY-MM-DD HH:mm:ss');
                            evt.target.value = momentValue.isValid() ? momentValue.format('YYYY-MM-DD HH:mm:ss') : input.oldValue;
                        });
                        break;
                    case 6:
                    case 7:
                    case 8: // integer
                        input.placeholder = 'cijeli broj';
                        input.addEventListener('focus', evt => {
                            input.oldValue = evt.target.value;
                        });
                        input.addEventListener('change', evt => {
                            evt.target.value = isNaN(parseInt(evt.target.value, 10)) ? input.oldValue : parseInt(evt.target.value, 10);
                        });
                        break;
                    case 4:
                    case 5:
                    case 15: //float
                        input.placeholder = 'decimalni broj';
                        input.addEventListener('focus', evt => {
                            input.oldValue = evt.target.value;
                        });
                        input.addEventListener('change', evt => {
                            evt.target.value = isNaN(parseFloat(evt.target.value, 10)) ? input.oldValue : parseFloat(evt.target.value, 10);
                        });
                        break;
                    case 9: //string
                        break;
                    default: //geometry
                }
                if (input.tagName === 'INPUT') input.addEventListener('change', evt => this.onChange.call(this, evt));
                if (input.tagName === 'SELECT') input.addEventListener('change', evt => this.onChange.call(this, evt));
            }
        }
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