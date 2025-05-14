// --- Game Configuration ---
let GRAVITY = 0.6;
let JUMP_FORCE = -11;
let DOUBLE_JUMP_FORCE = -9;
let GROUND_Y;
let MIN_OBSTACLE_SPACING = 300; // Increased slightly
let MAX_OBSTACLE_SPACING = 600; // Increased slightly
let OBSTACLE_SPEED_START = 5.5;
let SPEED_INCREASE = 0.0015;
let BOY_WALK_ANIM_SPEED = 7;

// --- Game State ---
let boy;
let obstacles = [];
let score = 0;
let gameSpeed;
let nextObstacleFrame;
let gameState = 'start'; // 'start', 'playing', 'gameOver'

// --- Background Elements ---
let clouds = [];
let mountains = [];
let groundDecor = [];
let stars = [];

// --- Color Palette (Dark Theme) ---
let SKY_TOP_COLOR, SKY_BOTTOM_COLOR, MOUNTAIN_COLOR, CLOUD_COLOR, GROUND_COLOR, GROUND_DECOR_COLOR;
let BOY_SHIRT_COLOR, BOY_SKIN_COLOR, BOY_HAIR_COLOR, BOY_PANTS_COLOR, LOGO_A_COLOR;
let OBSTACLE_TREE_TRUNK, OBSTACLE_TREE_LEAVES, OBSTACLE_ROCK_COLOR, OBSTACLE_WOLF_COLOR, OBSTACLE_TIGER_COLOR,OBSTACLE_BIRD_COLOR;
let TEXT_COLOR, STAR_COLOR, OVERLAY_COLOR, GAMEOVER_OVERLAY_COLOR;

// --- ASSETS (Drawing Functions) ---

