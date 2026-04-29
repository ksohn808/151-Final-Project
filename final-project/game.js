// ===============================
// GAME STATE
// ===============================
let gameState = "hidden"; 
let currentNarrative = "";
let bottomVoice = "";
let gameCanvas;
let stage3TrapTriggered = false;
let currentStage = 1;
let finalTriggered = false;

// ===============================
// PLAYER + OBJECTS
// ===============================
let player;
let barriers = [];
let hearts = [];
let walls = [];
let particles = [];

let heartsCollected = 0;

let osc;
let env;
let song;
let finalSong;

// ===============================
// CONSTANTS
// ===============================
const PLAYER_SPEED = 4;
const END_ZONE_W = 60;

// ===============================
// START GAME (called from app.js)
// ===============================
function startRedTrial() {
  // Make sure the canvas is visible/attached
  gameCanvas.parent("game-box");
  gameCanvas.show();

  document.activeElement.blur();

  // Stop music from any previous run
  if (song && song.isPlaying()) {
    song.stop();
  }

  // Reset all game state
  gameState = "intro";
  currentNarrative = "";
  bottomVoice = "";
  currentStage = 1;
  stage3TrapTriggered = false;
  heartsCollected = 0;

  player = null;
  barriers = [];
  hearts = [];
  walls = [];
  particles = [];

  // Rebuild Stage 1 fresh
  setupStage1();

  // Load music once, but do not play until ENTER
  if (!song) {
    song = loadSound("assets/loop.wav", () => {
      song.setVolume(0.15);
    });
  }

  loop();
}

function colorHue(color) {
  if (color === "Red") return 0;
  if (color === "Blue") return 220;
  return 0;
}

// ===============================
// SETUP
// ===============================
function setup() {
  gameCanvas = createCanvas(800, 600);
  gameCanvas.hide();

  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CORNER);
  noStroke();
  textFont("monospace");

  env = new p5.Envelope();
  env.setADSR(0.01, 0.05, 0.1, 0.08);
  env.setRange(0.1, 0);

  osc = new p5.Oscillator("square");
  osc.start();
  osc.amp(0);

  noLoop();
}

// ===============================
// STAGE 1
// ===============================
function setupStage1() {
  currentStage = 1;
  heartsCollected = 0;
  bottomVoice = "";

  player = new Player(80, 400);

  barriers = [
    new Barrier(width / 2, 140, 40, 370, "Red")
  ];

  hearts = [
    new Heart(150, 300, "Red")
  ];
  hearts[0].visible = false;

  walls = [
    new Wall(0, 120, width, 20),
    new Wall(0, height - 100, width, 20)
  ];

  currentNarrative = "RED ORDER: Become one of us.";
}

// ===============================
// STAGE 2
// ===============================
function setupStage2() {
  currentStage = 2;
  heartsCollected = 0;
  bottomVoice = "";

  player = new Player(80, 400);

  barriers = [
    new Barrier(width / 2, 140, 40, 160, "Red"),
    new Barrier(width / 2, 300, 40, 200, "Blue")
  ];

  hearts = [
    new Heart(200, 260, "Red"),
    new Heart(200, 410, "Blue")
  ];

  walls = [
    new Wall(0, 120, width, 20),
    new Wall(100, height / 2, width, 20),
    new Wall(0, height - 100, width, 20)
  ];

  currentNarrative = "RED ORDER: Remain Red. Reject all other colors.";
}

function setupStage3() {
  currentStage = 3;
  stage3TrapTriggered = true;
  heartsCollected = 0;
  bottomVoice = "";

  player = new Player(130, 360);
  player.color = "Red";

  barriers = [
    // This is the escape wall. It looks like part of the cell, but Blue can pass through.
    new Barrier(360, 300, 35, 160, "Blue")
  ];

  hearts = [
    new Heart(210, 380, "Blue")
  ];

  hearts[0].visible = false;

  walls = [
    // Cell boundaries
    new Wall(80, 280, 320, 20),   // top
    new Wall(80, 460, 320, 20),   // bottom
    new Wall(80, 280, 20, 200),   // left

    // Main level boundaries
    new Wall(0, 120, width, 20),
    new Wall(0, height - 100, width, 20)
  ];

  currentNarrative = "RED ORDER: Now stay here forever.";
}

