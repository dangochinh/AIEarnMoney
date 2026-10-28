/**
 * Moorhuhn Jagd / Crazy Chicken - Core Game Engine
 * 60 FPS HTML5 Canvas game loop, state machine, authentic HUD,
 * shotgun recoil & reload mechanics, and scoring system.
 */

class MoorhuhnEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.logicalWidth = 640;
    this.logicalHeight = 480;
    this.dpr = 1;
    this.isMouseInsideCanvas = true;

    this.state = 'LOADING'; // LOADING, MENU, COUNTDOWN, PLAYING, PAUSED, GAMEOVER
    this.camera = new Camera(this.logicalWidth, this.logicalHeight);

    // Round timing & score
    this.roundDuration = 90.0; // 90 seconds
    this.timeLeft = this.roundDuration;
    this.score = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.maxAmmo = 8;
    this.currentAmmo = 8;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.reloadDuration = 38; // frames (~0.65s)

    // Countdown state
    this.countdownTimer = 0;
    this.countdownPhase = 0; // 0 = READY, 1 = GO

    // Mouse / Cursor
    this.cursorX = this.logicalWidth / 2;
    this.cursorY = this.logicalHeight / 2;
    this.cursorScreenX = this.logicalWidth / 2;
    this.cursorScreenY = this.logicalHeight / 2;
    this.isMouseDown = false;
    this.cursorFlashTimer = 0;

    // Entity collections
    this.chickens = [];
    this.bigChicken = null;
    this.bigChickenTimer = 0;
    this.bigChickenInterval = 1100 + Math.random() * 800; // ~18-30s

    this.windmill = new Windmill(1478, 140);
    this.scarecrow = new Scarecrow(1218, 270);
    this.treeBranch = new TreeBranch(350, 160);
    this.balloon = new Balloon();
    this.plane = new Plane();
    this.peekChicken = new PeekChicken();
    this.particles = new ParticleSystem();

    // Spawner timers
    this.spawnTimer = 0;
    this.nextSpawn = 45; // frames

    // Menu state
    this.menuHoleChickenFrame = 0;
    this.menuHoleTimer = 0;
    this.menuHoverButton = null; // 'start', 'score', 'help'
    this.menuRecoilTimer = 0;
    this.menuShakeOffsetX = 0;
    this.menuShakeOffsetY = 0;
    // Classic authentic Moorhuhn target bullet holes
    this.menuBulletHoles = [
      { x: 195, y: 165, rotation: 0.45, scale: 1.0 },
      { x: 445, y: 185, rotation: 1.82, scale: 0.95 },
      { x: 235, y: 310, rotation: 2.75, scale: 1.05 },
      { x: 420, y: 335, rotation: 3.91, scale: 1.0 }
    ];

    // Assets repository
    this.images = {};
    this.sprites = {};
    this.digits = {};
    this.menuImages = {};

    this.lastTime = performance.now();
    this.initInputs();
  }

  get width() {
    return this.logicalWidth || 640;
  }

  get height() {
    return this.logicalHeight || 480;
  }

  setResolution(logicalWidth, logicalHeight, dpr = 1) {
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.dpr = dpr;
    if (this.camera) {
      this.camera.resize(logicalWidth, logicalHeight);
    }
  }

  // Preload all graphics
  async preload(onProgress) {
    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn('Failed to load image:', src);
          resolve(img);
        };
        img.src = src;
      });
    };

    const imageManifest = [
      // Parallax Layers
      { key: 'layer0', src: 'assets/images/layers/layer0.png', target: 'images' },
      { key: 'layer1', src: 'assets/images/layers/layer1.png', target: 'images' },
      { key: 'layer2', src: 'assets/images/layers/layer2.png', target: 'images' },
      { key: 'layer3', src: 'assets/images/layers/layer3.png', target: 'images' },
      { key: 'layer4', src: 'assets/images/layers/layer4.png', target: 'images' },
      { key: 'layer5', src: 'assets/images/layers/layer5.png', target: 'images' },

      // Screens
      { key: 'main_screen', src: 'assets/images/screens/main.png', target: 'images' },
      { key: 'score_screen', src: 'assets/images/screens/score.png', target: 'images' },

      // Sprites
      { key: 'chickl', src: 'assets/images/sprites/chickl.png', target: 'sprites' },
      { key: 'chickl2', src: 'assets/images/sprites/chickl2.png', target: 'sprites' },
      { key: 'chickl3', src: 'assets/images/sprites/chickl3.png', target: 'sprites' },
      { key: 'chickl_hd', src: 'assets/images/sprites/chickl_hd.png', target: 'sprites' },
      { key: 'chickr', src: 'assets/images/sprites/chickr.png', target: 'sprites' },
      { key: 'chickr2', src: 'assets/images/sprites/chickr2.png', target: 'sprites' },
      { key: 'chickr3', src: 'assets/images/sprites/chickr3.png', target: 'sprites' },
      { key: 'chickr_hd', src: 'assets/images/sprites/chickr_hd.png', target: 'sprites' },
      { key: 'chickd', src: 'assets/images/sprites/chickd.png', target: 'sprites' },
      { key: 'chickd2', src: 'assets/images/sprites/chickd2.png', target: 'sprites' },
      { key: 'chickd3', src: 'assets/images/sprites/chickd3.png', target: 'sprites' },
      { key: 'chickd_hd', src: 'assets/images/sprites/chickd_hd.png', target: 'sprites' },
      { key: 'chickie', src: 'assets/images/sprites/chickie.png', target: 'sprites' },
      { key: 'chickie_hd', src: 'assets/images/sprites/chickie_hd.png', target: 'sprites' },
      { key: 'big1', src: 'assets/images/sprites/big1.png', target: 'sprites' },
      { key: 'big1_hd', src: 'assets/images/sprites/big1_hd.png', target: 'sprites' },
      { key: 'bighit', src: 'assets/images/sprites/bighit.png', target: 'sprites' },
      { key: 'bighit_hd', src: 'assets/images/sprites/bighit_hd.png', target: 'sprites' },
      { key: 'windmill', src: 'assets/images/sprites/windmill.png', target: 'sprites' },
      { key: 'wing', src: 'assets/images/sprites/wing.png', target: 'sprites' },
      { key: 'scare', src: 'assets/images/sprites/scare.png', target: 'sprites' },
      { key: 'hat', src: 'assets/images/sprites/hat.png', target: 'sprites' },
      { key: 'sign', src: 'assets/images/sprites/sign.png', target: 'sprites' },
      { key: 'balloon', src: 'assets/images/sprites/balloon.png', target: 'sprites' },
      { key: 'plane', src: 'assets/images/sprites/plane.png', target: 'sprites' },
      { key: 'leaf', src: 'assets/images/sprites/leaf.png', target: 'sprites' },
      { key: 'leafhit', src: 'assets/images/sprites/leafhit.png', target: 'sprites' },
      { key: 'guck', src: 'assets/images/sprites/guck.png', target: 'sprites' },
      { key: 'guck_hd', src: 'assets/images/sprites/guck_hd.png', target: 'sprites' },
      { key: 'hole', src: 'assets/images/sprites/hole.png', target: 'sprites' },
      { key: 'hole2', src: 'assets/images/sprites/hole2.png', target: 'sprites' },
      { key: 'huls', src: 'assets/images/sprites/huls.png', target: 'sprites' },
      { key: 'cursor_normal', src: 'assets/images/sprites/cursor_normal.png', target: 'sprites' },
      { key: 'cursor_red', src: 'assets/images/sprites/cursor_red.png', target: 'sprites' },

      // Cartridges HUD
      { key: 'cartridge', src: 'assets/images/ammo/cartridge_hud.png', target: 'images' },

      // Menu
      { key: 'menu_bg', src: 'assets/images/menu/main_menu.png', target: 'menuImages' },
      { key: 'menu_hole', src: 'assets/images/menu/hole.png', target: 'menuImages' },
      { key: 'menu_start_n', src: 'assets/images/menu/start_normal.png', target: 'menuImages' },
      { key: 'menu_start_h', src: 'assets/images/menu/start_h.png', target: 'menuImages' },
      { key: 'menu_score_n', src: 'assets/images/menu/score_normal.png', target: 'menuImages' },
      { key: 'menu_score_h', src: 'assets/images/menu/score_h.png', target: 'menuImages' },
      { key: 'menu_help_n', src: 'assets/images/menu/menu_normal.png', target: 'menuImages' },
      { key: 'menu_help_h', src: 'assets/images/menu/menu_h.png', target: 'menuImages' }
    ];

    // Menu chicken holes (1 to 14)
    for (let i = 1; i <= 14; i++) {
      imageManifest.push({
        key: `chickenhole${i}`,
        src: `assets/images/menu/chickenhole${i}.png`,
        target: 'menuImages'
      });
    }

    // Digits (0 to 9)
    for (let i = 0; i <= 9; i++) {
      imageManifest.push({
        key: `${i}`,
        src: `assets/images/digits/${i}.png`,
        target: 'digits'
      });
    }

    let loaded = 0;
    const total = imageManifest.length;

    await Promise.all(
      imageManifest.map(async (item) => {
        const img = await loadImage(item.src);
        if (item.target === 'images') this.images[item.key] = img;
        else if (item.target === 'sprites') this.sprites[item.key] = img;
        else if (item.target === 'digits') this.digits[item.key] = img;
        else if (item.target === 'menuImages') this.menuImages[item.key] = img;

        loaded++;
        if (onProgress) onProgress(loaded / total);
      })
    );

    console.log('All image assets loaded successfully');
    this.state = 'MENU';
    window.audioManager.playMusic('music_menu', true);
  }

  // Setup Event Listeners
  initInputs() {
    const updateCursor = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;

      this.cursorScreenX = (e.clientX - rect.left) * scaleX;
      this.cursorScreenY = (e.clientY - rect.top) * scaleY;
      this.cursorX = this.cursorScreenX;
      this.cursorY = this.cursorScreenY;
    };

    this.canvas.addEventListener('mouseenter', () => {
      this.isMouseInsideCanvas = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseInsideCanvas = false;
      this.menuHoverButton = null;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.isMouseInsideCanvas = true;
      updateCursor(e);
      if (this.isMiddleDragging) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const dx = (e.clientX - this.middleDragStartX) * scaleX;
        this.camera.x = this.middleDragStartCamX - dx;
        this.camera.clamp();
      }
      if (this.state === 'MENU') {
        this.checkMenuHover(this.cursorScreenX, this.cursorScreenY);
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      window.audioManager.resumeContext();
      this.isMouseInsideCanvas = true;
      updateCursor(e);

      if (e.button === 0) {
        // Left Click
        this.isMouseDown = true;
        this.cursorFlashTimer = 6;

        if (this.state === 'PLAYING') {
          // If clicked on bottom right ammo rack, trigger reload!
          if (this.cursorScreenX >= this.width - 220 && this.cursorScreenY >= this.height - 65) {
            this.reload();
          } else {
            this.shoot();
          }
        } else if (this.state === 'MENU') {
          this.handleMenuClick(this.cursorScreenX, this.cursorScreenY);
        } else if (this.state === 'GAMEOVER') {
          this.handleGameOverClick(this.cursorScreenX, this.cursorScreenY);
        }
      } else if (e.button === 1) {
        // Middle Click Drag Pan
        e.preventDefault();
        this.isMiddleDragging = true;
        this.middleDragStartX = e.clientX;
        this.middleDragStartCamX = this.camera.x;
      } else if (e.button === 2) {
        // Right Click: Reload
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.reload();
        }
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isMouseDown = false;
      if (e.button === 1) this.isMiddleDragging = false;
    });

    // Handle Trackpad 2-finger swipe / Magic Mouse swipe gestures
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Handle deltaX (horizontal swipe on trackpad/mouse) or shift+deltaY
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : (e.shiftKey || Math.abs(e.deltaY) > 2 ? e.deltaY * 0.7 : 0);

      if (delta !== 0 && this.camera) {
        this.camera.addWheelPan(delta);
      }
    }, { passive: false });

    // Disable default browser context menu on canvas
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch controls on canvas
    this.canvas.addEventListener('touchstart', (e) => {
      window.audioManager.resumeContext();
      this.isMouseInsideCanvas = true;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        this.cursorScreenX = (touch.clientX - rect.left) * scaleX;
        this.cursorScreenY = (touch.clientY - rect.top) * scaleY;
        this.touchStartX = touch.clientX;
        this.touchStartCamX = this.camera.x;

        if (this.state === 'PLAYING') {
          if (this.cursorScreenX >= this.width - 220 && this.cursorScreenY >= this.height - 65) {
            this.reload();
          } else {
            this.shoot();
          }
        } else if (this.state === 'MENU') {
          this.handleMenuClick(this.cursorScreenX, this.cursorScreenY);
        } else if (this.state === 'GAMEOVER') {
          this.handleGameOverClick(this.cursorScreenX, this.cursorScreenY);
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        this.cursorScreenX = (touch.clientX - rect.left) * scaleX;
        this.cursorScreenY = (touch.clientY - rect.top) * scaleY;
      }
    }, { passive: true });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      window.audioManager.resumeContext();

      if (e.code === 'Enter') {
        if (this.state === 'MENU') {
          // Shoot the START button!
          const sX = this.width / 2;
          const sY = this.height * 0.61 + 20;
          this.handleMenuClick(sX, sY);
        } else if (this.state === 'GAMEOVER') {
          window.audioManager.playSfx('ready');
          this.startNewGame();
        }
      } else if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        if (this.state === 'PLAYING') this.reload();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.camera.keyLeft = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.camera.keyRight = true;
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'PLAYING') this.pause();
        else if (this.state === 'PAUSED') this.resume();
      } else if (e.code === 'KeyF') {
        if (window.uiManager) window.uiManager.toggleFullscreen();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.camera.keyLeft = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.camera.keyRight = false;
      }
    });
  }

  // Start a new hunt round
  startNewGame() {
    this.score = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.timeLeft = this.roundDuration;
    this.currentAmmo = this.maxAmmo;
    this.isReloading = false;
    this.chickens = [];
    this.bigChicken = null;
    this.bigChickenTimer = 0;

    // Reset interactive scenery
    this.windmill = new Windmill(1478, 140);
    this.scarecrow = new Scarecrow(1218, 270);
    this.treeBranch = new TreeBranch(350, 160);
    this.balloon = new Balloon();
    this.plane = new Plane();
    this.peekChicken = new PeekChicken();
    this.particles = new ParticleSystem();

    // Initial flock spread naturally across the panorama
    for (let i = 0; i < 4; i++) {
      this.spawnChicken('far', 100 + Math.random() * 1650);
      this.spawnChicken('mid', 100 + Math.random() * 1650);
      this.spawnChicken('close', 100 + Math.random() * 1650);
    }

    this.state = 'COUNTDOWN';
    this.countdownTimer = 0;
    this.countdownPhase = 0;

    window.audioManager.stopMusic(0.2);
    window.audioManager.playSfx('ready'); // Whistle
  }

  spawnChicken(tier = null, x = null) {
    if (!tier) {
      const rand = Math.random();
      if (rand < 0.35) tier = 'far';
      else if (rand < 0.70) tier = 'mid';
      else tier = 'close';
    }
    this.chickens.push(new Chicken(tier, x));
  }

  // Gun firing
  shoot() {
    if (this.isReloading) return;

    if (this.currentAmmo <= 0) {
      window.audioManager.playSfx('empty', 0.9);
      return;
    }

    // Fire shotgun!
    this.currentAmmo--;
    this.shotsFired++;
    window.audioManager.playSfx('shoot', 1.0, 0.05);
    this.camera.addTrauma(0.55);

    // Eject shell casing from bottom right of viewport
    this.particles.spawnCasing(this.width - 90, this.height - 30);

    // Check hit against entities
    let hitAnything = false;

    // 1. Check Big Chicken (highest z-index)
    if (this.bigChicken && this.bigChicken.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
      hitAnything = true;
      this.shotsHit++;
      this.score += this.bigChicken.points;
      window.audioManager.playSfx('hit1');
      window.audioManager.playSfx('fall');
      this.particles.spawnFeathers(this.cursorScreenX, this.cursorScreenY, 20);
      this.particles.addText(`${this.bigChicken.points}`, this.cursorScreenX, this.cursorScreenY - 20, '#ffffff');
      return;
    }

    // 2. Check Flying Chickens (front to back: close -> mid -> far)
    for (let i = this.chickens.length - 1; i >= 0; i--) {
      const chick = this.chickens[i];
      if (chick.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
        hitAnything = true;
        this.shotsHit++;
        this.score += chick.points;

        const squawk = Math.random() < 0.5 ? 'hit1' : (Math.random() < 0.5 ? 'hit2' : 'hit3');
        window.audioManager.playSfx(squawk, 0.95);
        window.audioManager.playSfx('fall', 0.85);

        this.particles.spawnFeathers(this.cursorScreenX, this.cursorScreenY, chick.tier === 'close' ? 16 : (chick.tier === 'mid' ? 10 : 6));
        this.particles.addText(`${chick.points}`, this.cursorScreenX, this.cursorScreenY - 15, '#ffffff');
        break;
      }
    }

    // 3. Check Windmill Blades & Chickens
    if (!hitAnything) {
      const millResult = this.windmill.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera);
      if (millResult.hit) {
        hitAnything = true;
        this.shotsHit++;
        this.score += millResult.points;
        window.audioManager.playSfx('hit1');
        window.audioManager.playSfx('fall');
        if (millResult.allDestroyed) {
          window.audioManager.playSfx('ready');
          this.particles.addText('COMBO +50 (ALL BLADES)!', this.cursorScreenX, this.cursorScreenY - 35, '#ffd659');
        }
        this.particles.spawnFeathers(this.cursorScreenX, this.cursorScreenY, millResult.hitChicken ? 16 : 8);
        this.particles.addText(`+${millResult.points}`, this.cursorScreenX, this.cursorScreenY - 15, '#ffffff');
      }
    }

    // 4. Check Scarecrow Hat
    if (!hitAnything && this.scarecrow.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
      hitAnything = true;
      this.shotsHit++;
      this.score += 25;
      window.audioManager.playSfx('hit2');
      this.particles.addText('25', this.cursorScreenX, this.cursorScreenY - 15, '#ffffff');
    }

    // 5. Check Peeking Chicken
    if (!hitAnything) {
      const peekResult = this.peekChicken.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera);
      if (peekResult && peekResult.hit) {
        hitAnything = true;
        this.shotsHit++;
        this.score += peekResult.points;
        window.audioManager.playSfx('hit1');
        window.audioManager.playSfx('bird');
        window.audioManager.playSfx('fall');
        this.particles.spawnFeathers(this.cursorScreenX, this.cursorScreenY, 16);
        this.particles.addText(`${peekResult.points}`, this.cursorScreenX, this.cursorScreenY - 15, '#ffffff');
      }
    }

    // 6. Check Tree Branch / Leaves
    if (!hitAnything && this.treeBranch.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
      hitAnything = true;
      this.shotsHit++;
      this.score += 10;
      window.audioManager.playSfx('tree');
      this.particles.addText('10', this.cursorScreenX, this.cursorScreenY - 15, '#ffffff');
    }

    // 7. Check Airplane & Towed Banner (PENALTY -25)
    if (!hitAnything && this.plane.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
      hitAnything = true;
      this.score = Math.max(0, this.score - 25);
      window.audioManager.playSfx('plane');
      this.particles.spawnSmoke(this.cursorScreenX, this.cursorScreenY, 8);
      this.particles.addText('-25', this.cursorScreenX, this.cursorScreenY - 15, '#ff4444');
    }

    // 8. Check Hot Air Balloon (PENALTY -25)
    if (!hitAnything && this.balloon.checkHit(this.cursorScreenX, this.cursorScreenY, this.camera)) {
      hitAnything = true;
      this.score = Math.max(0, this.score - 25);
      window.audioManager.playSfx('balloon');
      this.particles.addText('-25', this.cursorScreenX, this.cursorScreenY - 15, '#ff4444');
    }

    // Shot missed: spawn landscape impact smoke
    if (!hitAnything) {
      this.particles.spawnSmoke(this.cursorScreenX, this.cursorScreenY, 3);
    }
  }

  // Reload shotgun
  reload() {
    if (this.isReloading || this.currentAmmo >= this.maxAmmo) return;
    this.isReloading = true;
    this.reloadTimer = 0;
    window.audioManager.playSfx('reload', 1.0);
  }

  pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      window.audioManager.stopMusic(0.2);
    }
  }

  resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      window.audioManager.playMusic('ambient', true, 0.4);
    }
  }

  // Main Loop Update
  update(dt = 1.0) {
    if (this.cursorFlashTimer > 0) this.cursorFlashTimer -= dt;

    if (this.state === 'MENU') {
      // Menu recoil shake decay
      if (this.menuRecoilTimer > 0) {
        this.menuRecoilTimer = Math.max(0, this.menuRecoilTimer - dt);
        const shakeMag = this.menuRecoilTimer * 1.3;
        this.menuShakeOffsetX = (Math.random() * 2 - 1) * shakeMag;
        this.menuShakeOffsetY = (Math.random() * 2 - 1) * shakeMag;
      } else {
        this.menuShakeOffsetX = 0;
        this.menuShakeOffsetY = 0;
      }

      // Animate menu chicken peeking out of hole
      this.menuHoleTimer += dt;
      if (this.menuHoleTimer >= 5.5) {
        this.menuHoleTimer = 0;
        this.menuHoleChickenFrame = (this.menuHoleChickenFrame + 1) % 14;
      }

      // Update particles (flying shell casings, smoke, feathers) on menu
      this.particles.update(dt);
      return;
    }

    if (this.state === 'COUNTDOWN') {
      this.countdownTimer += dt;
      if (this.countdownPhase === 0 && this.countdownTimer >= 45) {
        this.countdownPhase = 1; // GO!
        window.audioManager.playSfx('intro'); // Fanfare horn
      } else if (this.countdownPhase === 1 && this.countdownTimer >= 80) {
        this.state = 'PLAYING';
        window.audioManager.playMusic('ambient', true, 1.0);
      }
      return;
    }

    if (this.state !== 'PLAYING') return;

    // 1. Update Timer
    const prevTime = this.timeLeft;
    this.timeLeft = Math.max(0, this.timeLeft - (dt / 60.0));

    // Tick audio on last 10 seconds
    if (Math.floor(this.timeLeft) !== Math.floor(prevTime) && this.timeLeft <= 10 && this.timeLeft > 0) {
      window.audioManager.playSfx('timeup', 0.95);
    }

    // Time's up!
    if (this.timeLeft <= 0) {
      this.endGame();
      return;
    }

    // 2. Update Reload
    if (this.isReloading) {
      this.reloadTimer += dt;
      if (this.reloadTimer >= this.reloadDuration) {
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
        this.reloadTimer = 0;
      }
    }

    // 3. Update Camera
    this.camera.update(this.cursorScreenX, dt, this.isMouseInsideCanvas);

    // 4. Update Chickens & Spawner
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = 35 + Math.random() * 45; // Spawn chicken every 0.6 - 1.3s
      if (this.chickens.length < 16) {
        this.spawnChicken();
      }
    }

    for (let i = this.chickens.length - 1; i >= 0; i--) {
      const c = this.chickens[i];
      c.update(dt);
      if (c.isOutOfBounds()) {
        this.chickens.splice(i, 1);
      }
    }

    // 5. Update Big Chicken
    if (!this.bigChicken) {
      this.bigChickenTimer += dt;
      if (this.bigChickenTimer >= this.bigChickenInterval) {
        this.bigChickenTimer = 0;
        this.bigChickenInterval = 1100 + Math.random() * 800;
        this.bigChicken = new BigChicken(this.camera);
        window.audioManager.playSfx('big', 0.95);
      }
    } else {
      this.bigChicken.update(dt);
      if (this.bigChicken.finished) {
        this.bigChicken = null;
      }
    }

    // 6. Update Scenery & Particles
    this.windmill.update(dt);
    this.scarecrow.update(dt);
    this.treeBranch.update(dt);
    this.balloon.update(dt);
    this.plane.update(dt, this.particles);
    this.peekChicken.update(dt);
    this.particles.update(dt);
  }

  endGame() {
    this.state = 'GAMEOVER';
    window.audioManager.stopMusic(0.1);
    window.audioManager.playSfx('gameover', 1.0);

    const accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;

    // Check if score qualifies for top 10 leaderboard
    setTimeout(() => {
      if (window.highScoreManager && window.highScoreManager.isQualifyingScore(this.score)) {
        if (window.uiManager) {
          window.uiManager.promptNameInput(this.score, accuracy, this.shotsHit);
        }
      }
    }, 1200);
  }

  // Main Render Routine
  render() {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const w = this.width;
    const h = this.height;

    // Apply high-DPI transform so all drawing coordinates map directly to logical pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // High quality image smoothing for crisp upscaled graphics
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, w, h);

    if (this.state === 'LOADING') {
      this.renderLoading();
      return;
    }

    if (this.state === 'MENU') {
      this.renderMenu();
      return;
    }

    // ---------------------------------------------
    // PLAYING / PAUSED / COUNTDOWN / GAMEOVER WORLD
    // ---------------------------------------------

    // Layer 0: Sky
    this.camera.renderLayer(this.ctx, this.images['layer0'], 0.15, 0);

    // Far Sky Flyers (Hot air balloon, plane)
    this.balloon.render(this.ctx, this.camera, this.sprites);
    this.plane.render(this.ctx, this.camera, this.sprites);

    // Far Chickens (tier 'far')
    this.renderChickensTier('far');

    // Layer 1: Distant Mountains & Castle
    this.camera.renderLayer(this.ctx, this.images['layer1'], 0.35, 0);

    // Layer 2: Distant Hills
    this.camera.renderLayer(this.ctx, this.images['layer2'], 0.55, 0);

    // Mid Chickens (tier 'mid')
    this.renderChickensTier('mid');

    // Layer 3: Midground Hills, Fence, Trees
    this.camera.renderLayer(this.ctx, this.images['layer3'], 0.80, 0);

    // Interactive Midground Elements: Windmill & Scarecrow
    this.windmill.render(this.ctx, this.camera, this.sprites);
    this.scarecrow.render(this.ctx, this.camera, this.sprites);

    // Close Chickens (tier 'close')
    this.renderChickensTier('close');

    // Layer 4: Bushes & Near Ground
    this.camera.renderLayer(this.ctx, this.images['layer4'], 1.0, 0);

    // Tree branches & peeking chicken
    this.treeBranch.render(this.ctx, this.camera, this.sprites);
    this.peekChicken.render(this.ctx, this.camera, this.sprites);

    // Big Chicken (pops right in front)
    if (this.bigChicken) {
      this.bigChicken.render(this.ctx, this.camera, this.sprites);
    }

    // Layer 5: Extreme Foreground Grass
    this.camera.renderLayer(this.ctx, this.images['layer5'], 1.15, 0);

    // Particles (feathers, smoke, spent shells, floating points)
    this.particles.render(this.ctx, this.sprites);

    // ---------------------------------------------
    // HUD (HEADS-UP DISPLAY)
    // ---------------------------------------------
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.renderHUD();
    }

    // Countdown Overlay
    if (this.state === 'COUNTDOWN') {
      this.renderCountdown();
    }

    // Paused Overlay
    if (this.state === 'PAUSED') {
      this.renderPauseOverlay();
    }

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      this.renderGameOver();
    }

    // Custom Crosshair Cursor
    this.renderCursor();
  }

  renderChickensTier(tier) {
    for (const chick of this.chickens) {
      if (chick.tier === tier) {
        chick.render(this.ctx, this.camera, this.sprites);
      }
    }
  }

  // Draw HUD: Authentic 1999 layout matching original Moorhuhn Jagd
  renderHUD() {
    const ctx = this.ctx;

    // 1. Timer (Top Left: MM:SS, 01:30 down to 00:00, white with black outline)
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = Math.floor(this.timeLeft % 60);
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = this.timeLeft <= 10;

    ctx.save();
    ctx.font = 'bold 38px "AA_Magnum", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(timeStr, 20, 16);

    if (isUrgent && Math.floor(performance.now() / 250) % 2 === 0) {
      ctx.fillStyle = '#ff3333';
    } else {
      ctx.fillStyle = isUrgent ? '#ff6666' : '#ffffff';
    }
    ctx.fillText(timeStr, 20, 16);
    ctx.restore();

    // 2. Score (Top Right: pure white with black outline, right-aligned)
    const scoreStr = String(this.score);
    ctx.save();
    ctx.font = 'bold 38px "AA_Magnum", cursive, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(scoreStr, this.width - 20, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scoreStr, this.width - 20, 16);
    ctx.restore();

    // 3. Shotgun Cartridges (Bottom Right: 8 authentic tilted shells)
    // In original 1999 game: remaining shells stay aligned to the right edge
    const cartImg = this.images['cartridge'];
    if (cartImg && cartImg.complete) {
      const shellW = 20;
      const shellH = 50;
      const spacing = 18;
      const totalW = this.maxAmmo * spacing;
      const baseX = this.width - totalW - 14;
      const baseY = this.height - 56;

      // Draw only currently loaded shells aligned to the right
      const startSlot = this.maxAmmo - this.currentAmmo;
      for (let i = startSlot; i < this.maxAmmo; i++) {
        const shellX = baseX + i * spacing;
        ctx.drawImage(cartImg, shellX, baseY, shellW, shellH);
      }
    }

    // 4. Subtle Reload Warning when completely empty
    if (this.currentAmmo === 0 && !this.isReloading) {
      if (Math.floor(performance.now() / 350) % 2 === 0) {
        ctx.save();
        ctx.font = window.i18n.getFont(18, true);
        ctx.textAlign = 'right';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const warningText = window.i18n.t('reloadWarning');
        ctx.strokeText(warningText, this.width - 20, this.height - 65);
        ctx.fillStyle = '#ff4444';
        ctx.fillText(warningText, this.width - 20, this.height - 65);
        ctx.restore();
      }
    }

    // 5. Reload Progress Indicator
    if (this.isReloading) {
      ctx.save();
      ctx.font = window.i18n.getFont(18, true);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      const reloadingMsg = window.i18n.t('reloadingText');
      ctx.strokeText(reloadingMsg, this.width - 20, this.height - 65);
      ctx.fillText(reloadingMsg, this.width - 20, this.height - 65);
      ctx.restore();
    }
  }

  // Draw numbers using authentic Moorhuhn digit sprites
  renderDigitalNumber(number, startX, startY, minDigits = 1) {
    const ctx = this.ctx;
    const str = String(number).padStart(minDigits, '0');
    let xOffset = 0;

    for (let char of str) {
      const digitImg = this.digits[char];
      if (digitImg && digitImg.complete) {
        ctx.drawImage(digitImg, startX + xOffset, startY, 23, 36);
        xOffset += 24;
      } else {
        // Fallback font text
        ctx.save();
        ctx.font = 'bold 32px "AA_Magnum", monospace';
        ctx.fillStyle = '#ffd659';
        ctx.fillText(str, startX, startY + 30);
        ctx.restore();
        return;
      }
    }
  }

  // Countdown overlay ("READY?" -> "GO!")
  renderCountdown() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = window.i18n.getFont(64, true);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = this.countdownPhase === 0 ? window.i18n.t('ready') : window.i18n.t('go');
    const color = this.countdownPhase === 0 ? '#ffd659' : '#69db7c';

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.strokeText(text, this.width / 2, this.height / 2 - 20);

    ctx.fillStyle = color;
    ctx.fillText(text, this.width / 2, this.height / 2 - 20);
    ctx.restore();
  }

  renderPauseOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.font = window.i18n.getFont(46, true);
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    const pausedText = window.i18n.t('paused');
    ctx.strokeText(pausedText, this.width / 2, this.height / 2 - 30);
    ctx.fillStyle = '#ffd659';
    ctx.fillText(pausedText, this.width / 2, this.height / 2 - 30);

    ctx.font = window.i18n.getFont(20, false);
    ctx.fillStyle = '#fff4d2';
    ctx.fillText(window.i18n.t('resumeHint'), this.width / 2, this.height / 2 + 25);
    ctx.restore();
  }

  // Game Over summary screen
  renderGameOver() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Draw original Score background
    const scoreBg = this.images['score_screen'];
    if (scoreBg && scoreBg.complete) {
      ctx.drawImage(scoreBg, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = 'rgba(15, 8, 4, 0.95)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Title
    ctx.font = window.i18n.getFont(40, true);
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    const timesUpText = window.i18n.t('timesUp');
    ctx.strokeText(timesUpText, this.width / 2, 85);
    ctx.fillStyle = '#ffd659';
    ctx.fillText(timesUpText, this.width / 2, 85);

    // 3. Stats Panel
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;

    const stats = [
      { label: window.i18n.t('totalScore'), val: `${this.score}`, color: '#69db7c', font: window.i18n.getFont(32, true) },
      { label: window.i18n.t('chickensHit'), val: `${this.shotsHit}`, color: '#ffd659', font: window.i18n.getFont(22, true) },
      { label: window.i18n.t('shotsFired'), val: `${this.shotsFired}`, color: '#fff4d2', font: window.i18n.getFont(22, true) },
      { label: window.i18n.t('accuracy'), val: `${accuracy}%`, color: '#69db7c', font: window.i18n.getFont(22, true) }
    ];

    let currentY = 150;
    for (const stat of stats) {
      ctx.font = stat.font;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(`${stat.label} ${stat.val}`, this.width / 2, currentY);
      ctx.fillStyle = stat.color;
      ctx.fillText(`${stat.label} ${stat.val}`, this.width / 2, currentY);
      currentY += 45;
    }

    // 4. Action Buttons
    this.renderGameOverButton('btn-play-again', window.i18n.t('playAgain'), this.width / 2 - 160, 370, 150, 48);
    this.renderGameOverButton('btn-view-scores', window.i18n.t('viewScores'), this.width / 2 + 10, 370, 150, 48);
    this.renderGameOverButton('btn-to-menu', window.i18n.t('toMenu'), this.width / 2 - 95, 428, 190, 40);

    ctx.restore();
  }

  renderGameOverButton(id, text, x, y, w, h) {
    const ctx = this.ctx;
    const isHover = (
      this.cursorScreenX >= x && this.cursorScreenX <= x + w &&
      this.cursorScreenY >= y && this.cursorScreenY <= y + h
    );

    ctx.save();
    ctx.fillStyle = isHover ? '#8b1e0f' : '#4a1508';
    ctx.strokeStyle = isHover ? '#ffd659' : '#c9933b';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.font = window.i18n.getFont(15, true);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHover ? '#fff' : '#ffd659';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  }

  handleGameOverClick(x, y) {
    // Check Play Again button
    if (x >= this.width / 2 - 160 && x <= this.width / 2 - 10 && y >= 370 && y <= 418) {
      window.audioManager.playSfx('ready');
      this.startNewGame();
    }
    // Check View Scores
    else if (x >= this.width / 2 + 10 && x <= this.width / 2 + 160 && y >= 370 && y <= 418) {
      if (window.uiManager) {
        window.highScoreManager.renderTable();
        window.uiManager.openModal(window.uiManager.modalHighscores);
      }
    }
    // Check Main Menu
    else if (x >= this.width / 2 - 90 && x <= this.width / 2 + 90 && y >= 428 && y <= 468) {
      this.state = 'MENU';
      window.audioManager.playMusic('music_menu', true);
    }
  }

  // ---------------------------------------------
  // MAIN MENU SCREEN
  // ---------------------------------------------
  renderMenu() {
    const ctx = this.ctx;

    ctx.save();
    if (this.menuShakeOffsetX || this.menuShakeOffsetY) {
      ctx.translate(this.menuShakeOffsetX, this.menuShakeOffsetY);
    }

    // 1. Draw Menu Background Screen
    const menuBg = this.menuImages['menu_bg'] || this.images['main_screen'];
    if (menuBg && menuBg.complete) {
      ctx.drawImage(menuBg, 0, 0, this.width, this.height);
    }

    // 2. Draw Chicken peeking out of hole in Moorhuhn logo
    const holeImg = this.menuImages[`chickenhole${this.menuHoleChickenFrame + 1}`];
    if (holeImg && holeImg.complete) {
      // Positioned right in the hole at ratio (0.475, 0.33)
      const hW = holeImg.naturalWidth || 54;
      const hH = holeImg.naturalHeight || 80;
      const holeX = this.width * 0.475 - hW / 2;
      const holeY = this.height * 0.37 - hH; // bottom-aligned to rim
      ctx.drawImage(holeImg, Math.round(holeX), Math.round(holeY), hW, hH);
    }

    // 3. Draw Menu Interactive Buttons (centered horizontally)
    // Start Game Button (121x35)
    const startImg = this.menuHoverButton === 'start' ? this.menuImages['menu_start_h'] : this.menuImages['menu_start_n'];
    if (startImg && startImg.complete) {
      const sW = 145;
      const sH = 42;
      const sX = (this.width - sW) / 2;
      const sY = this.height * 0.61;
      ctx.drawImage(startImg, sX, sY, sW, sH);
    }

    // High Scores Button (226x34)
    const scoreImg = this.menuHoverButton === 'score' ? this.menuImages['menu_score_h'] : this.menuImages['menu_score_n'];
    if (scoreImg && scoreImg.complete) {
      const scW = 226;
      const scH = 40;
      const scX = (this.width - scW) / 2;
      const scY = this.height * 0.72;
      ctx.drawImage(scoreImg, scX, scY, scW, scH);
    }

    // Help / Instructions Button (121x31)
    const helpImg = this.menuHoverButton === 'help' ? this.menuImages['menu_help_h'] : this.menuImages['menu_help_n'];
    if (helpImg && helpImg.complete) {
      const hW = 145;
      const hH = 38;
      const hX = (this.width - hW) / 2;
      const hY = this.height * 0.83;
      ctx.drawImage(helpImg, hX, hY, hW, hH);
    }

    // 4. Draw Bullet Holes on Menu
    const bulletHoleImg = this.menuImages['menu_hole'] || this.sprites['hole'];
    if (bulletHoleImg && bulletHoleImg.complete) {
      const bW = bulletHoleImg.naturalWidth || 35;
      const bH = bulletHoleImg.naturalHeight || 37;
      for (const hole of this.menuBulletHoles) {
        ctx.save();
        ctx.translate(Math.round(hole.x), Math.round(hole.y));
        ctx.rotate(hole.rotation);
        const s = hole.scale || 1.0;
        ctx.drawImage(bulletHoleImg, -Math.round((bW * s) / 2), -Math.round((bH * s) / 2), Math.round(bW * s), Math.round(bH * s));
        ctx.restore();
      }
    }

    // 5. Render Particles (casing ejections, smoke puffs, feathers)
    this.particles.render(ctx, this.sprites);

    ctx.restore();

    // 6. Custom Crosshair Cursor
    this.renderCursor();
  }

  checkMenuHover(x, y) {
    // Start button (145x42 centered at y = 0.61)
    const sW = 145, sH = 42;
    const sX = (this.width - sW) / 2;
    const sY = this.height * 0.61;
    if (x >= sX && x <= sX + sW && y >= sY && y <= sY + sH) {
      this.menuHoverButton = 'start';
      return;
    }

    // Score button (226x40 centered at y = 0.72)
    const scW = 226, scH = 40;
    const scX = (this.width - scW) / 2;
    const scY = this.height * 0.72;
    if (x >= scX && x <= scX + scW && y >= scY && y <= scY + scH) {
      this.menuHoverButton = 'score';
      return;
    }

    // Help button (145x38 centered at y = 0.83)
    const hW = 145, hH = 38;
    const hX = (this.width - hW) / 2;
    const hY = this.height * 0.83;
    if (x >= hX && x <= hX + hW && y >= hY && y <= hY + hH) {
      this.menuHoverButton = 'help';
      return;
    }

    this.menuHoverButton = null;
  }

  handleMenuClick(x, y) {
    // 1. Fire shotgun blast!
    window.audioManager.playSfx('shoot', 1.0, 0.05);
    this.cursorFlashTimer = 6;
    this.menuRecoilTimer = 6;

    // 2. Spawn spent shotgun casing and smoke puff
    this.particles.spawnCasing(x, y);
    this.particles.spawnSmoke(x, y, 7);

    // 3. Stamp bullet hole decal
    this.menuBulletHoles.push({
      x: x,
      y: y,
      rotation: Math.random() * Math.PI * 2,
      scale: 0.85 + Math.random() * 0.3
    });
    if (this.menuBulletHoles.length > 50) {
      this.menuBulletHoles.shift();
    }

    // 4. Check if player shot the chicken in the top hole!
    const holeImg = this.menuImages[`chickenhole${this.menuHoleChickenFrame + 1}`];
    const hW = (holeImg && holeImg.naturalWidth) || 54;
    const hH = (holeImg && holeImg.naturalHeight) || 80;
    const holeX = this.width * 0.475 - hW / 2;
    const holeY = this.height * 0.37 - hH;

    if (x >= holeX - 15 && x <= holeX + hW + 15 && y >= holeY - 15 && y <= holeY + hH + 15) {
      window.audioManager.playSfx('hit1');
      window.audioManager.playSfx('bird', 1.0);
      this.particles.spawnFeathers(x, y, 16);
      this.menuHoleChickenFrame = 0;
      this.menuHoleTimer = -90; // Duck down in fear for ~1.5s
      return;
    }

    // 5. Check Menu interactive buttons
    this.checkMenuHover(x, y);
    if (this.menuHoverButton === 'start') {
      window.audioManager.playSfx('ready');
      setTimeout(() => {
        this.startNewGame();
      }, 220);
    } else if (this.menuHoverButton === 'score') {
      if (window.uiManager) {
        window.highScoreManager.renderTable();
        window.uiManager.openModal(window.uiManager.modalHighscores);
      }
    } else if (this.menuHoverButton === 'help') {
      if (window.uiManager) {
        window.uiManager.openModal(window.uiManager.modalHelp);
      }
    }
  }

  renderLoading() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0c0704';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.font = window.i18n.getFont(26, true);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd659';
    const loadingText = window.i18n.currentLang === 'vi' ? 'ĐANG TẢI DỮ LIỆU MOORHUHN...' : 'LOADING MOORHUHN DATA...';
    ctx.fillText(loadingText, this.width / 2, this.height / 2 - 20);
  }

  // Draw custom Moorhuhn crosshair
  renderCursor() {
    if (!this.isMouseInsideCanvas) return;
    const ctx = this.ctx;
    const cursorImg = (this.cursorFlashTimer > 0) ? this.sprites['cursor_red'] : this.sprites['cursor_normal'];

    if (cursorImg && cursorImg.complete) {
      ctx.drawImage(
        cursorImg,
        Math.round(this.cursorScreenX - 16),
        Math.round(this.cursorScreenY - 16),
        32, 32
      );
    } else {
      // Fallback crosshair
      ctx.save();
      ctx.strokeStyle = this.cursorFlashTimer > 0 ? '#ff0000' : '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.cursorScreenX, this.cursorScreenY, 12, 0, Math.PI * 2);
      ctx.moveTo(this.cursorScreenX - 18, this.cursorScreenY);
      ctx.lineTo(this.cursorScreenX + 18, this.cursorScreenY);
      ctx.moveTo(this.cursorScreenX, this.cursorScreenY - 18);
      ctx.lineTo(this.cursorScreenX, this.cursorScreenY + 18);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Main Animation Loop
  run() {
    this.lastTime = performance.now();
    const loop = (currentTime) => {
      const rawDelta = currentTime - this.lastTime;
      this.lastTime = currentTime;
      const dt = Math.max(0.2, Math.min(2.0, rawDelta / (1000 / 60)));

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.MoorhuhnEngine = MoorhuhnEngine;
