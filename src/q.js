const item = Object.assign(document.createElement("section"), ),
itemHeader = Object.assign(document.createElement("header"), { className: `${this.className}-item-header` }),
itemArticle = Object.assign(document.createElement("article"), { className: `${this.className}-item-article` }),
itemFooter = Object.assign(document.createElement("footer"), { className: `${this.className}-item-footer` });
item.appendChild(itemHeader);
item.appendChild(itemArticle);
item.appendChild(itemFooter);
this.items.appendChild(item);
item.id = prop.name;
// item header
itemHeader.innerHTML = `
<span class="${this.className}-item-header-icon">
  <canvas width="${this.iconSize[0]}" height="${this.iconSize[1]}"></canvas>
</span>
<span class="${this.className}-item-header-label">${prop.label || prop.name}</span>
<div class="${this.className}-item-header-thematic"></div>`;
const canvas = itemHeader.querySelector("canvas");
this.icon(canvas, this.source(prop.name).type);
}
icon(canvas, type) {
const ctx = canvas.getContext("2d"),
img = new Image();
img.src = images.lc_raster;
if (["geojson", "th"].indexOf(type) > -1) {

img.src = images.lc_theme;
}
img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);