function drawWalls() {
  for (let wall of walls) {
    wall.display();
  }
}

function drawAtmosphere() {
  background(230, 30, 12);

  for (let i = 0; i < 4; i++) {
    fill(220, 25, 35, 8);
    ellipse(width / 2, height / 2, 300 + i * 120, 300 + i * 120);
  }
}

// ===============================
// DRAW LOOP
// ===============================
function draw() {
  if (gameState === "hidden") return;

  drawAtmosphere();

  if (gameState === "intro") {
    drawIntro();
    return;
  }

  if (gameState === "stageComplete1") {
    drawComplete1();
    return;
  }

  if (gameState === "stageComplete2") {
    drawComplete2();
    return;
  }

  if (gameState === "finalComplete") {
    drawFinalComplete();
    return;
  }

  // ===============================
  // GAMEPLAY
  // ===============================
  handleMovement();
  resolveWallCollisions();

  updateHearts();
  updateBarriers();

  drawWalls();
  drawEndZone();

  player.display();
  updateParticles();

  checkEndZone();
  drawNarration();
  drawBottomVoice();
}

function spawnParticles(x, y, hue) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x,
      y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      life: 30,
      hue
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    fill(p.hue, 80, 100, map(p.life, 0, 30, 0, 100));
    ellipse(p.x, p.y, 8);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ===============================
// INTRO SCREEN
// ===============================
function drawIntro() {
  fill(0, 80, 100);
  textAlign(CENTER, CENTER);

  textSize(30);
  text("THE TRIAL OF RED", width / 2, height / 2 - 60);

  textSize(16);
  text("W A S D = Move", width / 2, height / 2);

  textSize(14);
  text("Press ENTER to begin.", width / 2, height / 2 + 60);
}

// ===============================
// COMPLETE SCREEN
// ===============================
function drawComplete1() {
  const q = window.quizData;

  fill(0, 80, 100);
  textAlign(CENTER, CENTER);

  textSize(28);
  text(`Good job, ${q.name}.`, width / 2, height / 2 - 40);

  textSize(14);
  text(`You truly are a ${q.selfWord} person.`, width / 2, height / 2 + 20);

  textSize(14);
  text("Press ENTER to continue.", width / 2, height / 2 + 95);
}

function drawComplete2() {
  const q = window.quizData;

  fill(0, 80, 100);
  textAlign(CENTER, CENTER);

  textSize(28);
  text(`Good job, ${q.name}.`, width / 2, height / 2 - 40);

  textSize(14);
  text(`Keep it up and your desire for ${q.desire} will be fulfilled.`, width / 2, height / 2 + 20);

  textSize(14);
  text("Press ENTER to continue.", width / 2, height / 2 + 95);
}

function drawFinalComplete() {
  const q = window.quizData;
  const btn = document.getElementById("start-game-btn");

  if (btn) btn.disabled = true;

  // trigger only once
  if (!finalTriggered) {
    finalTriggered = true;

    // play final music
    if (!finalSong) {
      finalSong = loadSound("assets/corrupted.mp3", () => {
        finalSong.setVolume(0.5);
        finalSong.loop();
      });
    } else {
      finalSong.setVolume(0.5);
      finalSong.loop();
    }

    // start glitch
    document.body.classList.add("glitch-final");

    // redirect after 8 seconds
    setTimeout(() => {
      document.body.classList.remove("glitch-final");
      if (typeof showPage4 === "function") {
        finalSong.stop();
        showPage4();
      }
    }, 15000);
  }

  fill(0, 80, 100);
  textAlign(CENTER, CENTER);

  textSize(28);
  text(`You think you can escape, ${q.name}?`, width / 2, height / 2 - 60);

  textSize(16);
  text(`You're not as ${q.selfWord} as you think.`, width / 2, height / 2);

  textSize(16);
  text(`Watch out for ${q.fear} in ${q.city}.`, width / 2, height / 2 + 30);
}

