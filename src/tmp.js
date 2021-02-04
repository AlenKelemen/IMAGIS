styleIcon(style, iconSize = [16, 16]) {
    const r = [];
    if (typeof style === "function") style = style.call(this, undefined, this.map.getView().getResolution());
    else if (typeof style === "object") style = [style];
    const ce = function () {
      const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
      const ctx = icon.getContext("2d");
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
      const vctx = toContext(ctx, {
        size: iconSize,
      });
      return { img: img, icon: icon, ctx: ctx, vctx: vctx };
    };
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
    if (style == undefined) {
      style = [];
      const el = ce();
      el.img.src = images.lc_raster;
      r.push(el.icon);
    }
    if (style.length > 1) {
      const el = ce();
      el.img.src = images.lc_theme;
      r.push(el.icon);
    }
    for (const [i, s] of Object.entries(style)) {
      const el = ce();
      el.ctx.fillStyle = "#F2F2F2";
      el.ctx.fillRect(0, 0, el.icon.width, el.icon.height);
      if (s instanceof Style) {
        el.vctx.setStyle(s);
        if (s.getFill()) el.vctx.drawGeometry(polygon);
        if (!s.getFill() && s.getStroke()) el.vctx.drawGeometry(linestring);
        const imageStyle = s.getImage();
        if (imageStyle) {
          el.vctx.drawGeometry(point);
          if (imageStyle instanceof Icon) el.img.src = imageStyle.getSrc();
        }
      }
      r.push(el.icon);
    }
    return r;
  }

  /*
  const loadImage = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.src = url;
      });
    Promise.all([loadImage(images.lc_theme), loadImage(images.th), loadImage(images.lc_raster)])
      .then((imgs) => {
        for (const img of imgs) {
          const icon = elt("canvas", { className: `icon`, width: iconSize[0], height: iconSize[1] });
          const ctx = icon.getContext("2d");
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, icon.width, icon.height);
          console.log(icon.toDataURL())
        }
      })
      .catch((err) => console.error(err));
  */