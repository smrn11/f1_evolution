const path = document.getElementById("trackPath");
const car = document.getElementById("car");

const pathLength = path.getTotalLength();
const carWidth = 160;
const carHeight = 80;

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;

  const currentLength = scrollPercent * pathLength;
  const point = path.getPointAtLength(currentLength);
  const nextPoint = path.getPointAtLength(Math.min(currentLength + 1, pathLength));

  const dx = nextPoint.x - point.x;
  const dy = nextPoint.y - point.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI + 180;

  const transform = `
    translate(${point.x}, ${point.y})
    rotate(${angle})
    scale(1, -1)
    translate(${-carWidth / 2}, ${-carHeight / 2})
  `;

  car.setAttribute("transform", transform);
});
