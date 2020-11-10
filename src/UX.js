/**
 *
 *
 * @export
 * @class UX
 * @extends {Control}
 * @param {Object=} options Control options. 
 */
export default class UX {
    constructor(options = {}) {
        this.addMap();
    }
    addMap(){
        this.map = document.createElement('div');
        this.map.className='map';
        document.body.appendChild(this.map)
    }
}