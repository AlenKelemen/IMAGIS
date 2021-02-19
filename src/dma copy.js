this.mzLayer = this.map
.getLayers()
.getArray()
.find((x) => x.getSource().get("name") === srcName);
if (!this.mzLayer || this.mzLayer instanceof VectorLayer === false) return;
const src = this.mzLayer.getSource();
src.once("change", (evt) => {
if (src.getState() === "ready") {
  //console.log(src.getFeatures());
  this.content(src.getFeatures());
}
});
}
query(layerName) {
const src = this.map
.getLayers()
.getArray()
.find((x) => x.get("name") === layerName)
.getSource();
return new Promise(function (resolve, reject) {

 
    const fs = src.getFeatures()
    resolve(fs);
  

});
}
content(features) {
const fo = features.filter((x) => x.get("napomena") !== "Glavne").sort((a, b) => a.get("naziv").toLowerCase().localeCompare(b.get("naziv").toLowerCase()));
const getArea = (f) => {
let a = "";
if (f.getGeometry().getType() === "Polygon") {
  a = f.getGeometry().getArea();
  a = (a * 0.001).toFixed(0);
}
return a;
};

for (const f of fo) {

/*   const p = polygon(f.getGeometry().getCoordinates());
const pmoCalc = elt("td", {}, '0');
const pmo = elt("tr", {}, elt("td", {}, "Broj potrošaća"), pmoCalc);
this.query("").then((r) => {
  const inner=[];;
  for(const f of r){
   inner.push (p.intersect(point(f.getGeometry().getFirstCoordinate())));
  }
  console.log(inner.lenght)
  
}); */


const vodCalc = elt("td", {}, '0');
const vodLenght = elt("tr", {}, elt("td", {}, "Dužina cjevovoda m"), vodCalc);
this.query("vod").then((r) => {
  const l= r.filter(x => x.get("MjernaZona") === f.get("naziv"))
  vodCalc.innerHTML = l.reduce((sumLength, cv,) => sumLength + cv.getGeometry().getLength(),0).toFixed(0);
});
const area = elt("tr", {}, elt("td", {}, "Površina m2"), elt("td", {}, getArea(f)));
const tbl = elt("table", {}, area, vodLenght);
const btn = elt("button", {}, f.get("naziv"));
const container = elt("div", { className: "container" }, tbl);
container.style.display = "none";
const item = elt("div", { className: "item" }, btn, container);
item.setAttribute("data-id", f.getId());
item.setAttribute("data-name", f.get("naziv"));
this.main.appendChild(item);

btn.addEventListener("click", (evt) => {
  //Array.from(this.main.querySelectorAll(".container")).map((x) => (x.style.display = "none"));
  container.style.display = container.style.display === "none" ? "block" : "none";
  if (container.style.display === "block") this.map.getView().fit(f.getGeometry().getExtent());
  //this.query("hidrant").then((r) => {console.log(r)})
  const src = this.map
  .getLayers()
  .getArray()
  .find((x) => x.get("name") === 'pmo')
  .getSource();
  src.once("change", (evt) => {
    if (src.getState() === "ready") {
      console.log('efrwe')
    }
  })
});
}
}