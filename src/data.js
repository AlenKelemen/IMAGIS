import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/regular.min.css";
import Container from "./container";
import Control from "ol/control/Control";
import Toggle from "./toggle";
import { elt } from "./util";
import Chart from "chart.js";
import Select from "ol/interaction/Select";

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
    this.graph = elt("canvas", { height: "100%", width: "100%", className: "graph" });
    this.container.element.appendChild(this.graph);
    this.ctx = this.graph.getContext("2d");
    const th = this.map
      .getLayers()
      .getArray()
      .find((x) => x.get("name") === "TH");
    this.chart = this.baseChart();
    const evtFunction = (evt) => {
      const select = evt.target;
      const features = select.getFeatures().getArray();
      const f = features[features.length - 1];
      if (f.get("layer") === th) {
        this.container.setVisible(true);
        const id = f.get("device_id");
        this.chart.options.title.text = f.get("device_name");

        this.getData(id);
      }
    };
    this.on("change:active", (evt) => {
      const select = this.getSelect();
      if (evt.active && select) {
        this.map.legend.setActiveLayer(th);
        this.map.select.pointToggle.setActive(true);
        map.ux.footer.setVisible(false);
        select.on("select", evtFunction);
      } else {
        select.un("select", evtFunction);
        this.container.setVisible(false);
        map.ux.footer.setVisible(true);
      }
    });
  }
  getSelect() {
    return this.map
      .getInteractions()
      .getArray()
      .find((x) => x instanceof Select);
  }
  baseChart() {
    return new Chart(this.ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "tlak bar",
            yAxisID: "Pressure",
            fill: false,
            backgroundColor: "white",
            borderColor: "red",
            borderWidth: 1,
            radius: 0,
            data: [],
          },
          {
            label: "protok l/s",
            yAxisID: "Flow",
            fill: false,
            backgroundColor: "white",
            borderColor: "blue",
            radius: 0,
            data: [],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Telemetrijski hidrant",
        },
        legend: {
          display: true,
          position: "bottom",
          labels: {
            fontColor: "#000080",
            boxWidth: 20,
          },
        },
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: "day",
                displayFormats: {
                  day: "DD",
                },
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "bar",
              },
              id: "Pressure",
              type: "linear",
              position: "left",
            },
            {
              scaleLabel: {
                display: true,
                labelString: "l/s",
              },
              id: "Flow",
              type: "linear",
              position: "right",
              ticks: {
                max: 0.5,
                min: 0,
              },
            },
          ],
        },
      },
    });
  }
  getData(name = 161) {
    const pathPressure = `${this.cfg.sources.find((x) => x.name === "thDataPressure").path}?device_id=eq.${name}`;
    const pathFlow = `${this.cfg.sources.find((x) => x.name === "thDataFlow").path}?device_id=eq.${name}`;
    const chart = this.chart;
    chart.data.datasets.forEach((dataset) => {
      dataset.data=[]
    });
    chart.update();
    console.log(this.chart.data.datasets[0].data.length);
    fetch(pathPressure)
      .then((r) => r.json())
      .then((r) => {
        for (const p of r) {
          chart.data.datasets[0].data.push({
            t: p.date_part * 1000,
            y: p.pressure,
          });
        }
        chart.update();
        console.log(this.chart.data.datasets[0].data.length);
      });
    fetch(pathFlow)
      .then((r) => r.json())
      .then((r) => {
        for (const p of r) {
          chart.data.datasets[1].data.push({
            t: p.date_part * 1000,
            y: p.flow,
          });
        }
        chart.update();
      });
  }
}
