import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Chart from "chart.js";

export default class Data extends Toggle {
  constructor(options = {}) {
    if (!options.className) options.className = "toggle";
    if (!options.html) options.html = '<i class="far fa-analytics fa-fw"></i>';
    super(options);
    this.cfg = options.cfg;

    this.container = new Container({
      semantic: "section",
      className: `taskpane horizontal`,
    });
    options.target.addControl(this.container);
    this.map = this.container.getMap();
    this.container.setVisible(this.active);
    this.on("change:active", (evt) => this.container.setVisible(evt.active));
    this.graph = elt("canvas", { height: "100%", width: "100%", className: "graph" });
    this.container.element.appendChild(this.graph);
    this.ctx = this.graph.getContext("2d");

    this.getData();
  }
  getData(name = 161) {
    const pathPressure = `${this.cfg.sources.find((x) => x.name === "thDataPressure").path}?device_id=eq.${name}`;
    const pathFlow = `${this.cfg.sources.find((x) => x.name === "thDataFlow").path}?device_id=eq.${name}`;
    fetch(pathPressure)
      .then((r) => r.json())
      .then((r) => {
        const data = [];
        for (const p of r) {
          data.push({
            t: p.date_part,
            y: p.pressure,
          });
        }
        console.log(data);
        const chart = new Chart(this.ctx, {
          type: "line",
          data: {
            datasets: [
              {
                data: data,
              },
            ],
          },
          options: {
            scales: {
              xAxes: [
                {
                  type: "time",
                },
              ],
            },
          },
        });
      });
  }
}