function drawBoy(x, y, w, h, isCrouching, onGround, frameCount) {
    push(); noStroke(); translate(x, y);
    const normalHeight = h; const crouchHeight = h * 0.7;
    const currentHeight = isCrouching && onGround ? crouchHeight : normalHeight;
    const yOffset = isCrouching && onGround ? normalHeight - crouchHeight : 0;
    translate(0, yOffset);

    fill(BOY_HAIR_COLOR); rect(w * 0.1, 0, w * 0.8, currentHeight * 0.2); rect(w * 0.05, currentHeight * 0.1, w * 0.2, currentHeight * 0.2); rect(w * 0.75, currentHeight * 0.1, w * 0.2, currentHeight * 0.2); // Hair
    fill(BOY_SKIN_COLOR); rect(w * 0.2, currentHeight * 0.15, w * 0.6, currentHeight * 0.2); // Face
    fill(BOY_SHIRT_COLOR); rect(w * 0.1, currentHeight * 0.35, w * 0.8, currentHeight * 0.4); rect(0, currentHeight * 0.35, w * 0.15, currentHeight * 0.3); rect(w * 0.85, currentHeight * 0.35, w * 0.15, currentHeight * 0.3); // Shirt & Arms
    fill(LOGO_A_COLOR); rect(w * 0.4, currentHeight * 0.45, w * 0.2, currentHeight * 0.08); rect(w * 0.35, currentHeight * 0.53, w * 0.1, currentHeight * 0.15); rect(w * 0.55, currentHeight * 0.53, w * 0.1, currentHeight * 0.15); // 'A'

    fill(BOY_PANTS_COLOR); const legTop = currentHeight * 0.75; const legHeight = currentHeight * 0.25; const legWidth = w * 0.25; const leg1X = w * 0.2; const leg2X = w * 0.55; // Legs setup
    if (!onGround) { rect(leg1X - w * 0.05, legTop, legWidth, legHeight * 0.8); rect(leg2X + w * 0.05, legTop + legHeight * 0.1, legWidth, legHeight * 0.8); } // Jumping
    else if (isCrouching) { rect(leg1X, legTop, legWidth, legHeight * 0.8); rect(leg2X, legTop, legWidth, legHeight * 0.8); } // Crouching
    else { let animFrameIndex = floor(frameCount / BOY_WALK_ANIM_SPEED) % 2; if (animFrameIndex === 0) { rect(leg1X, legTop, legWidth, legHeight); rect(leg2X, legTop + legHeight * 0.1, legWidth, legHeight * 0.9); } else { rect(leg1X, legTop + legHeight * 0.1, legWidth, legHeight * 0.9); rect(leg2X, legTop, legWidth, legHeight); } } // Walking/Standing
    pop();
}
function drawBird(x, y, w, h, flap) {
    push();
    noStroke();
    translate(x, y+5);

    fill(OBSTACLE_BIRD_COLOR);

    // Body
    ellipse(0, 0, w * 0.8, h * 0.5);

    // Head
    ellipse(-w * 0.35, -h * 0.15, w * 0.3, h * 0.3);

    // Beak
    fill(255, 165, 0);
    triangle(-w * 0.45, -h * 0.15, -w * 0.6, -h * 0.1, -w * 0.45, -h * 0.05);

    // Wings (flap anim)
    fill(OBSTACLE_BIRD_COLOR);
    if (flap) {
        triangle(0, 0, w * 0.2, -h * 0.5, w * 0.4, 0);
    } else {
        triangle(0, 0, w * 0.2, h * 0.3, w * 0.4, 0);
    }

    pop();
}
function drawTree(x, y, w, h) { push(); noStroke(); translate(x, y); fill(OBSTACLE_TREE_TRUNK); let trunkW = w * 0.4; rect((w - trunkW) / 2, h * 0.3, trunkW, h * 0.7); fill(OBSTACLE_TREE_LEAVES); ellipse(w / 2, h * 0.2, w * 1.2, h * 0.6); ellipse(w * 0.3, h * 0.3, w * 0.8, h * 0.4); ellipse(w * 0.7, h * 0.3, w * 0.8, h * 0.4); pop(); }
function drawRock(x, y, w, h) { push(); noStroke(); fill(OBSTACLE_ROCK_COLOR); translate(x, y); rect(0, h * 0.1, w, h * 0.9); rect(w * 0.2, 0, w * 0.6, h * 0.3); fill(red(OBSTACLE_ROCK_COLOR) - 15, green(OBSTACLE_ROCK_COLOR) - 15, blue(OBSTACLE_ROCK_COLOR) - 15); rect(w*0.1, h*0.4, w*0.3, h*0.3); rect(w*0.6, h*0.5, w*0.3, h*0.4); pop(); }
function drawWolf(x, y, w, h) { push(); noStroke(); translate(x, y);  fill(OBSTACLE_WOLF_COLOR); rect(w * 0.1, h * 0.2, w * 0.8, h * 0.6); rect(w*0.0, h*0.0, w * 0.3, h * 0.4); triangle(w*0.1, h*0.1, w*0.2, 0, w*0.3, h*0.1); triangle(w* -0.1, h*0.1, w*0.0, 0, w*0.1, h*0.1); rect(w*0.8, h * 0.3, w * 0.2, h * 0.2); rect(w * 0.2, h * 0.8, w * 0.15, h * 0.2); rect(w * 0.65, h * 0.8, w * 0.15, h * 0.2); fill(0); rect(w * 0.1, h * 0.15, w * 0.05, h * 0.05); pop(); }
function drawTiger(x, y, w, h) { push(); noStroke(); translate(x, y);  fill(OBSTACLE_TIGER_COLOR); rect(w * 0.1, h * 0.2, w * 0.8, h * 0.6); rect(w * 0.0, h*0.05, w * 0.3, h * 0.4); ellipse(w*0.1, h*0.05, w*0.15, w*0.15); ellipse(w*0.3, h*0.05, w*0.15, w*0.15); rect(w*0.8, h * 0.4, w * 0.2, h * 0.15); rect(w * 0.2, h * 0.8, w * 0.15, h * 0.2); rect(w * 0.65, h * 0.8, w * 0.15, h * 0.2); fill(0); for(let i = 0; i < 4; i++) { rect(w * (0.75 - i*0.15), h * 0.2, w * 0.05, h * 0.6); } rect(w*0.85, h*0.42, w*0.1, h*0.08); fill(0); rect(w * 0.1, h * 0.2, w * 0.05, h * 0.05); pop(); }

