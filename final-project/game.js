// ---------- Canvas / layout ----------
const CANVAS_W = 1000;
const CANVAS_H = 650;
const NARRATION_HEIGHT = 110;
const END_ZONE_W = 60;

// ---------- Movement / gameplay ----------
const PLAYER_SPEED = 4;
const TOTAL_HEARTS_GOAL = 7;

// ---------- Audio ----------
let song;
let osc;
let env;

// ---------- Main game objects ----------
let player;
let barriers = [];
let particles = [];
let walls = [];
let hearts = [];
let unlockedColors = [];

// ---------- Game state ----------
let bgHue = 220;
let heartsCollected = 0;
let currentLevel = 0;
let gameState = "intro"; // intro, play

// ---------- Narrative text ----------
let currentNarrative = "You are Red.";

let blockedOnce = false;

// =====================================================
// MAIN SKETCH
// p5 lifecycle, input handling, update loop, and gameplay flow
// =====================================================

// ---------- Load assets ----------
function preload() {
  song = loadSound("assets/loop.wav");
}

// ---------- Initial setup ----------
function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CORNER);
  noStroke();
  textFont("monospace");

  setupAudio();
  setupLevel1();
}

// ---------- Audio setup ----------
function setupAudio() {
  env = new p5.Envelope();
  env.setADSR(0.02, 0.2, 0.15, 0.4);
  env.setRange(1, 0);

  osc = new p5.Oscillator("square");
  osc.start();
  osc.amp(env);
  outputVolume(0.2);
}

// ---------- Main draw loop ----------
function draw() {
  if (gameState === "intro") {
    drawIntroScreen();
    return;
  }

  if (gameState === "win") {
    drawWinScreen();
    return;
  }
  
  // Level 1: reveal first heart after moving right
  if (currentLevel === 1 && hearts.length > 0 && player.x > 465) {
    hearts[0].visible = true;
  }

  drawAtmosphere(bass, treble);

  handleMovement();

  resolveWallCollisions();

  updateHearts();
  updateBarriers();
  drawEndZone();
  drawWalls();

  player.display();
  updateParticles();

  checkEndZone();
  drawBottomUI();
}

// ---------- Movement from keyboard ----------
function handleMovement() {
  player.vx = 0;
  player.vy = 0;

  if (keyIsDown(87)) player.vy = -PLAYER_SPEED; // W
  if (keyIsDown(83)) player.vy = PLAYER_SPEED;  // S
  if (keyIsDown(65)) player.vx = -PLAYER_SPEED; // A
  if (keyIsDown(68)) player.vx = PLAYER_SPEED;  // D

  player.x += player.vx;
  player.y += player.vy;

  player.constrainToPlayableArea();
}

// ---------- Check collision against walls ----------
function resolveWallCollisions() {
  for (const wall of walls) {
    if (wall.blocks(player)) {
      player.bumpOutOfWall(wall);
    }
  }
}

// ---------- Update/draw hearts ----------
function updateHearts() {
  for (const heart of hearts) {
    //heart.update();
    heart.display();
    heart.checkCollision(player);
  }
}

// ---------- Update/draw barriers and handle barrier narrative ----------
function updateBarriers(bass, treble) {
  for (const barrier of barriers) {
    barrier.reactToAudio(bass, treble);
    barrier.display();

    if (!barrier.overlaps(player)) continue;

    const colorName = barrier.allowedColor;

    if (player.colorName == colorName) {
      currentNarrative = "That works.";
      spawnParticles(player.x + player.size / 2, player.y + player.size / 2, barrier.baseHue);
    } else {
      currentNarrative = `Not ${colorName} enough.`;
      player.bumpBack();
      spawnParticles(player.x + player.size / 2, player.y + player.size / 2, barrier.baseHue);
    }
  }
}

// ---------- Draw walls ----------
function drawWalls() {
  for (const wall of walls) {
    wall.display();
  }
}

// ---------- Check whether player reached level exit ----------
function checkEndZone() {
  if (player.x + player.size <= width - END_ZONE_W) return;

  if (currentLevel == 1) {
    if (heartsCollected >= 1) {
      setupLevel2();
    } else {
      currentNarrative = "Not yet.";
      player.bumpBackHard();
    }
    return;
  }
  
  if (currentLevel == 2) {
    if (heartsCollected >= 3) {
      setupLevel3();
    } else {
      currentNarrative = "Not yet.";
      player.bumpBackHard();
    }
    return;
  }

  if (currentLevel == 3) {
    if (heartsCollected >= 6) {
      setupLevel4();
    } else {
      currentNarrative = "You still have more to learn.";
      player.bumpBackHard();
    }
    return;
  }

  if (currentLevel == 4) {
    if (heartsCollected >= TOTAL_HEARTS_GOAL) {
      gameState = "win";
      currentNarrative = "You are no longer one color.";
      if (song && song.isPlaying()) {
        song.stop();
      }
    } else {
      currentNarrative = "One last heart.";
      player.bumpBackHard();
    }
    return;
  }
}