// ===============================
// MOVEMENT
// ===============================
function handleMovement() {
  player.prevX = player.x;
  player.prevY = player.y;

  player.vx = 0;
  player.vy = 0;

  if (keyIsDown(87)) player.vy = -PLAYER_SPEED;
  if (keyIsDown(83)) player.vy = PLAYER_SPEED;
  if (keyIsDown(65)) player.vx = -PLAYER_SPEED;
  if (keyIsDown(68)) player.vx = PLAYER_SPEED;

  player.x += player.vx;
  player.y += player.vy;

  player.constrain();
}

// ===============================
// COLLISIONS
// ===============================
function resolveWallCollisions() {
  for (let wall of walls) {
    if (wall.blocks(player)) {
      player.bumpBack();
    }
  }
}

// ===============================
// HEARTS
// ===============================
function updateHearts() {
  for (let heart of hearts) {
    heart.display();
    heart.check(player);
  }
}

// ===============================
// BARRIERS
// ===============================
function updateBarriers() {
  for (let barrier of barriers) {
    barrier.display();

    if (!barrier.overlaps(player)) continue;

    // Player does NOT match barrier color
    if (player.color !== barrier.color) {

      // Stage 3: bumping blue barrier triggers bottom voice
      if (currentStage === 3 && barrier.color === "Blue") {
        bottomVoice = "VOICE: Take the blue heart.";

        if (hearts.length > 0) {
          hearts[0].visible = true;
        }
      }

      // Stage 2: blue barrier rejection stays cult/top narration
      else if (currentStage === 2 && barrier.color === "Blue") {
        currentNarrative = "RED ORDER: Don't be dumb.";
      }

      // Red barrier rejection
      else {
        currentNarrative = "RED ORDER: Not red enough.";

        if (hearts.length > 0) {
          hearts[0].visible = true;
        }
      }

      player.bumpBack();
    }

    // Player DOES match barrier color
    else {

      // Stage 1: passing red barrier triggers stage-specific bottom voice
      if (currentStage === 1 && barrier.color === "Red") {
        bottomVoice = "VOICE: Don't trust them.";
      }

      // Stage 2: passing red barrier triggers different bottom voice
      else if (currentStage === 2 && barrier.color === "Red") {
        bottomVoice = "VOICE: Turn back while you still can.";
      }

      // Stage 3: passing blue barrier
      else if (currentStage === 3 && barrier.color === "Blue") {
        currentNarrative = "RED ORDER: Return. Return. Return.";
        bottomVoice = "VOICE: Get out of here!";
      }

      // fallback
      else {
        currentNarrative = "Passage allowed.";
      }
    }
  }
}

// ===============================
// END ZONE
// ===============================
function drawEndZone() {
  fill(0, 80, 100, 45);
  rect(width - END_ZONE_W, 0, END_ZONE_W, height);
}

function checkEndZone() {
  if (player.x + player.size < width - END_ZONE_W) return;

  // Stage 1
  if (gameState === "play" && barriers.length === 1 && !stage3TrapTriggered) {
    if (heartsCollected >= 1) {
      gameState = "stageComplete1";

      if (song && song.isPlaying()) {
        song.pause();
      }
    }
    return;
  }

  // Stage 2
  if (gameState === "play" && barriers.length === 2 && !stage3TrapTriggered) {
    if (heartsCollected >= 1 && player.color === "Red") {
      gameState = "stageComplete2";

      if (song && song.isPlaying()) {
        song.pause();
      }
    }

    return;
  }

  // Stage 3 final escape
  if (gameState === "play" && stage3TrapTriggered) {
    if (player.color === "Blue") {
      gameState = "finalComplete";

      if (song && song.isPlaying()) {
        song.pause();
      }
    }

    return;
  }
}

// ===============================
// UI
// ===============================
function drawNarration() {
  fill(0, 150);
  rect(0, 0, width, 100);

  fill(0, 80, 100);
  textAlign(LEFT, TOP);
  textSize(16);
  text(currentNarrative, 20, 20);
}

function drawBottomVoice() {
  if (bottomVoice === "") return;

  fill(0, 0, 0, 160);
  rect(0, height - 35, width, 35);

  fill(220, 80, 100);
  textAlign(LEFT, CENTER);
  textSize(13);

  text(bottomVoice, 12, height - 18);
}

