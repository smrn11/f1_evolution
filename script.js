const path = document.getElementById("trackPath");
const car = document.getElementById("car");

const pathLength = path.getTotalLength();

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  // Normalize scroll value
  const scrollPercent = scrollTop / docHeight;

  // Get point on the path
  const point = path.getPointAtLength(scrollPercent * pathLength);
  car.setAttribute("cx", point.x);
  car.setAttribute("cy", point.y);
});
