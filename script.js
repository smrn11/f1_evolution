/*********************************************************
 * 1.  CAR ICON THAT FOLLOWS THE SCROLLING TRACK
 *********************************************************/
const path = document.getElementById("trackPath");
const car  = document.getElementById("car");

const pathLen   = path.getTotalLength();
const carW      = 160;
const carH      =  80;

window.addEventListener("scroll", () => {
  const pct = window.scrollY / (document.body.scrollHeight - innerHeight);
  const len = pct * pathLen;

  const pt      = path.getPointAtLength(len);
  const nextPt  = path.getPointAtLength(Math.min(len + 1, pathLen));
  const angle   = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * 180/Math.PI + 180;

  car.setAttribute("transform",
    `translate(${pt.x},${pt.y}) rotate(${angle}) scale(1,-1) translate(${-carW/2},${-carH/2})`);
});


/*********************************************************
 * 2.  SPEED‑COMPARISON BAR CHART (first checkpoint demo)
 *********************************************************/
function drawSpeedChart() {
  const data = [
    { vehicle:"F1 Car",     speed:360 },
    { vehicle:"Superbike",  speed:350 },
    { vehicle:"Sports Car", speed:330 },
    { vehicle:"MotoGP",     speed:320 },
    { vehicle:"Road Car",   speed:220 }
  ];
  const m = {top:10,right:20,bottom:40,left:140},
        w = 600 - m.left - m.right,
        h = 320 - m.top  - m.bottom;

  const svg = d3.select("#speed-chart").append("svg")
      .attr("width", w+m.left+m.right).attr("height",h+m.top+m.bottom)
    .append("g").attr("transform",`translate(${m.left},${m.top})`);

  const y = d3.scaleBand().domain(data.map(d=>d.vehicle)).range([0,h]).padding(0.15);
  const x = d3.scaleLinear().domain([0,d3.max(data,d=>d.speed)]).nice().range([0,w]);

  svg.selectAll(".bar").data(data).enter().append("rect")
      .attr("class","bar").attr("y",d=>y(d.vehicle)).attr("height",y.bandwidth())
      .attr("x",0).attr("width",0)
    .transition().duration(800).attr("width",d=>x(d.speed));

  svg.append("g").attr("class","axis").call(d3.axisLeft(y));
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
     .call(d3.axisBottom(x).ticks(5).tickFormat(d=>d+" km/h"));
}


/*********************************************************
 * 3.  ANATOMY OF AN F1 CAR (hoverable tool‑tips)
 *********************************************************/
function drawCarAnatomy() {
  const container = d3.select("#car-anatomy");
  const svg = container.append("svg").attr("viewBox","0 0 1000 400");

  /*  Simple top‑down shapes  */
  svg.append("rect") /* front wing */ .attr("class","car-part")
     .attr("x",80).attr("y",175).attr("width",200).attr("height",50)
     .attr("data-tooltip","Front Wing – produces front‑end downforce and channels airflow.");

  svg.append("rect") /* nose */ .attr("class","car-part")
     .attr("x",280).attr("y",185).attr("width",80).attr("height",30)
     .attr("data-tooltip","Nose Cone – links front wing to chassis; absorbs frontal impacts.");

  svg.append("circle") /* FL tyre */ .attr("class","car-part")
     .attr("cx",350).attr("cy",110).attr("r",55)
     .attr("data-tooltip","Front Left Tyre – soft rubber compounds heat quickly for grip.");
  svg.append("circle") /* FR tyre */ .attr("class","car-part")
     .attr("cx",350).attr("cy",290).attr("r",55)
     .attr("data-tooltip","Front Right Tyre – identical compound; tyres are the only contact with track.");

  svg.append("rect") /* cockpit */ .attr("class","car-part")
     .attr("x",430).attr("y",140).attr("width",160).attr("height",120)
     .attr("data-tooltip","Cockpit & Halo – protects driver; halo saved multiple lives since 2018.");

  svg.append("rect") /* sidepods */ .attr("class","car-part")
     .attr("x",600).attr("y",165).attr("width",120).attr("height",70)
     .attr("data-tooltip","Sidepods – house radiators; shape directs cooling airflow.");

  svg.append("rect") /* power unit */ .attr("class","car-part")
     .attr("x",720).attr("y",155).attr("width",80).attr("height",90)
     .attr("data-tooltip","Power Unit – 1.6 L turbo‑hybrid V6 plus MGU‑H/K electric motors.");

  svg.append("rect") /* rear wing */ .attr("class","car-part")
     .attr("x",800).attr("y",175).attr("width",180).attr("height",50)
     .attr("data-tooltip","Rear Wing – major source of downforce; DRS flap reduces drag on straights.");

  svg.append("circle") /* RL tyre */ .attr("class","car-part")
     .attr("cx",820).attr("cy",110).attr("r",55)
     .attr("data-tooltip","Rear Left Tyre – larger workload during acceleration.");
  svg.append("circle") /* RR tyre */ .attr("class","car-part")
     .attr("cx",820).attr("cy",290).attr("r",55)
     .attr("data-tooltip","Rear Right Tyre – temperature balance critical for traction.");

  /*  Tooltip element  */
  const tt = container.append("div").attr("id","tooltip");

  svg.selectAll(".car-part")
     .on("mousemove", function (event) {
       tt.text(this.dataset.tooltip)
         .style("left", (event.offsetX + 18) + "px")
         .style("top",  (event.offsetY + 18) + "px")
         .style("display","block");
     })
     .on("mouseleave", () => tt.style("display","none"));
}


/*********************************************************
 * 4.  OBSERVERS – fade‑in & one‑time rendering
 *********************************************************/
const fadeIn = (entry) => {
  entry.target.classList.remove("hidden");
  entry.target.classList.add("visible");
};

/* Speed‑chart observer (first viz) */
new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !e.target.dataset.rendered){
      fadeIn(e); drawSpeedChart(); e.target.dataset.rendered="true";
    }
  });
},{threshold:.4}).observe(document.getElementById("speed-chart"));

/* Anatomy‑car observer (second viz) */
new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !e.target.dataset.rendered){
      fadeIn(e); drawCarAnatomy(); e.target.dataset.rendered="true";
    }
  });
},{threshold:.4}).observe(document.getElementById("car-anatomy"));