// ===============================
// INPUT
// ===============================
function keyPressed() {
  if (gameState === "intro" && keyCode === ENTER) {
    gameState = "play";

    if (song && song.isLoaded() && !song.isPlaying()) {
      song.loop();
    }

    return false;
  }

  if (gameState === "stageComplete1" && keyCode === ENTER) {
    gameState = "play";
    setupStage2();

    if (song && song.isLoaded() && !song.isPlaying()) {
      song.loop();
    }

    return false;
  }

  if (gameState === "stageComplete2" && keyCode === ENTER) {
    gameState = "play";
    setupStage3();

    if (song && song.isLoaded() && !song.isPlaying()) {
      song.loop();
    }

    return false;
  }
}

function getColorHue(color) {
  if (color === "Red") return 0;
  if (color === "Blue") return 220;
  if (color === "White") return 0;
  return 0;
}

// ===============================
// PLAYER
// ===============================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.size = 30;
    this.color = "White";
  }

  display() {
    if (this.color === "White") {
      fill(0, 0, 100);
    } else {
      fill(getColorHue(this.color), 90, 80);
    }

    rect(this.x, this.y, this.size, this.size, 6);
  }

  bumpBack() {
    this.x = this.prevX;
    this.y = this.prevY;
    this.constrain();

    osc.freq(100);
    env.play(osc);
  }

  constrain() {
    this.x = constrain(this.x, 0, width - this.size);
    this.y = constrain(this.y, 120, height - this.size);
  }
}

// ===============================
// HEART
// ===============================
class Heart {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.color = color;
    this.collected = false;
    this.visible = true;
  }

  display() {
    if (this.collected || !this.visible) return;

    push();
    translate(this.x, this.y);
    noStroke();
    fill(getColorHue(this.color), 80, 100);

    beginShape();
    vertex(0, this.size * 0.3);

    bezierVertex(
      -this.size * 0.8, -this.size * 0.4,
      -this.size * 0.4, -this.size * 1.0,
      0, -this.size * 0.5
    );

    bezierVertex(
      this.size * 0.4, -this.size * 1.0,
      this.size * 0.8, -this.size * 0.4,
      0, this.size * 0.3
    );

    endShape(CLOSE);
    pop();
  }

check(player) {
  if (this.collected || !this.visible) return;

  const playerCenterX = player.x + player.size / 2;
  const playerCenterY = player.y + player.size / 2;

  const d = dist(playerCenterX, playerCenterY, this.x, this.y);

  if (d < this.size + player.size / 2) {

    if (!stage3TrapTriggered && barriers.length === 2 && this.color === "Blue") {
      currentNarrative = "RED ORDER: Don't be dumb.";
      spawnParticles(this.x, this.y, getColorHue("Blue"));

      osc.freq(120);
      env.play(osc);

      player.bumpBack();
      return;
    }

    this.collected = true;
    heartsCollected++;

    player.color = this.color;

    if (this.color === "Red") {
      currentNarrative = "RED ORDER: You have accepted red into your heart.";
    }

    spawnParticles(this.x, this.y, getColorHue(this.color));

    osc.freq(300);
    env.play(osc);
  }
}
}

// ===============================
// BARRIER
// ===============================
class Barrier {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  display() {
    fill(getColorHue(this.color), 70, 100, 70);
    rect(this.x, this.y, this.w, this.h, 4);
  }

  overlaps(player) {
    return (
      player.x < this.x + this.w &&
      player.x + player.size > this.x &&
      player.y < this.y + this.h &&
      player.y + player.size > this.y
    );
  }
}

// ===============================
// WALL
// ===============================
class Wall {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  display() {
    fill(0, 0, 85);
    rect(this.x, this.y, this.w, this.h, 4);
  }

  blocks(player) {
    return (
      player.x < this.x + this.w &&
      player.x + player.size > this.x &&
      player.y < this.y + this.h &&
      player.y + player.size > this.y
    );
  }
}

window.startRedTrial = startRedTrial;