// --- Background Drawing ---
function setupBackgroundElements() {
    clouds = []; mountains = []; groundDecor = []; stars = [];
    for (let i = 0; i < 7; i++) clouds.push({ x: random(width, width * 2.5), y: random(height * 0.1, height * 0.45), size: random(50, 90), speed: random(0.3, 0.9) });
    for (let i = 0; i < 4; i++) mountains.push({ x: random(width, width * 3.5), y: GROUND_Y, w: random(200, 450), h: random(120, 350), speed: 0.15 });
    for (let i = 0; i < 20; i++) groundDecor.push({ x: random(width, width * 2), y: GROUND_Y + random(5, 15), size: random(4, 12) }); // Removed speed property here, will use gameSpeed directly
    for (let i = 0; i < 120; i++) stars.push({ x: random(width), y: random(GROUND_Y * 0.95), size: random(1, 3), alpha: random(100, 255) });
}
function drawBackground() {
    // Sky Gradient
    for (let i = 0; i < height; i++) { let inter = map(i, 0, height, 0, 1); let c = lerpColor(SKY_TOP_COLOR, SKY_BOTTOM_COLOR, inter); stroke(c); line(0, i, width, i); } noStroke();
    // Stars
    for (let s of stars) { fill(STAR_COLOR.levels[0], STAR_COLOR.levels[1], STAR_COLOR.levels[2], s.alpha); ellipse(s.x, s.y, s.size, s.size); if (random() < 0.005) s.alpha = random(100, 255); }
    // Mountains
    fill(MOUNTAIN_COLOR); for (let m of mountains) { triangle(m.x, m.y, m.x + m.w / 2, m.y - m.h, m.x + m.w, m.y); if (gameState === 'playing') m.x -= m.speed * (gameSpeed * 0.3); if (m.x + m.w < 0) m.x = width + random(100, 400); }
    // Clouds
    fill(CLOUD_COLOR); for (let c of clouds) { ellipse(c.x, c.y, c.size, c.size * 0.6); ellipse(c.x + c.size * 0.3, c.y + 5, c.size * 0.8, c.size * 0.5); if (gameState === 'playing') c.x -= c.speed * (gameSpeed * 0.1 + 0.1); if (c.x + c.size * 1.1 < 0) { c.x = width + random(50, 150); c.y = random(height * 0.1, height * 0.45); } }
    // Ground
    fill(GROUND_COLOR); rect(0, GROUND_Y, width, height - GROUND_Y);
    // Ground Decor
    fill(GROUND_DECOR_COLOR); for (let d of groundDecor) { ellipse(d.x, d.y, d.size, d.size * 0.5); if (gameState === 'playing') d.x -= gameSpeed; if (d.x + d.size < 0) { d.x = width + random(20, 60); d.size = random(4, 12); } }
}

// --- Game Setup and Reset ---
function setup() {
    createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    GROUND_Y = height * 0.8;

    // Define Colors (should be defined before use)
    SKY_TOP_COLOR = color(10, 20, 40); SKY_BOTTOM_COLOR = color(30, 50, 90);
    MOUNTAIN_COLOR = color(45, 55, 75, 230); CLOUD_COLOR = color(180, 190, 210, 150);
    GROUND_COLOR = color(35, 35, 45); GROUND_DECOR_COLOR = color(70, 70, 80);
    BOY_SHIRT_COLOR = color(0, 100, 200); BOY_SKIN_COLOR = color(220, 180, 160);
    BOY_HAIR_COLOR = color(15, 15, 15); BOY_PANTS_COLOR = color(50, 50, 60);
    OBSTACLE_TREE_TRUNK = color(80, 50, 30); OBSTACLE_TREE_LEAVES = color(30, 90, 40);
    OBSTACLE_ROCK_COLOR = color(90, 90, 95); OBSTACLE_WOLF_COLOR = color(110, 110, 115); OBSTACLE_BIRD_COLOR = color(200, 200, 50);
    OBSTACLE_TIGER_COLOR = color(220, 120, 0); TEXT_COLOR = color(255);
    STAR_COLOR = color(255, 255, 255); LOGO_A_COLOR = color(255);
    OVERLAY_COLOR = color(10, 20, 40, 200); GAMEOVER_OVERLAY_COLOR = color(60, 20, 20, 200);

    // Create Boy object structure ONCE
    boy = { x: 0, y: 0, w: 35, h: 55, velocityY: 0, onGround: false, canDoubleJump: false, isCrouching: false, isTryingToWalk: false };

    initializeGame(); // Set initial state and positions
    textAlign(CENTER);
    textFont('monospace');
}