// ---------- Keyboard events ----------
function keyPressed() {
  if (gameState === "intro" && (keyCode === ENTER || key === " ")) {
    gameState = "play";
    
    if (song && !song.isPlaying()) {
      song.loop();
    }
    return;
  }

  if (gameState === "win" && (keyCode === ENTER || key === " ")) {
    gameState = "play";
    setupLevel1();

    if (song && !song.isPlaying()) {
      song.loop();
    }
    return;
  }

  if (key === '2') {
    setupLevel2();
    return;
  }
  if (key === '3') {
    setupLevel3();
    return;
  }
  if (key === '4') {
    setupLevel4();
    return;
  }
}

// ---------- Convert a color name into an HSB hue ----------
function getHueFromColor(colorName) {
  const hueMap = {
    Red: 0,
    Orange: 30,
    Yellow: 55,
    Green: 120,
    Blue: 220,
    Indigo: 260,
    Violet: 290,
    Purple: 280
  };

  return hueMap[colorName];
}

// ---------- Simple AABB collision ----------
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax + aw > bx &&
    ax < bx + bw &&
    ay + ah > by &&
    ay < by + bh
  );
}

// ---------- Center point of the player square ----------
function getPlayerCenter(playerObj) {
  return {
    x: playerObj.x + playerObj.size / 2,
    y: playerObj.y + playerObj.size / 2
  };
}

// =====================================================
// PLAYER CLASS
// Handles player appearance, movement response, and bumping
// =====================================================

class Player {
  constructor(x, y) {
    // Position
    this.x = x;
    this.y = y;

    // Velocity from input
    this.vx = 0;
    this.vy = 0;

    // Appearance
    this.size = 30;
    this.colorName = "Red";
    this.hue = getHueFromColor("Red");
  }

  // ---------- Change the player's active color ----------
  setColor(name, hue = getHueFromColor(name)) {
    this.colorName = name;
    this.hue = hue;
  }

  // ---------- Draw the player ----------
  display() {
    let level = 0;

    if (typeof amp !== "undefined") {
      level = amp.getLevel();
    }

    fill(this.hue, 90, 80);
    rect(this.x, this.y, this.size, this.size, 6);
  }

  // ---------- Small bump opposite current movement ----------
  bumpBack() {
    this.applyBump(10);
  }

  // ---------- Stronger bump opposite current movement ----------
  bumpBackHard() {
    this.applyBump(15);
  }

  // ---------- Shared bump logic ----------
  applyBump(pushStrength) {
    this.x -= this.vx * pushStrength;
    this.y -= this.vy * pushStrength;

    this.constrainToPlayableArea();

    osc.freq(100);
    env.play();
  }

  // ---------- Keep player inside legal bounds ----------
  constrainToPlayableArea() {
    this.x = constrain(this.x, 0, width - this.size);
    this.y = constrain(this.y, 150, height - this.size);
  }

  // ---------- Push the player out of a wall based on smallest overlap ----------
  bumpOutOfWall(wall) {
    const playerLeft = this.x;
    const playerRight = this.x + this.size;
    const playerTop = this.y;
    const playerBottom = this.y + this.size;

    const wallLeft = wall.x;
    const wallRight = wall.x + wall.w;
    const wallTop = wall.y;
    const wallBottom = wall.y + wall.h;

    const overlapLeft = playerRight - wallLeft;
    const overlapRight = wallRight - playerLeft;
    const overlapTop = playerBottom - wallTop;
    const overlapBottom = wallBottom - playerTop;

    const minOverlap = min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) {
      this.x = wallLeft - this.size;
    } else if (minOverlap === overlapRight) {
      this.x = wallRight;
    } else if (minOverlap === overlapTop) {
      this.y = wallTop - this.size;
    } else if (minOverlap === overlapBottom) {
      this.y = wallBottom;
    }

    this.constrainToPlayableArea();
  }
}

// =====================================================
// HEART CLASS
// =====================================================

