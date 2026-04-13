function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(220);
  orbitControl();
  box(100);
}