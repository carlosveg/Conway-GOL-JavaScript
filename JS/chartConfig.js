export class Chart {
  constructor() {
    this.dataset = anychart.data.set([]);

    // set chart type
    var chart = anychart.line();

    chart.title({
      text: "Gráfica de densidades",
      fontColor: "#333",
      fontSize: 20,
    });

    // set data
    chart.spline(this.dataset).markers(null);

    // disable stagger mode. Only one line for x axis labels
    chart.xAxis().staggerMode(false);

    // set container and draw chart
    chart.container("chart").draw();
  }

  updateChart(generations, population) {
    this.dataset.append({
      x: generations,
      value: population,
    });
  }
}