class Heart {
  constructor(x, y, colorName) {
    this.x = x;
    this.y = y;
    this.size = 22;

    this.colorName = colorName;
    this.hue = getHueFromColor(colorName);

    this.collected = false;
    this.visible = true;
  }

  // ---------- Draw heart shape ----------
  display() {
    if (this.collected || !this.visible) return;

    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.hue, 80, 100);

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

  // ---------- Handle player interaction ----------
  checkCollision(playerObj) {
    if (this.collected || !this.visible) return;

    const playerCenter = getPlayerCenter(playerObj);
    const d = dist(playerCenter.x, playerCenter.y, this.x, this.y);

    if (d >= this.size) return;

    if (d < this.size) {
      this.collected = true;
      heartsCollected++;
      unlockedColors.push(this.colorName);
      spawnParticles(this.x, this.y, this.hue);
      currentNarrative = `You learned ${this.colorName}.`
    }
  }
}

// =====================================================
// BARRIER CLASS
// =====================================================

class Barrier {
  constructor(x, y, w, h, allowedColor) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.allowedColor = allowedColor;

    this.baseHue = getHueFromColor(allowedColor);
    this.hue = this.baseHue;
    this.baseHeight = h;
  }

  // ---------- React visually to FFT values ----------
  reactToAudio(bass, treble) {
    this.hue = (this.baseHue + map(treble, 0, 255, -8, 8) + 360) % 360;
    this.h = this.baseHeight + map(bass, 0, 255, -18, 18);
  }

  // ---------- Draw barrier ----------
  display() {
    fill(this.hue, 70, 100, 70);
    rect(this.x, this.y, this.w, this.h, 4);
  }

  // ---------- Does this barrier physically block the player? ----------
  blocks(playerObj) {
    const hit = rectsOverlap(
      playerObj.x, playerObj.y, playerObj.size, playerObj.size,
      this.x, this.y, this.w, this.h
    );

    if (!hit) return false;

    return playerObj.colorName !== this.allowedColor;
  }

  // ---------- Does the player overlap this barrier at all? ----------
  overlaps(playerObj) {
    return rectsOverlap(
      playerObj.x, playerObj.y, playerObj.size, playerObj.size,
      this.x, this.y, this.w, this.h
    );
  }
}

// =====================================================
// WALL CLASS
// Static rectangular obstacles
// =====================================================

class Wall {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  // ---------- Draw wall ----------
  display() {
    fill(0, 0, 85);
    rect(this.x, this.y, this.w, this.h, 4);
  }

  // ---------- Check whether wall overlaps the player ----------
  blocks(playerObj) {
    return rectsOverlap(
      playerObj.x, playerObj.y, playerObj.size, playerObj.size,
      this.x, this.y, this.w, this.h
    );
  }
}

// =====================================================
// VISUAL EFFECTS + UI
// Particle effects, atmosphere, intro, and HUD
// =====================================================

// ---------- Spawn small particles for feedback ----------
function spawnParticles(x, y, hue) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      life: 30,
      hue: hue
    });
  }
}

// ---------- Update and draw particles ----------
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

// ---------- Intro screen ----------
function drawIntroScreen() {
  background(230, 30, 12);

  fill(0, 0, 100);
  textAlign(CENTER, CENTER);

  textSize(38);
  text("CODE RED", width / 2, height / 2 - 100);

  textSize(16);
  text("Controls", width / 2, height / 2 - 10);
  text("W A S D = move", width / 2, height / 2 + 25);

  textSize(14);
  text("Press ENTER or SPACE to begin.", width / 2, height / 2 + 165);
}

// ---------- Background + narration panel + end zone ----------
function drawAtmosphere(bass, treble) {
  noStroke();

  // Soft pulsing ellipses in background
  for (let i = 0; i < 4; i++) {
    fill(bgHue, 25, 35, 8);
    ellipse(width * 0.5, height * 0.5);
  }

  // Narration area
  fill(0, 0, 0, 20);
  rect(0, 0, width - 60, 110);

  fill(0, 0, 100);
  textAlign(LEFT, TOP);
  textSize(18);
  text(currentNarrative, 24, 24);
}

// ---------- Bottom HUD ----------
function drawBottomUI() {
  fill(0, 0, 0, 25);
  rect(0, height - 60, 150, 80);

  fill(0, 0, 100);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(`Stage: ${currentLevel}`, 20, height - 40);
  text(`Hearts: ${heartsCollected}/${TOTAL_HEARTS_GOAL}`, 20, height - 20);
}

function drawEndZone() {
  noStroke();
  fill(120, 60, 100, 50);
  rect(width - END_ZONE_W, 0, END_ZONE_W, height);
}