// Function to initialize/reset game variables
function initializeGame() {
    console.log("Initializing Game..."); // Debug message
    score = 0;
    gameSpeed = OBSTACLE_SPEED_START;
    obstacles = [];
    nextObstacleFrame = round(frameCount + random(80, 140)); // Schedule first obstacle based on current frame

    // Set Boy initial position and state
    boy.x = width * 0.15;
    boy.y = GROUND_Y - boy.h; // Start on the ground
    boy.velocityY = 0;
    boy.onGround = true;
    boy.canDoubleJump = false;
    boy.isCrouching = false;
    boy.isTryingToWalk = false;

    setupBackgroundElements(); // Reset background element positions and arrays

    gameState = 'start'; // Set state AFTER resetting variables
    loop(); // Ensure the draw loop is running (important if restarting from gameOver)
}

// --- Main Draw Loop ---
function draw() {
    // 1. Process Input (update boy's intention state)
    handleInput();

    // 2. Draw Background
    drawBackground();

    // 3. Handle Game States
    if (gameState === 'start') {
        displayStartScreen();
        // Draw boy standing still in start screen
        drawBoy(width / 2 - boy.w / 2, GROUND_Y - boy.h, boy.w, boy.h, false, true, frameCount); // Pass frameCount even if not animating
    } else if (gameState === 'playing') {
        updateGame();        // Update physics, obstacles, score, speed
        drawGameElements();  // Draw boy and obstacles
    } else if (gameState === 'gameOver') {
        drawGameElements();  // Draw the final frame before overlay
        displayGameOverScreen();
        noLoop();            // Stop the loop ONLY on game over screen display
    }

    // 4. Draw HUD (Score, etc.) - always visible
    displayHUD();
}

// --- Update Logic (Playing State) ---
function updateGame() {
    // Update Boy Physics
    boy.velocityY += GRAVITY;
    boy.y += boy.velocityY;
    boy.onGround = false;
    if (boy.y + boy.h >= GROUND_Y) {
        boy.y = GROUND_Y - boy.h; boy.velocityY = 0; boy.onGround = true; boy.canDoubleJump = false;
    }

    // Update Obstacles & Check Collision
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        let boyHitboxH = (boy.isCrouching && boy.onGround) ? boy.h * 0.7 : boy.h;
        let boyHitboxY = (boy.isCrouching && boy.onGround) ? boy.y + (boy.h - boyHitboxH) : boy.y;
        let boyHitbox = { x: boy.x + boy.w*0.1, y: boyHitboxY, w: boy.w*0.8, h: boyHitboxH };
        let obsHitbox = { x: obs.x + obs.w*0.1, y: obs.y, w: obs.w*0.8, h: obs.h*0.95 };

        if (checkCollision(boyHitbox, obsHitbox)) {
            console.log("Collision Detected!"); // Debug message
            gameState = 'gameOver';
            return; // Stop update
        }

        if (obs.x + obs.w < 0) { obstacles.splice(i, 1); score++; }
    }

    // Spawn New Obstacles
    if (frameCount >= nextObstacleFrame) {
        spawnObstacle();
        let spacing = random(MIN_OBSTACLE_SPACING, MAX_OBSTACLE_SPACING);
        let framesToTravelSpacing = spacing / gameSpeed;
        nextObstacleFrame = frameCount + max(25, round(framesToTravelSpacing));
    }

    // Increase Difficulty
    gameSpeed += SPEED_INCREASE;
}

// --- Draw Gameplay Elements ---
function drawGameElements() {
   for (let obs of obstacles) {
     switch (obs.type) { // Draw obstacles based on type
        case 'tree': drawTree(obs.x, obs.y, obs.w, obs.h); break;
        case 'rock': drawRock(obs.x, obs.y, obs.w, obs.h); break;
        case 'wolf': drawWolf(obs.x, obs.y, obs.w, obs.h); break;
        case 'tiger': drawTiger(obs.x, obs.y, obs.w, obs.h); break;
        case 'bird': drawBird(obs.x, obs.y, obs.w, obs.h,frameCount % 20 < 10); break;

     }
  }
  // Draw Boy - Pass necessary state including frameCount for animation
  drawBoy(boy.x, boy.y, boy.w, boy.h, boy.isCrouching, boy.onGround, frameCount);
}

