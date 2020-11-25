import {
    Icon,
    Fill,
    Stroke,
    Circle,
    Text,
    RegularShape,
    Style
} from 'ol/style';
const images = require('../img/*.png');
/**
 * 
 * icon style:
 * "style": {
     "icon": {
         "src": "494-hidrantNaPovrsini",
         "scale": 0.2
     }
 }
 * @export
 * @param {*} styleSpec
 * @returns ol/style function
 */
export function makeStyle(styleSpec) {
    if (!styleSpec) return; //default style
    const sp = Array.isArray(styleSpec) ? styleSpec : [styleSpec]; //allways as array
    return function(feature, resolution) {
        const styles = [];
        for (const s of sp) {
            let style = new Style();
            let filterFlag = true,
                resFlag = true;
            if (s.filter && feature) {
                const f = s.filter;
                if (f.value && f.property) {
                    const p = feature.get(f.property) || '';
                    switch (f.operator) {
                        case '=':
                            filterFlag = p == f.value;
                            break;
                        case '>':
                            filterFlag = p > f.value;
                            break;
                        case '<':
                            filterFlag = p < f.value;
                            break;
                        case '>=':
                            filterFlag = p >= f.value;
                            break;
                        case '<=':
                            filterFlag = p <= f.value;
                            break;
                        case '!=':
                            filterFlag = p != f.value;
                            break;
                        case 'LIKE':
                            filterFlag = (p && f.value) && ((p + '').search(f.value)) !== -1;
                    }
                }
            }
            if (s.resolution) resFlag = s.resolution[0] < resolution && resolution < s.resolution[1];
            if ((filterFlag && resFlag)) {
                if (s.fill) style.setFill(new Fill({
                    color: s.fill.color
                }));
                if (s.stroke) style.setStroke(new Stroke({
                    color: s.stroke.color,
                    width: s.stroke.width
                }));
                if (s.text) {
                    if (!s.text.resolution || (s.text.resolution[0] < resolution && s.text.resolution[1] > resolution)) {
                        style.setText(new Text({
                            font: s.text.font,
                            scale: s.text.scale,
                            maxAngle: s.text.maxAngle,
                            offsetX: s.text.offsetX,
                            offsetY: s.text.offsetY,
                            placement: s.text.placement, //
                            textAlign: s.text.textAlign,
                            textBaseline: s.text.textBaseline, //
                            padding: s.text.padding
                        }));
                        if (s.text.text) {
                            if (feature) {
                                const text = feature.get(s.text.text); //no feature defined - no text
                                if (!text && s.text.text !== '') {
                                    if (s.text.text.startsWith('*')) style.getText().setText(s.text.text.substr(1));
                                    else style.getText().setText('');
                                } else style.getText().setText(text + '');

                            } else {
                                style.getText().setText(s.text.text + '');
                            }
                        }
                        if (s.text.fill) {
                            style.getText().setFill(new Fill({
                                color: s.text.fill.color
                            }));
                        }
                        if (s.text.stroke) {
                            style.getText().setStroke(new Stroke({
                                color: s.text.stroke.color,
                                width: s.text.stroke.width
                            }));
                        }
                        if (s.text.backgroundStroke) {
                            style.getText().setBackgroundStroke(new Stroke({
                                color: s.text.backgroundStroke.color,
                                width: s.text.backgroundStroke.width
                            }));
                        }
                        if (s.text.backgroundFill) {
                            style.getText().setBackgroundFill(new Fill({
                                color: s.text.backgroundFill.color
                            }));
                        }
                    }

                }
                if (s.circle) {
                    style.setImage(new Circle({
                        radius: s.circle.radius,
                        displacement: s.circle.displacement,
                        fill: s.circle.fill ? new Fill({
                            color: s.circle.fill.color
                        }) : null,
                        stroke: s.circle.stroke ? new Stroke({
                            color: s.circle.stroke.color,
                            width: s.circle.stroke.width
                        }) : null,
                    }));
                }
                if (s.regularShape) {
                    style.setImage(new RegularShape({
                        points: s.regularShape.points,
                        radius: s.regularShape.radius,
                        radius1: s.regularShape.radius1,
                        radius2: s.regularShape.radius2,
                        angle: s.regularShape.angle,
                        rotation: s.regularShape.rotation,
                        displacement: s.regularShape.displacement,
                        fill: s.regularShape.fill ? new Fill({
                            color: s.regularShape.fill.color
                        }) : null,
                        stroke: s.regularShape.stroke ? new Stroke({
                            color: s.regularShape.stroke.color,
                            width: s.regularShape.stroke.width
                        }) : null,
                    }));
                }
                if (s.icon) {
                    style.setImage(new Icon({
                        src: images[s.icon.src],
                        anchor: s.icon.anchor,
                        anchorOrigin: s.icon.anchorOrigin,
                        anchorXUnits: s.icon.anchorXUnits,
                        anchorYUnits: s.icon.anchorYUnits,
                        color: s.icon.color,
                        offset: s.icon.offset,
                        displacement: s.icon.displacement,
                        offsetOrigin: s.icon.offsetOrigin,
                        opacity: s.icon.opacity,
                        scale: s.icon.scale,
                        rotation: s.icon.rotation,
                        size: s.icon.size
                    }));
                }
            }
            styles.push(style);
        }
        return styles;
    };
}