function drawWinScreen() {
  background(280, 20, 12);

  fill(0, 0, 100);
  textAlign(CENTER, CENTER);

  textSize(36);
  text("Complete", width / 2, height / 2 - 80);

  textSize(18);
  text("What are your true colors?", width / 2, height / 2 - 15);
  text(`Hearts collected: ${heartsCollected}/${TOTAL_HEARTS_GOAL}`, width / 2, height / 2 + 20);

  textSize(14);
  text("Press ENTER or SPACE to restart.", width / 2, height / 2 + 90);
}

// =====================================================
// LEVEL SETUP
// Builds the objects for each level
// =====================================================

function setupLevel1() {
  currentLevel = 1;
  heartsCollected = 0;
  
  player = new Player(80, 450);

  barriers = [
    new Barrier(width / 2, 170, 40, 350, "Red"),
  ];
  
  hearts = [
    new Heart(100, height / 2, "Red")
  ];
  hearts[0].visible = false;

  walls = [
    new Wall(0, 150, width, 20),
    new Wall(0, height - 150, width, 20)
  ];

  particles = [];
}

function setupLevel2() {
  currentLevel = 2;
  heartsCollected = 1;
  currentNarrative = "That color won't work here."
  player = new Player(80, 450);

  barriers = [];
  barriers.push(new Barrier(width / 2, 340, 40, 180, "Blue"));
  barriers.push(new Barrier(300, 170, 40, 180, "Yellow"));
  barriers.push(new Barrier(300, 340, 40, 180, "Red"));
  barriers.push(new Barrier(width / 2, 170, 40, 180, "Red"));
  barriers.push(new Barrier(700, 170, 40, 180, "Yellow"));
  
  hearts = [];
  hearts.push(new Heart(830, (height / 2) - 100, "Blue"));
  hearts.push(new Heart(430, (height / 2) + 150, "Yellow"));
  
  walls = [];
  walls.push(new Wall(0, 150, width, 20));
  walls.push(new Wall(0, height - 150, width, 20));
  walls.push(new Wall(150, height / 2, width, 20));
  walls.push(new Wall(width - 80, 160, 20, 170))

  unlockedColors = ["Red"];
  
  particles = [];
}

function setupLevel3() {
  currentLevel = 3;
  heartsCollected = 3;
  currentNarrative = "Now what?"
  
  player = new Player(80, 450);
  
  barriers = [];

  // Early barriers using already-known colors
  barriers.push(new Barrier(250, 340, 40, 180, "Red"));
  barriers.push(new Barrier(250, 170, 40, 180, "Blue"));

  barriers.push(new Barrier(100, 170, 40, 180, "Indigo"));
  
  // Mid barriers guiding player toward new hearts
  barriers.push(new Barrier(300, height /2, 180, 38, "Orange"));
  barriers.push(new Barrier(500, 170, 40, 360, "Green"));

  // Final FFT-driven barrier
  barriers.push(new Barrier(760, 170, 40, 360, "Orange"));

  hearts = [];
  hearts.push(new Heart(380, 430, "Orange"));
  hearts.push(new Heart(380, 240, "Indigo"));
  hearts.push(new Heart(40, 240, "Green"));

  walls = [];
  walls.push(new Wall(0, 150, width, 20));
  walls.push(new Wall(0, height - 150, width, 20));
  walls.push(new Wall(0, height / 2, 360, 20));
  walls.push(new Wall(440, height / 2, 100, 20)); 
  
  unlockedColors = ["Red", "Yellow", "Blue"];
  
  particles = [];
}

function setupLevel4() {
  currentLevel = 4;
  heartsCollected = 6;
  currentNarrative = "One more color.";

  player = new Player(80, 450);

  barriers = [];
  barriers.push(new Barrier(180, 170, 28, 360, "Red"));
  barriers.push(new Barrier(300, 170, 28, 360, "Yellow"));
  barriers.push(new Barrier(420, 170, 28, 360, "Blue"));
  barriers.push(new Barrier(540, 170, 28, 360, "Orange"));
  barriers.push(new Barrier(660, 170, 28, 360, "Green"));
  barriers.push(new Barrier(780, 170, 28, 360, "Indigo"));

  hearts = [];
  hearts.push(new Heart(900, 345, "Violet"));

  walls = [];
  walls.push(new Wall(0, 150, width, 20));
  walls.push(new Wall(0, height - 150, width, 20));

  unlockedColors = ["Red", "Yellow", "Blue", "Orange", "Green", "Indigo"];

  particles = [];
}
