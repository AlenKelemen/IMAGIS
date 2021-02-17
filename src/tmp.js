const select = this.map
.getInteractions()
.getArray()
.find((x) => x instanceof Select);
if(select){
  console.log(select);
  select.on("select", (evt) => selectListener(evt, select));
}