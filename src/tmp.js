import '@fortawesome/fontawesome-pro/css/fontawesome.css';
import '@fortawesome/fontawesome-pro/css/regular.min.css';
import Control from 'ol/control/Control';
import moment from 'moment';

export default class Properties extends Control {
    constructor(options = {}) {
        super({
            element: document.createElement('div')
        });
        this.button = document.createElement('button');
        this.element.className = options.className; //
        this.button.innerHTML = options.html || ''; //
        this.button.title = options.tipLabel; //
        this.select = options.select; //
        this.readOnly = options.readOnly; //
        this.onChange = options.onChange; //
        this.button.addEventListener('click', evt => {
            this.setActive(!this.getActive());
        });
        this.element.appendChild(this.button);
        this.contaner = document.createElement('span');
        this.contaner.style.cssText = `display:none;`;
        this.contaner.className = 'taskpane properties';
        this.element.appendChild(this.contaner);
        this.select.on('select', evt => {
            this.dialog(this.select.getFeatures().getArray());
        });
        this.select.dispatchEvent('select');
    }
    dialog(features) { // creates main dilaog with layer headers & content for table
        if (features.length === 0) {
            this.contaner.classList.add('middle');
            this.contaner.innerHTML = 'Odaberi objekte na karti';
        } else {
            this.contaner.classList.remove('middle');
            this.contaner.innerHTML = '';
            const item = [];
            for (const f of features) {
                const l = f.get('layer');
                if (l) { // TODO: if no layer as feature property ?
                    if (item.find(x => x.layer === l)) {
                        item.find(x => x.layer === l).features.push(f);
                    } else {
                        item.push({
                            layer: l,
                            features: [f]
                        });
                    }
                }

            }
            for (const [index, i] of item.entries()) {
                const ld = document.createElement('div'); //layer div
                ld.className = 'layer';
                ld.innerHTML = `
                        <div class="header"><i class="far fa-plus"></i> ${i.layer.get('label') || i.layer.get('name')} (${i.features.length})</div>
                    `;
                this.contaner.appendChild(ld);
                const content = document.createElement('div');
                content.className = 'items';
                if (index === 0) { //show only first layer items...
                    content.style.display = 'block';
                    ld.querySelector('i').className = 'far fa-minus';
                } else {
                    content.style.display = 'none';
                    ld.querySelector('i').className = 'far fa-plus';
                }
                ld.querySelector('i').addEventListener('click', evt => {
                    const e = evt.currentTarget;
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    e.className = content.style.display === 'none' ? 'far fa-plus' : 'far fa-minus';
                });
                ld.appendChild(content);
                this.table(i.layer, i.features, content);
            }
        }
    }
    table(layer, features, element) { //creates feature table
        if (!layer.getSource().get('def')) return;
        let props = []; //consolidated props
        for (const f of features) {
            for (const key of f.getKeys()) {
                if (key !== f.getGeometryName() && props.find(x => x.Name === key) === undefined) {
                    const prop = layer.getSource().get('def').schema.properties.find(x => x.Name === key); //only props defined in def
                    if (prop) props.push(prop);
                    if (props.length > 0) props[props.length - 1].values = [];
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
        console.log(props);
        props = props.filter(x => x.Hidden !== true); //in layer.def.source.schema.properties hiden properties can be defined
        for (const p of props) {
            const div = document.createElement('div'),
                label = document.createElement('label');
            let input = document.createElement('input');
            div.className = 'item';
            input.className = 'input';
            if (p.Constrains && !this.readOnly) {
                input = document.createElement('select');
                input.className = 'input';
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
    setActive(b) {
        this.contaner.style.display = b ? 'flex' : 'none';
        if (this.getActive() == b) return;
        if (b) {
            this.button.classList.add('active');
            if (this.getParent()) this.getParent().deactivateControls(this); //see container.js for deactivateControls
        } else {
            this.button.classList.remove('active');
        }
        this.dispatchEvent({
            type: 'change:active',
            key: 'active',
            oldValue: !b,
            active: b
        });
    }
    getActive() {
        return this.button.classList.contains('active');
    }
    getParent() {
        if (this.get('parent')) return this.get('parent');
    }
}