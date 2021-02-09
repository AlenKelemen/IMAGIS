


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