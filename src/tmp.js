
  for (const i of this.items) {
    const thematic = elt("div", { className: "thematic" });
    const visibility = elt("span", {}, elt("i", { className: "far fa-eye fa-fw" }));
    if (i.layer.getVisible()) visibility.firstChild.className = "far fa-eye fa-fw";
    else visibility.firstChild.className = "far fa-eye-slash fa-fw";
    visibility.addEventListener("click", (evt) => {
      if (!this.getVisible(i.layer)) return;
      i.layer.setVisible(!i.layer.getVisible());
      if (i.layer.getVisible()) visibility.firstChild.className = "far fa-eye fa-fw";
      else visibility.firstChild.className = "far fa-eye-slash fa-fw";
    });
    const opacity = elt("input", { type: "range", min: "0", max: "1", step: "0.01" });
    opacity.value = i.layer.getOpacity();
    opacity.addEventListener("change", (evt) => {
      i.layer.setOpacity(Number(opacity.value));
    });
    const tools = elt("div", { className: "tools" }, visibility, 
    elt("div", { className: "opacitiy" }, elt("i", { className: "far fa-fog fa-fw" }),opacity));
    const head = elt("div", { className: "head" }, i.icon, elt("span", {}, i.label));
    const item = elt("div", { className: "item" }, head, thematic, tools);
    this.itemElements.push(item);
    item.setAttribute("data-name", i.layer.get("name"));
    this.main.appendChild(item);
    const t = thematicItems.filter((x) => x.layer === i.layer);
    for (const [i, ti] of t.entries()) {
      const itemThematic = elt("div", {}, ti.icon, elt("span", {}, ti.label));
      thematic.appendChild(itemThematic);
    }
    if (this.hide) item.style.display = this.getVisible(i.layer) ? "block" : "none";
    else {
      item.style.opacity = this.getVisible(i.layer) ? "1" : "0.4";
      thematic.style.display='none';
      tools.style.display='none';
    }
  }