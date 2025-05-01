// barChartRace.js 

d3.csv("F1_Constructors_Champions__1958-2024_.csv").then(function(data) {
    // 1. Parse & trim data
    data.forEach(d => {
      d.year        = +d.year;
      d.constructor = d.constructor.trim();
    });
  
    const startYear    = d3.min(data, d => d.year);
    const endYear      = d3.max(data, d => d.year);
    const years        = d3.range(startYear, endYear + 1);
    const constructors = Array.from(new Set(data.map(d => d.constructor)));
  
    // 2. Theme colors
    const colorMap = {
      Ferrari:    "#DC0000",
      McLaren:    "#FF8700",
      Mercedes:   "#00D2BE",
      "Red Bull": "#1E41FF",
      Williams:   "#005AFF",
      Lotus:      "#004225",
      Renault:    "#FFF500",
      Brabham:    "#FF9800",
      Cooper:     "#99CCFF",
      BrawnGP:    "#FFFFFF"
    };
    const defaultColor = "#888";
  
    // 3. Cumulative counts by year
    const titleCountByYear = {}, cum = {};
    constructors.forEach(c => cum[c] = 0);
    const champByYear = {};
    data.forEach(d => champByYear[d.year] = d.constructor);
    years.forEach(year => {
      const w = champByYear[year];
      if (w) cum[w]++;
      titleCountByYear[year] = { ...cum };
    });
  
    // 4. Build keyframes every 5 years + final
    const step      = 5;
    const intervals = years.filter(y => (y - startYear) % step === 0);
    if (!intervals.includes(endYear)) intervals.push(endYear);
    const dateValues = intervals.map(y => [
      new Date(y,0,1),
      new Map(constructors.map(c => [c, titleCountByYear[y][c]||0]))
    ]);
  
    function rank(getVal) {
      return constructors
        .map(name => ({ name, value: getVal(name) }))
        .sort((a,b) => d3.descending(a.value,b.value))
        .map((d,i) => ((d.rank=i), d));
    }
  
    const keyframes = [];
    const k = 10;
    for (const [[d0,m0],[d1,m1]] of d3.pairs(dateValues)) {
      const span = d1.getFullYear() - d0.getFullYear();
      for (let i=0; i<k; ++i) {
        const t = i/k;
        keyframes.push([
          new Date(d0.getFullYear() + span*t,0,1),
          rank(name => m0.get(name) + (m1.get(name)-m0.get(name))*t)
        ]);
      }
    }
    keyframes.push([
      dateValues[dateValues.length-1][0],
      rank(name => dateValues[dateValues.length-1][1].get(name))
    ]);
  
    // 5. Dimensions & scales 
    const margin = { top: 60, right:130, bottom:40, left:140 },
          width  = 900,
          barH   = 50,
          n      = Math.min(constructors.length, 8),
          height = margin.top + barH * n + margin.bottom;
  
    const x = d3.scaleLinear()
      .domain([0,20])
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleBand()
      .domain(d3.range(n))
      .range([margin.top, margin.top + barH * n])
      .padding(0.1);
  
    // 6. Icon sizing
    const iconScale  = 1.2,
          iconHeight = iconScale * y.bandwidth(),
          iconWidth  = iconHeight * (202/414);
  
    // 7. SVG container
    const svg = d3.select("#barChartRace").append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("overflow", "visible");  // allow axis labels to show
  
    // 8. Top axis + styling
    const axisG = svg.append("g")
      .attr("transform", `translate(0,${margin.top - 5})`)
      .call(d3.axisTop(x)
        .ticks(5)
        .tickSize(8)     // slightly shorter ticks
        .tickPadding(4)  // numbers closer to axis line
      );
  
    axisG.selectAll("line")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
  
    axisG.selectAll("text")
      .style("fill", "#fff")
      .style("font-size", "14px")  // smaller tick labels
      .style("font-weight", "bold");
  
    // 9. X-axis title (tighter to axis)
    axisG.append("text")
      .attr("class", "axis-label")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", 0)
      .attr("dy", "-2.5em")           // 1em above axis line
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "12px")
      .text("Title Wins");
  
    // 10. Y-axis title (closer to axis)
    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", - (height - margin.top - margin.bottom) / 2)
      .attr("y", 80)               // 10px from left edge
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "12px")
      .text("Constructor");
  
    // 11. Finish line (dotted)
    const finishX = x(20) - 1;
    svg.append("rect")
      .attr("x", finishX).attr("y", margin.top - 5)
      .attr("width", 2)
      .attr("height", height - margin.top - margin.bottom + 10)
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  
    let prevFrame = null;
  
    // 12. Draw bars
    function bars([, data], t) {
      const prevMap = prevFrame
        ? new Map(prevFrame[1].map(d => [d.name, d]))
        : new Map();
  
      svg.selectAll("rect.bar")
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("rect")
            .attr("class", "bar")
            .attr("fill", d => colorMap[d.name] || defaultColor)
            .attr("x", x(0))
            .attr("y", d => {
              const r = prevMap.get(d.name)?.rank ?? d.rank;
              return y(r);
            })
            .attr("height", y.bandwidth())
            .attr("width", d => {
              const v = prevMap.get(d.name)?.value ?? d.value;
              return x(v) - x(0);
            }),
          update => update.attr("fill", d => colorMap[d.name] || defaultColor),
          exit => exit.transition(t)
            .attr("y", height - margin.bottom)
            .remove()
        )
        .transition(t)
          .attr("y", d => y(d.rank))
          .attr("width", d => x(d.value) - x(0));
    }
  
    // 13. Draw labels
    function labels([, data], t) {
      const filtered = data.slice(0, n).filter(d => d.value >= 1);
  
      svg.selectAll("text.label")
        .data(filtered, d => d.name)
        .join(
          enter => enter.append("text")
            .attr("class", "label")
            .attr("text-anchor", "end")
            .attr("fill", "#fff")
            .attr("font-weight", "bold")
            .attr("x", d => x(d.value) - iconWidth - 8)  // 2px closer
            .attr("y", d => y(d.rank) + y.bandwidth()/2)
            .attr("dy", "0.35em")
            .style("font-size","12px")
            .text(d => d.name),
          update => update,
          exit => exit.transition(t)
            .attr("y", height - margin.bottom)
            .remove()
        )
        .transition(t)
          .attr("x", d => x(d.value) - iconWidth - 8)
          .attr("y", d => y(d.rank) + y.bandwidth()/2);
    }
  
    // 14. Draw icons
    function images([, data], t) {
      const filtered = data.slice(0, n).filter(d => d.value >= 1);
  
      const groups = svg.selectAll("g.icon-group")
        .data(filtered, d => d.name)
        .join(
          enter => {
            const g = enter.append("g")
              .attr("class", "icon-group")
              .attr("transform", d =>
                `translate(${x(d.value)},${y(d.rank) + y.bandwidth()/2})`
              );
            g.append("image")
              .attr("class", "icon")
              .attr("x", -iconWidth/2)
              .attr("y", -iconHeight/2)
              .attr("width", iconWidth)
              .attr("height", iconHeight)
              .attr("transform", "rotate(90)")
              .attr("xlink:href", "f1-car-svgrepo-com.jpg");
            return g;
          },
          update => update,
          exit => exit.remove()
        );
  
      groups.transition(t)
        .attr("transform", d =>
          `translate(${x(d.value)},${y(d.rank) + y.bandwidth()/2})`
        );
    }
  
    // 15. Draw values
    function values([, data], t) {
      const filtered = data.slice(0, n).filter(d => d.value >= 1);
  
      svg.selectAll("text.value")
        .data(filtered, d => d.name)
        .join(
          enter => enter.append("text")
            .attr("class", "value")
            .attr("text-anchor", "start")
            .attr("fill", "#fff")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("x", d => x(d.value) + iconWidth + 5)
            .attr("y", d => y(d.rank) + y.bandwidth()/2)
            .attr("dy", "0.35em")
            .text(d => Math.round(d.value)),
          update => update,
          exit => exit.transition(t)
            .attr("y", height - margin.bottom)
            .remove()
        )
        .transition(t)
          .attr("x", d => x(d.value) + iconWidth + 5)
          .attr("y", d => y(d.rank) + y.bandwidth()/2)
          .text(d => Math.round(d.value));
    }
  
    // 16. Year ticker
    function ticker([date], t) {
      svg.selectAll("text.ticker")
        .data([date])
        .join(
          enter => enter.append("text")
            .attr("class", "ticker")
            .attr("x", width - 12)
            .attr("y", height - 12)
            .attr("text-anchor", "end")
            .attr("font-size", "30px")
            .attr("fill", "#ff4444"),
          update => update
        )
        .transition(t)
          .text(d3.timeFormat("%Y")(date));
    }
  
    // 17. Animation loop (faster)
    (async function run() {
      for (const frame of keyframes) {
        const t = svg.transition().duration(50).ease(d3.easeLinear);
        bars(frame, t);
        labels(frame, t);
        images(frame, t);
        values(frame, t);
        ticker(frame, t);
        prevFrame = frame;
        await t.end();
      }
    })();
  
  });
  