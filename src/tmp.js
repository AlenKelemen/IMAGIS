getLegendImage(legendSize = [400, 400], font = "12px Verdana") {
  const legendImage = elt("canvas", { className: `icon`, width: legendSize[0], height: legendSize[1] });
  const lictx = legendImage.getContext("2d");
  lictx.textBaseline = "middle";
  const r = [];
  let i = 0; //layer counter
  for (const l of this.layers) {
    if (l.getVisible()) {
      if (l instanceof TileLayer) {
        r.push(this.loadImage(images.lc_raster, i));
        const labelText = l.get("label") || l.get("name");
        lictx.fillText(labelText, 32, 8 + i * 16);
      }
      if (l instanceof VectorLayer && typeof l.getStyle() === "function") {
        let style = l.getStyle().call(this, undefined, this.map.getView().getResolution());
        const icon = elt("canvas", { className: `icon`, width: this.iconSize[0], height: this.iconSize[1] });
        if (style.length > 1) {
          r.push(this.loadImage(images.lc_theme, i));
          const labelText = l.get("label") || l.get("name");
          lictx.fillText(labelText, 32, 8 + i * 16);
          for (const [k, s] of style.entries()) {
            i++;
            const imagStyle = l.get("imagis-style")[k];
            const icon = elt("canvas", { className: `icon`, width: this.iconSize[0], height: this.iconSize[1] });
            const ctx = icon.getContext("2d");
            const vctx = toContext(ctx, {
              size: this.iconSize,
            });
            vctx.setStyle(s);
            if (s.getFill()) vctx.drawGeometry(this.symbols.polygon);
            if (!s.getFill() && s.getStroke()) vctx.drawGeometry(this.symbols.linestring);
            const imageStyle = s.getImage();
            if (imageStyle instanceof Icon) {
              r.push(loadImage(imageStyle.getSrc(), i));
            } else {
              vctx.drawGeometry(this.symbols.point);
            }
            lictx.drawImage(icon, 16, i * 16);
            if (imagStyle && imagStyle.filter) {
              const text = `${imagStyle.filter.property} ${imagStyle.filter.operator} ${imagStyle.filter.value}`;
              lictx.fillText(text, 48, 8 + i * 16);
            }
          }
        }
        if (style.length === 1) {
          style = style[0];
          
          const ctx = icon.getContext("2d");
          const vctx = toContext(ctx, {
            size: this.iconSize,
          });
          vctx.setStyle(style);
          if (style.getFill()) vctx.drawGeometry(this.symbols.polygon);
          if (!style.getFill() && style.getStroke()) vctx.drawGeometry(this.symbols.linestring);
          const imageStyle = style.getImage();
          if (imageStyle instanceof Icon) {
            r.push(this.loadImage(imageStyle.getSrc(), i));
          } else {
            vctx.drawGeometry(this.symbols.point);
          }
          this.map.getView().on("change:resolution", (evt) => {
            const r = evt.target.getResolution();
            const max = l.get("imagis-style")[0].maxResolution || Infinity;
            const min = l.get("imagis-style")[0].minResolution || -Infinity;
            if(r >= min && r <= max){
              lictx.drawImage(icon, 0, i * 16);
              const labelText = l.get("label") || l.get("name");
              lictx.fillText(labelText, 32, 8 + i * 16);
            }
          });
        }
      }
      i++;
    }
  }
  Promise.all(r).then((imgs) => {
    for (const img of imgs) {
      const icon = elt("canvas", { width: this.iconSize[0], height: this.iconSize[1] });
      const ctx = icon.getContext("2d");
      ctx.drawImage(img[0], 0, 0, img[0].width, img[0].height, 0, 0, icon.width, icon.height);
      lictx.drawImage(icon, 0, img[1] * 16);
    }
    const ex = elt("canvas", { className: `icon`, width: legendImage.width, height: legendImage.height });
    const exCtx = ex.getContext("2d");
    exCtx.drawImage(legendImage, 0, 0);
    this.image.href = ex.toDataURL();
    this.image.download = "legend.png";
  });
}

this.layers = this.map //layers sorted by zIndex
.getLayers()
.getArray()
.sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
.reverse();


setContent(iconSize = [16, 16]) {
  this.main.innerHTML = "";
  const ls = this.map
    .getLayers()
    .getArray()
    .sort((a, b) => (a.getZIndex() > b.getZIndex() ? 1 : -1))
    .reverse(); //sort layers by index
  const polygon = new Polygon([
    [
      [0, 0],
      [iconSize[0], 0],
      [iconSize[0], iconSize[1]],
      [0, iconSize[1]],
      [0, 0],
    ],
  ]);
  const linestring = new LineString([
    [0, 0],
    [iconSize[0], iconSize[1]],
  ]);
  const point = new Point([iconSize[0] / 2, iconSize[1] / 2]);
  for (const [i, l] of ls.entries()) {
    const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
    const label = elt("label", {}, l.get("label") || l.get("name"));
    const thematic = elt("div", { className: `thematic` });
    const item = elt("div", { className: "item", dataName: `${l.get("name")}` }, icon, label, thematic);
    this.main.appendChild(item);
    if (l instanceof TileLayer) this.loadImage(icon, images.lc_raster);
    if (l instanceof VectorLayer && typeof l.getStyle() === "function") {
      let style = l.getStyle().call(this, undefined, this.map.getView().getResolution());
      style = Array.isArray(style) ? style : [style];
      if (style.length > 1) {
        this.loadImage(icon, images.lc_theme);
        for (const [i, s] of style.entries()) {
          const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
          const label = elt("label", {}, ``);
          const item = elt("div", { className: "item", dataName: `${l.get("name")}` }, icon, label);
          thematic.appendChild(item);
          const imagStyle = l.get("imagis-style")[i];
          if (imagStyle && imagStyle.filter) {
            label.innerHTML = `${imagStyle.filter.property} ${imagStyle.filter.operator} ${imagStyle.filter.value}`;
          }
          const ctx = icon.getContext("2d");
          const vctx = toContext(ctx, {
            size: iconSize,
          });
          vctx.setStyle(s);
          if (s.getFill()) vctx.drawGeometry(polygon);
          if (!s.getFill() && s.getStroke()) vctx.drawGeometry(linestring);
          const imageStyle = s.getImage();
          if (imageStyle instanceof Icon) {
            this.loadImage(icon, imageStyle.getSrc());
          } else {
            vctx.drawGeometry(point);
          }
        }
      }
      if (style.length === 1) {
        style = style[0];
        const ctx = icon.getContext("2d");
        const vctx = toContext(ctx, {
          size: iconSize,
        });
        vctx.setStyle(style);
        if (style.getFill()) vctx.drawGeometry(polygon);
        if (!style.getFill() && style.getStroke()) vctx.drawGeometry(linestring);
        const imageStyle = style.getImage();
        if (imageStyle instanceof Icon) {
          this.loadImage(icon, imageStyle.getSrc());
        } else {
          vctx.drawGeometry(point);
        }
      }
    }
  }
}