// --- UI Display Functions ---
function displayHUD() {
  fill(TEXT_COLOR); textSize(24); textAlign(RIGHT); textFont('monospace');
  text("Score: " + score, width - 20, 40);
   if (gameState === 'playing') {
    fill(255, 150); textSize(16); textAlign(CENTER);
    text("Space/Up: Jump/Double | Down: Crouch", width / 2, 30);
   }
}
function displayStartScreen() {
  fill(OVERLAY_COLOR); rect(0, 0, width, height);
  fill(TEXT_COLOR); textSize(48); textAlign(CENTER); textFont('monospace');
  text("Adventure Boy Runner", width / 2, height / 2 - 60);
  textSize(24);
  text("Press SPACE or UP ARROW to Start", width / 2, height / 2 + 10);
  text("(Jump Controls: Space/Up, Down to Crouch)", width / 2, height / 2 + 50);
}
function displayGameOverScreen() {
  fill(GAMEOVER_OVERLAY_COLOR); rect(0, 0, width, height);
  fill(TEXT_COLOR); textSize(60); textAlign(CENTER); textFont('monospace');
  text("GAME OVER", width / 2, height / 2 - 40);
  textSize(32);
  text("Final Score: " + score, width / 2, height / 2 + 20);
  textSize(24);
  text("Press ENTER or SPACE to Restart", width / 2, height / 2 + 70);
}

// --- Obstacle Spawning ---
function spawnObstacle() {
    let obstacleType = random(['tree', 'rock', 'wolf', 'tiger', 'bird']);
    let obsW, obsH, obsY;
    // Define dimensions based on type
    switch (obstacleType) {
        case 'tree': obsW = random(30, 50); obsH = random(60, 100); break;
        case 'rock': obsW = random(35, 60); obsH = random(25, 45); break;
        case 'wolf': obsW = 55; obsH = 40; break;
        case 'tiger': obsW = 60; obsH = 45; break;
        case 'bird': obsW = 40; obsH = 30; break;
        default: obsW = 30; obsH = 50; // Fallback
    }
    if (obstacleType === 'bird') {
        // Flying height (adjust as needed)
        obsY = GROUND_Y -  random(50, 150); // e.g. 150 px above ground, with some variation
    } else {
        obsY = GROUND_Y - obsH;
    } // Position on ground
    obstacles.push({ x: width + random(0, 50), y: obsY, w: obsW, h: obsH, type: obstacleType }); // Add small random offset to x spawn?
    // console.log("Spawned:", obstacleType, "at frame", frameCount); // Debug message
}

// --- Collision Detection ---
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x &&
         rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y;
}

// --- Input Handling ---
function handleInput() { // Called every frame in draw()
    if (gameState !== 'playing') {
        boy.isTryingToWalk = false;
        boy.isCrouching = false;
        return;
    }
    // Boy is always trying to "walk" visually when playing and on ground
    boy.isTryingToWalk = boy.onGround;
    // Update crouching state based on key press
    boy.isCrouching = keyIsDown(DOWN_ARROW);
}

function keyPressed() { // Called once per key press
    console.log("Key Pressed:", keyCode, "gameState:", gameState); // Debug message
    if (gameState === 'start' || gameState === 'gameOver') {
        // Use SPACE (32) or ENTER (13) or UP_ARROW to start/restart
        if (keyCode === 32 || keyCode === 13 || keyCode === UP_ARROW) {
            console.log("Attempting to start/restart game..."); // Debug message
            initializeGame(); // Reset game variables
            gameState = 'playing'; // Set state AFTER resetting
        }
    } else if (gameState === 'playing') {
        // Handle jumps only when playing
        if (keyCode === UP_ARROW || keyCode === 32 /* Space */) {
            if (boy.onGround) {
                boy.velocityY = JUMP_FORCE;
                boy.onGround = false; // Immediately set to false
                boy.canDoubleJump = true;
                console.log("Jump!"); // Debug message
            } else if (boy.canDoubleJump) {
                boy.velocityY = DOUBLE_JUMP_FORCE;
                boy.canDoubleJump = false;
                console.log("Double Jump!"); // Debug message
            }
        }
    }
    // return false; // Usually good practice, but might interfere with some environments? Test without it first.
}

// --- Window Resize ---
function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.6);
    GROUND_Y = height * 0.8;
    // Resetting fully is the most reliable way to handle resize
    initializeGame();
    // Make sure state reflects the reset (should be 'start')
    gameState = 'start';
    console.log("Window resized, game reset to start screen."); // Debug message
}
