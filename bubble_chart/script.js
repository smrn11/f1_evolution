document.addEventListener("DOMContentLoaded", () => {
  drawBubbleChart();
});

function drawBubbleChart() {
  // Create tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("opacity", 0);

  d3.csv("driver_race_wins.csv").then(data => {
    // Group by driver name
    const winsByDriver = d3.rollup(data,
      v => v.length,
      d => d.forename + " " + d.surname
    );

    const formattedData = Array.from(winsByDriver, ([name, wins]) => ({ name, wins }));

    const root = d3.pack()
      .size([800, 800])
      .padding(5)
      (d3.hierarchy({ children: formattedData }).sum(d => d.wins));

    const svg = d3.select("#bubble-chart").append("svg")
      .attr("viewBox", [0, 0, 800, 800])
      .attr("width", 800)
      .attr("height", 800)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const node = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", `translate(400, 400)`); // Start from center

    // Animate group positions
    node.transition()
      .duration(1000)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Draw and animate bubbles
    node.append("circle")
      .attr("r", 0)
      .attr("fill", d => color(d.data.name))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.data.name}</strong><br/>
          🏁 Wins: ${d.data.wins}
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("r", d => d.r);

    // Animate text fade-in
    node.append("text")
      .attr("dy", "0.3em")
      .style("opacity", 0)
      .text(d => d.data.name)
      .style("text-anchor", "middle")
      .style("font-size", d => Math.min(2 * d.r / d.data.name.length, 14))
      .style("fill", "white")
      .style("pointer-events", "none")
      .transition()
      .delay(800)
      .duration(600)
      .style("opacity", 1);
  }).catch(e => console.error("Error loading driver_race_wins.csv:", e));
}
