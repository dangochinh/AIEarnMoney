/**
 * Moorhuhn Jagd / Crazy Chicken - Interactive Entities
 * Complete original entity system: Flying Moorhuhns (3 depth tiers),
 * Big Chicken, Windmill with blade chickens, Scarecrow & Hat, Signpost,
 * Balloon, Airplane, Tree branches, Peeking Chicken, Pumpkins, and Particles.
 */

// -------------------------------------------------------------
// 1. MOORHUHN (CHICKEN)
// -------------------------------------------------------------
class Chicken {
  constructor(tier = 'mid', x = null, y = null, direction = null) {
    this.tier = tier; // 'far', 'mid', 'close'
    this.alive = true;
    this.isDying = false;

    // Setup tier-specific properties
    if (this.tier === 'far') {
      this.width = 30;
      this.height = 20;
      this.points = 25;
      this.baseSpeed = 0.85 + Math.random() * 0.45;
      this.y = y !== null ? y : 40 + Math.random() * 140;
      // High-res mapping: chickl2 (60x40/frame) provides 2x crisp super-sampling for 30x20
      this.spriteLeft = 'chickl2';
      this.spriteRight = 'chickr2';
      this.spriteDead = 'chickd2';
      this.sourceWidth = 60;
      this.sourceHeight = 40;
      this.spriteLeftFallback = 'chickl3';
      this.spriteRightFallback = 'chickr3';
      this.spriteDeadFallback = 'chickd3';
      this.parallax = 0.65;
    } else if (this.tier === 'mid') {
      this.width = 60;
      this.height = 40;
      this.points = 10;
      this.baseSpeed = 1.45 + Math.random() * 0.60;
      this.y = y !== null ? y : 110 + Math.random() * 180;
      // High-res mapping: chickl (120x80/frame) provides 2x crisp super-sampling for 60x40
      this.spriteLeft = 'chickl';
      this.spriteRight = 'chickr';
      this.spriteDead = 'chickd';
      this.sourceWidth = 120;
      this.sourceHeight = 80;
      this.spriteLeftFallback = 'chickl2';
      this.spriteRightFallback = 'chickr2';
      this.spriteDeadFallback = 'chickd2';
      this.parallax = 0.85;
    } else {
      // 'close'
      this.width = 120;
      this.height = 80;
      this.points = 5;
      this.baseSpeed = 2.10 + Math.random() * 0.75;
      this.y = y !== null ? y : 160 + Math.random() * 220;
      // High-res mapping: chickl_hd (240x160/frame) provides 2x crisp super-sampling for 120x80
      this.spriteLeft = 'chickl_hd';
      this.spriteRight = 'chickr_hd';
      this.spriteDead = 'chickd_hd';
      this.sourceWidth = 240;
      this.sourceHeight = 160;
      this.spriteLeftFallback = 'chickl';
      this.spriteRightFallback = 'chickr';
      this.spriteDeadFallback = 'chickd';
      this.parallax = 1.0;
    }

    // Direction: 1 for right, -1 for left
    this.direction = direction !== null ? direction : (Math.random() < 0.5 ? 1 : -1);
    this.x = x !== null ? x : (this.direction === 1 ? -150 : 2070);

    // Animation frames (19 frames total)
    this.currentFrame = Math.floor(Math.random() * 19);
    this.animTimer = 0;
    this.animInterval = 4.5; // ~13.5 FPS authentic wing flap animation

    // Organic sine-wave vertical bobbing
    this.startY = this.y;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.bobFreq = 0.025 + Math.random() * 0.015;
    this.bobAmp = 6 + Math.random() * 10;

    // Death physics
    this.vy = 0;
    this.gravity = 0.55;
    this.deadFrame = 0;
    this.deadAnimTimer = 0;
  }

  update(dt = 1.0) {
    if (this.alive) {
      // Horizontal motion
      this.x += this.direction * this.baseSpeed * dt;

      // Vertical sinusoidal bobbing
      this.bobPhase += this.bobFreq * dt;
      this.y = this.startY + Math.sin(this.bobPhase) * this.bobAmp;

      // Flap animation
      this.animTimer += dt;
      if (this.animTimer >= this.animInterval) {
        this.animTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % 19;
      }
    } else if (this.isDying) {
      // Falling death animation
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.x += (this.direction * 0.4) * dt;

      this.deadAnimTimer += dt;
      if (this.deadAnimTimer >= 2.5) {
        this.deadAnimTimer = 0;
        if (this.deadFrame < 18) {
          this.deadFrame++;
        }
      }
    }
  }

  // Hit test against screen-space cursor click
  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.alive) return false;

    const screenPos = camera.worldToScreen(this.x, this.y, this.parallax);
    // Add slightly generous hitbox for better shooter feel
    const pad = this.width * 0.15;
    const hitLeft = screenPos.x - pad;
    const hitRight = screenPos.x + this.width + pad;
    const hitTop = screenPos.y - pad;
    const hitBottom = screenPos.y + this.height + pad;

    if (clickScreenX >= hitLeft && clickScreenX <= hitRight &&
        clickScreenY >= hitTop && clickScreenY <= hitBottom) {
      this.kill();
      return true;
    }
    return false;
  }

  kill() {
    this.alive = false;
    this.isDying = true;
    this.vy = -3.5; // Slight pop upward before falling
  }

  isOutOfBounds() {
    if (this.isDying && this.y > 540) return true;
    if (this.direction === 1 && this.x > 2150) return true;
    if (this.direction === -1 && this.x < -250) return true;
    return false;
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.x, this.y, this.parallax);

    // Skip rendering if completely off-screen
    if (screenPos.x + this.width < -50 || screenPos.x > camera.viewportWidth + 50 ||
        screenPos.y + this.height < -50 || screenPos.y > camera.viewportHeight + 50) {
      return;
    }

    let spriteName = this.direction === 1 ? this.spriteRight : this.spriteLeft;
    let fallbackName = this.direction === 1 ? this.spriteRightFallback : this.spriteLeftFallback;
    let frame = this.currentFrame;

    if (this.isDying) {
      spriteName = this.spriteDead;
      fallbackName = this.spriteDeadFallback;
      frame = this.deadFrame;
    }

    let spriteImg = sprites[spriteName];
    let srcW = this.sourceWidth || this.width;
    let srcH = this.sourceHeight || this.height;

    if (!spriteImg || !spriteImg.complete) {
      spriteImg = sprites[fallbackName];
      srcW = this.width;
      srcH = this.height;
    }

    if (!spriteImg || !spriteImg.complete) return;

    // Draw from vertical spritesheet with high-definition supersampling
    ctx.drawImage(
      spriteImg,
      0, frame * srcH, srcW, srcH,
      Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
    );
  }
}

// -------------------------------------------------------------
// 2. BIG CHICKEN (IN-YOUR-FACE GIANT CHICKEN)
// -------------------------------------------------------------
class BigChicken {
  constructor(camera) {
    this.alive = true;
    this.isDying = false;
    this.width = 200;
    this.height = 256;
    this.points = 25;

    // Position centered in current view
    this.screenX = camera.viewportWidth * 0.5 - 100 + (Math.random() * 120 - 60);
    this.screenY = camera.viewportHeight - 240;

    // Convert to world pos so it scrolls naturally with camera
    const worldPos = camera.screenToWorld(this.screenX, this.screenY, 1.0);
    this.worldX = worldPos.x;
    this.worldY = worldPos.y;

    this.frame = 0;
    this.animTimer = 0;
    this.timer = 0;
    this.maxDuration = 220; // ~3.6 seconds on screen before ducking away

    this.deadFrame = 0;
    this.deadTimer = 0;
    this.finished = false;
  }

  update(dt = 1.0) {
    if (this.alive) {
      this.timer += dt;
      this.animTimer += dt;
      if (this.animTimer >= 5) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 15;
      }

      if (this.timer >= this.maxDuration) {
        // Ducks down smoothly
        this.worldY += 7 * dt;
        if (this.worldY > 520) {
          this.finished = true;
        }
      }
    } else if (this.isDying) {
      this.deadTimer += dt;
      this.worldY += 5 * dt; // Drops downward
      if (this.deadTimer >= 3) {
        this.deadTimer = 0;
        this.deadFrame++;
        if (this.deadFrame >= 17) {
          this.finished = true;
        }
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.alive || this.timer >= this.maxDuration) return false;

    const screenPos = camera.worldToScreen(this.worldX, this.worldY, 1.0);
    if (clickScreenX >= screenPos.x && clickScreenX <= screenPos.x + this.width &&
        clickScreenY >= screenPos.y && clickScreenY <= screenPos.y + this.height) {
      this.alive = false;
      this.isDying = true;
      return true;
    }
    return false;
  }

  render(ctx, camera, sprites) {
    if (this.finished) return;
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, 1.0);

    const isDead = this.isDying;
    let spriteImg = isDead ? sprites['bighit_hd'] : sprites['big1_hd'];
    let srcW = 400;
    let srcH = 512;

    if (!spriteImg || !spriteImg.complete) {
      spriteImg = isDead ? sprites['bighit'] : sprites['big1'];
      srcW = 200;
      srcH = 256;
    }

    if (!spriteImg || !spriteImg.complete) return;

    const frame = isDead ? this.deadFrame : this.frame;

    ctx.drawImage(
      spriteImg,
      0, frame * srcH, srcW, srcH,
      Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
    );
  }
}

// -------------------------------------------------------------
// 3. WINDMILL WITH 4 ROTATING BLADES & CHICKENS
// -------------------------------------------------------------
const BLADE_FRAME_ANGLES = [
  -1.5928, -1.4521, -1.3159, -1.1828, -1.049, -0.9145, -0.777, -0.6335, -0.4827,
  -0.3223, -0.1508, 0.0341, 0.2332, 0.4445, 0.6613, 0.8818, 1.0989, 1.3071,
  1.5058, 1.6926, 1.8705, 2.0401, 2.2043, 2.3654, 2.5267, 2.6887, 2.8545,
  3.023, -3.0878, -2.9115, -2.7337, -2.556, -2.3823, -2.211, -2.0465, -1.889, -1.7372
];

class Windmill {
  constructor(worldX = 1478, worldY = 140) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.width = 260;
    this.height = 250;
    this.parallax = 0.80;

    this.bladeFrame = 0;
    this.animTimer = 0;

    // 4 distinct windmill blades at 90-degree intervals (37 frames total)
    this.blades = [
      { id: 0, offset: 0, intact: true, falling: false, fallX: 0, fallY: 0, fallVx: 0, fallVy: 0, fallRotation: 0, fallRotSpeed: 0, savedFrame: 0, respawnTimer: 0 },
      { id: 1, offset: 9, intact: true, falling: false, fallX: 0, fallY: 0, fallVx: 0, fallVy: 0, fallRotation: 0, fallRotSpeed: 0, savedFrame: 0, respawnTimer: 0 },
      { id: 2, offset: 18, intact: true, falling: false, fallX: 0, fallY: 0, fallVx: 0, fallVy: 0, fallRotation: 0, fallRotSpeed: 0, savedFrame: 0, respawnTimer: 0 },
      { id: 3, offset: 28, intact: true, falling: false, fallX: 0, fallY: 0, fallVx: 0, fallVy: 0, fallRotation: 0, fallRotSpeed: 0, savedFrame: 0, respawnTimer: 0 }
    ];

    // Chickens riding on the blades
    this.bladeChickens = [
      { id: 0, alive: true, respawnTimer: 0 },
      { id: 1, alive: true, respawnTimer: 0 },
      { id: 2, alive: true, respawnTimer: 0 },
      { id: 3, alive: true, respawnTimer: 0 }
    ];
    this.chickieAnimFrame = 0;
  }

  getBladeAngle(blade) {
    const f = (this.bladeFrame + blade.offset) % 37;
    return BLADE_FRAME_ANGLES[f];
  }

  getBladeChickenPos(blade) {
    const hubX = this.worldX + 118;
    const hubY = this.worldY + 108;
    const angle = this.getBladeAngle(blade);
    const radius = 68;

    return {
      x: hubX + Math.cos(angle) * radius - 8,
      y: hubY + Math.sin(angle) * radius - 6
    };
  }

  update(dt = 1.0) {
    // 1. Rotate windmill wings (37 frames)
    this.animTimer += dt;
    if (this.animTimer >= 2.5) {
      this.animTimer = 0;
      this.bladeFrame = (this.bladeFrame + 1) % 37;
      this.chickieAnimFrame = (this.chickieAnimFrame + 1) % 19;
    }

    // 2. Update falling detached blades (once shot off, they stay destroyed for the rest of the round)
    this.blades.forEach((blade) => {
      if (blade.falling) {
        blade.fallX += blade.fallVx * dt;
        blade.fallY += blade.fallVy * dt;
        blade.fallVy += 0.38 * dt; // Gravity
        blade.fallRotation += blade.fallRotSpeed * dt;
        if (blade.fallY > 520) {
          blade.falling = false;
        }
      }
    });

    // 3. Chicken on blade does not respawn if blade is shot down
    this.bladeChickens.forEach((chick, idx) => {
      const blade = this.blades[idx];
      if (!chick.alive && blade.intact) {
        chick.respawnTimer += dt;
        if (chick.respawnTimer > 700) {
          chick.alive = true;
          chick.respawnTimer = 0;
        }
      }
    });
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    const hubScreen = camera.worldToScreen(this.worldX + 118, this.worldY + 108, this.parallax);
    const dx = clickScreenX - hubScreen.x;
    const dy = clickScreenY - hubScreen.y;
    const dist = Math.hypot(dx, dy);

    // 1. Check if clicked directly on a chicken on an intact blade
    for (let blade of this.blades) {
      if (!blade.intact) continue;
      const chick = this.bladeChickens[blade.id];
      if (!chick || !chick.alive) continue;

      const chickPos = this.getBladeChickenPos(blade);
      const scr = camera.worldToScreen(chickPos.x + 8, chickPos.y + 6, this.parallax);
      const dChick = Math.hypot(clickScreenX - scr.x, clickScreenY - scr.y);
      if (dChick <= 22) {
        chick.alive = false;
        chick.respawnTimer = 0;

        // Blade breaks and tumbles down!
        blade.intact = false;
        blade.falling = true;
        blade.fallX = this.worldX;
        blade.fallY = this.worldY;
        blade.fallVy = -2.5;
        blade.fallVx = (Math.random() * 2 - 1) * 1.5;
        blade.fallRotation = 0;
        blade.fallRotSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.05);
        blade.savedFrame = (this.bladeFrame + blade.offset) % 37;
        blade.respawnTimer = 0;

        const allDestroyed = this.blades.every(b => !b.intact);
        return { hit: true, points: allDestroyed ? 50 : 25, allDestroyed, hitChicken: true, x: chickPos.x, y: chickPos.y };
      }
    }

    // 2. Check if clicked along any intact blade sail (radius 16px to 118px)
    if (dist >= 16 && dist <= 118) {
      const clickAngle = Math.atan2(dy, dx);

      for (let blade of this.blades) {
        if (!blade.intact) continue;

        const bladeAngle = this.getBladeAngle(blade);
        let angleDiff = clickAngle - bladeAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Angular thickness of blade sail (~18 degrees)
        if (Math.abs(angleDiff) <= 0.32) {
          // Break off and tumble this blade!
          blade.intact = false;
          blade.falling = true;
          blade.fallX = this.worldX;
          blade.fallY = this.worldY;
          blade.fallVy = -2.5;
          blade.fallVx = (Math.random() * 2 - 1) * 1.5;
          blade.fallRotation = 0;
          blade.fallRotSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.05);
          blade.savedFrame = (this.bladeFrame + blade.offset) % 37;
          blade.respawnTimer = 0;

          const chick = this.bladeChickens[blade.id];
          let hitChicken = false;
          if (chick && chick.alive) {
            chick.alive = false;
            hitChicken = true;
          }

          const allDestroyed = this.blades.every(b => !b.intact);
          return {
            hit: true,
            points: allDestroyed ? 50 : 25,
            allDestroyed,
            hitChicken: hitChicken,
            x: this.worldX + 118 + Math.cos(bladeAngle) * dist,
            y: this.worldY + 108 + Math.sin(bladeAngle) * dist
          };
        }
      }
    }

    return { hit: false };
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);

    // 1. Draw Mill Base Tower
    const millImg = sprites['windmill'];
    if (millImg && millImg.complete) {
      ctx.drawImage(millImg, Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height);
    }

    // 2. Draw 4 Rotating Wings & Falling Blades
    const wingImg = sprites['wing'];
    if (wingImg && wingImg.complete) {
      // 2a. Draw intact rotating blades (all 4 sails!)
      this.blades.forEach((blade) => {
        if (!blade.intact) return;
        const currentFrame = (this.bladeFrame + blade.offset) % 37;
        ctx.drawImage(
          wingImg,
          0, currentFrame * this.height, this.width, this.height,
          Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
        );
      });

      // 2b. Draw falling / shot-off detached blades tumbling down!
      this.blades.forEach((blade) => {
        if (!blade.falling) return;
        const scr = camera.worldToScreen(blade.fallX, blade.fallY, this.parallax);
        ctx.save();
        ctx.translate(scr.x + 118, scr.y + 108);
        ctx.rotate(blade.fallRotation);
        ctx.drawImage(
          wingImg,
          0, blade.savedFrame * this.height, this.width, this.height,
          -118, -108, this.width, this.height
        );
        ctx.restore();
      });
    }

    // 3. Draw Blade Chickens riding intact sails
    const chickieImg = sprites['chickie_hd'] || sprites['chickie'];
    const isHdChickie = (chickieImg === sprites['chickie_hd']);
    const srcW = isHdChickie ? 16 : 8;
    const srcH = isHdChickie ? 12 : 6;
    if (chickieImg && chickieImg.complete) {
      this.blades.forEach((blade) => {
        if (!blade.intact) return;
        const chick = this.bladeChickens[blade.id];
        if (!chick || !chick.alive) return;

        const pos = this.getBladeChickenPos(blade);
        const scr = camera.worldToScreen(pos.x, pos.y, this.parallax);

        ctx.drawImage(
          chickieImg,
          0, this.chickieAnimFrame * srcH, srcW, srcH,
          Math.round(scr.x), Math.round(scr.y), 16, 12
        );
      });
    }
  }
}

// -------------------------------------------------------------
// 4. SCARECROW & FLYING HAT
// -------------------------------------------------------------
class Scarecrow {
  constructor(worldX = 1218, worldY = 270) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.width = 132;
    this.height = 127;
    this.parallax = 0.80;

    this.hasHat = true;
    this.isHatFlying = false;
    this.hatFrame = 0;
    this.hatTimer = 0;
    this.hatX = this.worldX;
    this.hatY = this.worldY;
    this.hatVy = 0;
    this.hatVx = 0;
    this.respawnTimer = 0;
  }

  update(dt = 1.0) {
    if (this.isHatFlying) {
      this.hatX += this.hatVx * dt;
      this.hatY += this.hatVy * dt;
      this.hatVy += 0.25 * dt; // Gravity

      this.hatTimer += dt;
      if (this.hatTimer >= 2.5) {
        this.hatTimer = 0;
        this.hatFrame = (this.hatFrame + 1) % 20;
      }

      if (this.hatY > 520) {
        this.isHatFlying = false;
        this.hasHat = false;
        this.respawnTimer = 0;
      }
    } else if (!this.hasHat) {
      this.respawnTimer += dt;
      if (this.respawnTimer > 600) { // Respawn after 10s
        this.hasHat = true;
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.hasHat) return false;

    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    // Scarecrow Hat region (top 45% of scarecrow)
    const hatLeft = screenPos.x + 30;
    const hatRight = screenPos.x + 102;
    const hatTop = screenPos.y;
    const hatBottom = screenPos.y + 55;

    if (clickScreenX >= hatLeft && clickScreenX <= hatRight &&
        clickScreenY >= hatTop && clickScreenY <= hatBottom) {
      this.hasHat = false;
      this.isHatFlying = true;
      this.hatX = this.worldX;
      this.hatY = this.worldY;
      this.hatVy = -6.5;
      this.hatVx = (Math.random() * 2 - 1) * 2.5;
      return true;
    }
    return false;
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);

    // 1. Draw Scarecrow body
    const scareImg = sprites['scare'];
    if (scareImg && scareImg.complete) {
      ctx.drawImage(scareImg, Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height);
    }

    // 2. Draw Hat (if on head)
    const hatImg = sprites['hat'];
    if (hatImg && hatImg.complete) {
      if (this.hasHat && !this.isHatFlying) {
        ctx.drawImage(
          hatImg,
          0, 0, this.width, this.height,
          Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
        );
      } else if (this.isHatFlying) {
        const hatScreen = camera.worldToScreen(this.hatX, this.hatY, this.parallax);
        ctx.drawImage(
          hatImg,
          0, this.hatFrame * this.height, this.width, this.height,
          Math.round(hatScreen.x), Math.round(hatScreen.y), this.width, this.height
        );
      }
    }
  }
}

// -------------------------------------------------------------
// 5. SIGNPOST (RETIRED - REPLACED BY AUTHENTIC AIRPLANE BANNER)
// -------------------------------------------------------------
class Signpost {
  constructor() {
    this.active = false;
  }
  update() {}
  checkHit() { return false; }
  render() {}
}

// -------------------------------------------------------------
// 6. HOT AIR BALLOON (FLOATING IN SKY)
// -------------------------------------------------------------
class Balloon {
  constructor() {
    this.reset();
  }

  reset() {
    this.alive = true;
    this.isPopping = false;
    this.width = 80;
    this.height = 100;
    this.points = -25;
    this.parallax = 0.35;

    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.worldX = this.direction === 1 ? -120 : 2040;
    this.worldY = 30 + Math.random() * 80;
    this.speed = 0.7 + Math.random() * 0.5;

    this.frame = 0;
    this.animTimer = 0;
    this.popVy = 0;
  }

  update(dt = 1.0) {
    if (this.alive) {
      this.worldX += this.direction * this.speed * dt;
      this.animTimer += dt;
      if (this.animTimer >= 6) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 21;
      }
      if ((this.direction === 1 && this.worldX > 2100) ||
          (this.direction === -1 && this.worldX < -200)) {
        this.reset();
      }
    } else if (this.isPopping) {
      this.popVy += 0.4 * dt;
      this.worldY += this.popVy * dt;
      if (this.worldY > 520) {
        this.reset();
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.alive) return false;
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    if (clickScreenX >= screenPos.x && clickScreenX <= screenPos.x + this.width &&
        clickScreenY >= screenPos.y && clickScreenY <= screenPos.y + this.height) {
      this.alive = false;
      this.isPopping = true;
      this.popVy = 2.0;
      return true;
    }
    return false;
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    const spriteImg = sprites['balloon'];
    if (!spriteImg || !spriteImg.complete) return;

    ctx.drawImage(
      spriteImg,
      0, this.frame * this.height, this.width, this.height,
      screenPos.x, screenPos.y, this.width, this.height
    );
  }
}

// -------------------------------------------------------------
// 7. AIRPLANE WITH TOWED BANNER (JOHNNIE WALKER RED BANNER)
// -------------------------------------------------------------
class Plane {
  constructor() {
    this.active = false;
    this.planeWidth = 100;
    this.planeHeight = 97;
    this.bannerWidth = 175;
    this.bannerHeight = 100;
    this.parallax = 0.45;

    this.spawnTimer = 0;
    this.nextSpawn = 240 + Math.random() * 300; // Spawns after 4-9s into the game

    this.isCrashing = false;
    this.vy = 0;
    this.rotation = 0;
    this.rotSpeed = 0;
    this.flutterPhase = 0;
    this.lastScreenX = 0;
    this.lastScreenY = 0;
  }

  spawn() {
    this.active = true;
    this.isCrashing = false;
    this.vy = 0;
    this.rotation = 0;
    this.rotSpeed = 0;
    this.flutterPhase = 0;
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.worldX = this.direction === 1 ? -320 : 2240;
    this.worldY = 35 + Math.random() * 75;
    this.speed = 2.2 + Math.random() * 0.7;
    this.frame = 0;
    this.animTimer = 0;
  }

  update(dt = 1.0, particles = null) {
    if (!this.active) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.nextSpawn) {
        this.spawnTimer = 0;
        this.nextSpawn = 600 + Math.random() * 800; // Next flight in 10-23 seconds
        this.spawn();
      }
      return;
    }

    if (!this.isCrashing) {
      this.worldX += this.direction * this.speed * dt;
      this.flutterPhase += 0.18 * dt;

      this.animTimer += dt;
      if (this.animTimer >= 3.5) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 20;
      }

      // Check bounds
      if ((this.direction === 1 && this.worldX > 2300) ||
          (this.direction === -1 && this.worldX < -450)) {
        this.active = false;
      }
    } else {
      // Crashing physics
      this.worldX += (this.direction * this.speed * 0.5) * dt;
      this.vy += 0.35 * dt;
      this.worldY += this.vy * dt;
      this.rotation += this.rotSpeed * dt;
      this.flutterPhase += 0.3 * dt;

      // Spawn trailing black smoke puffs
      if (particles && Math.random() < 0.6) {
        particles.spawnSmoke(this.lastScreenX + 50, this.lastScreenY + 40, 2);
      }

      if (this.worldY > 550) {
        this.active = false;
        this.isCrashing = false;
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.active || this.isCrashing) return false;

    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    let planeHit = false;
    let bannerHit = false;

    if (this.direction === -1) {
      // Plane facing left
      const pLeft = screenPos.x + 10;
      const pRight = screenPos.x + 85;
      const pTop = screenPos.y + 20;
      const pBottom = screenPos.y + 60;
      if (clickScreenX >= pLeft && clickScreenX <= pRight && clickScreenY >= pTop && clickScreenY <= pBottom) {
        planeHit = true;
      }

      // Banner trailing to the right
      const bLeft = screenPos.x + 85;
      const bRight = screenPos.x + 258;
      const bTop = screenPos.y + 35;
      const bBottom = screenPos.y + 68;
      if (clickScreenX >= bLeft && clickScreenX <= bRight && clickScreenY >= bTop && clickScreenY <= bBottom) {
        bannerHit = true;
      }
    } else {
      // Plane facing right
      const pLeft = screenPos.x + 15;
      const pRight = screenPos.x + 90;
      const pTop = screenPos.y + 20;
      const pBottom = screenPos.y + 60;
      if (clickScreenX >= pLeft && clickScreenX <= pRight && clickScreenY >= pTop && clickScreenY <= pBottom) {
        planeHit = true;
      }

      // Banner trailing to the left
      const bLeft = screenPos.x - 170;
      const bRight = screenPos.x + 5;
      const bTop = screenPos.y + 35;
      const bBottom = screenPos.y + 68;
      if (clickScreenX >= bLeft && clickScreenX <= bRight && clickScreenY >= bTop && clickScreenY <= bBottom) {
        bannerHit = true;
      }
    }

    if (planeHit || bannerHit) {
      this.isCrashing = true;
      this.vy = -1.8;
      this.rotSpeed = (this.direction === -1 ? -1 : 1) * 0.04;
      return true;
    }

    return false;
  }

  render(ctx, camera, sprites) {
    if (!this.active) return;
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    this.lastScreenX = screenPos.x;
    this.lastScreenY = screenPos.y;

    const planeImg = sprites['plane'];
    const signImg = sprites['sign'];
    if (!planeImg || !planeImg.complete) return;

    ctx.save();

    if (this.isCrashing) {
      ctx.translate(screenPos.x + 50, screenPos.y + 40);
      ctx.rotate(this.rotation);
      ctx.translate(-(screenPos.x + 50), -(screenPos.y + 40));
    }

    const flutterY = Math.sin(this.flutterPhase) * 3;

    if (this.direction === -1) {
      // Flying RIGHT to LEFT (moving left)
      // 1. Tow cable from plane tail to banner front
      const tailX = screenPos.x + 72;
      const tailY = screenPos.y + 40;
      const bannerX = screenPos.x + 85;
      const bannerY = screenPos.y + flutterY;
      const bannerAttachX = bannerX + 6;
      const bannerAttachY = bannerY + 52;

      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(bannerAttachX, bannerAttachY);
      ctx.stroke();

      // 2. Draw Towed Banner (sign.png)
      if (signImg && signImg.complete) {
        ctx.drawImage(
          signImg,
          Math.round(bannerX), Math.round(bannerY),
          this.bannerWidth, this.bannerHeight
        );
      }

      // 3. Draw Plane (mirrored horizontally so it faces left)
      ctx.save();
      ctx.translate(screenPos.x + this.planeWidth, screenPos.y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        planeImg,
        0, this.frame * this.planeHeight, this.planeWidth, this.planeHeight,
        0, 0, this.planeWidth, this.planeHeight
      );
      ctx.restore();
    } else {
      // Flying LEFT to RIGHT (moving right)
      // 1. Tow cable from plane tail to banner rear/front
      const tailX = screenPos.x + 28;
      const tailY = screenPos.y + 40;
      const bannerX = screenPos.x - 170;
      const bannerY = screenPos.y + flutterY;
      const bannerAttachX = bannerX + 172;
      const bannerAttachY = bannerY + 52;

      ctx.strokeStyle = '#2d2d2d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(bannerAttachX, bannerAttachY);
      ctx.stroke();

      // 2. Draw Towed Banner (sign.png)
      if (signImg && signImg.complete) {
        ctx.drawImage(
          signImg,
          Math.round(bannerX), Math.round(bannerY),
          this.bannerWidth, this.bannerHeight
        );
      }

      // 3. Draw Plane (faces right naturally)
      ctx.drawImage(
        planeImg,
        0, this.frame * this.planeHeight, this.planeWidth, this.planeHeight,
        Math.round(screenPos.x), Math.round(screenPos.y), this.planeWidth, this.planeHeight
      );
    }

    ctx.restore();
  }
}

// -------------------------------------------------------------
// 8. PEEKING / HIDING CHICKEN (RANDOM TREE & LANDSCAPE SPOTS)
// -------------------------------------------------------------
class PeekChicken {
  constructor(initialX = null, initialY = null) {
    this.width = 48;
    this.height = 72;
    this.parallax = 1.0;

    // Rich dynamic hiding spots across the tree, branches, trunk sides, roots & meadow
    this.hidingSpots = [
      // Tree canopy & high branches (Tán cây & cành cao)
      { x: 310, y: 115, type: 'branch', name: 'Cành cao' },
      { x: 405, y: 145, type: 'branch', name: 'Cành ngang phải' },
      { x: 275, y: 140, type: 'branch', name: 'Tán lá rậm' },
      // Tree trunk sides (Nhô ra từ thân cây trái / phải)
      { x: 235, y: 205, type: 'trunk_left', name: 'Thân cây trái' },
      { x: 425, y: 235, type: 'trunk_right', name: 'Thân cây phải' },
      { x: 335, y: 185, type: 'branch', name: 'Chạc cây giữa' },
      // Base of tree & roots (Gốc cây & bụi rậm quanh rễ)
      { x: 260, y: 315, type: 'root', name: 'Gốc cây trái' },
      { x: 380, y: 335, type: 'root', name: 'Gốc cây phải' },
      // Field ground hole (Hố đất giữa đồng cỏ)
      { x: 640, y: 375, type: 'hole', name: 'Hố đất giữa đồng' },
      // Midground meadow bushes (Bụi rậm cánh đồng)
      { x: 920, y: 350, type: 'bush', name: 'Bụi cây cỏ' }
    ];

    this.currentSpotIndex = Math.floor(Math.random() * this.hidingSpots.length);
    const spot = this.hidingSpots[this.currentSpotIndex];
    this.worldX = initialX !== null ? initialX : spot.x;
    this.worldY = initialY !== null ? initialY : spot.y;
    this.spotType = spot.type;

    this.alive = true;
    this.isPeeking = false;
    this.frame = 0;
    this.timer = 0;
    this.animTimer = 0;
    this.peekDuration = 0;
    this.maxPeekDuration = 130;
    this.peekInterval = 100 + Math.random() * 160; // Every 1.8 - 4.5 seconds

    // Falling / death physics when shot
    this.isFalling = false;
    this.fallVx = 0;
    this.fallVy = 0;
    this.fallRotation = 0;
    this.fallRotSpeed = 0;
    this.deadAnimTimer = 0;
    this.deadFrame = 0;
  }

  pickNewSpot() {
    // Pick a new random spot different from the current one
    let newIndex = Math.floor(Math.random() * this.hidingSpots.length);
    if (newIndex === this.currentSpotIndex) {
      newIndex = (newIndex + 1) % this.hidingSpots.length;
    }
    this.currentSpotIndex = newIndex;
    const spot = this.hidingSpots[newIndex];
    this.worldX = spot.x;
    this.worldY = spot.y;
    this.spotType = spot.type;
  }

  update(dt = 1.0) {
    // 1. If currently falling after being shot from tree
    if (this.isFalling) {
      this.worldX += this.fallVx * dt;
      this.worldY += this.fallVy * dt;
      this.fallVy += 0.42 * dt; // Gravity
      this.fallRotation += this.fallRotSpeed * dt;

      this.deadAnimTimer += dt;
      if (this.deadAnimTimer >= 3) {
        this.deadAnimTimer = 0;
        if (this.deadFrame < 18) this.deadFrame++;
      }

      // If fallen below the screen
      if (this.worldY > 540) {
        this.isFalling = false;
        this.isPeeking = false;
        this.timer = 0;
        this.peekInterval = 140 + Math.random() * 180;
        this.pickNewSpot();
      }
      return;
    }

    // 2. Waiting to peek
    if (!this.isPeeking) {
      this.timer += dt;
      if (this.timer >= this.peekInterval) {
        this.timer = 0;
        this.isPeeking = true;
        this.alive = true;
        this.frame = 0;
        this.animTimer = 0;
        this.peekDuration = 0;
        this.maxPeekDuration = 110 + Math.random() * 80;
        if (window.audioManager) {
          window.audioManager.playSfx('bird', 0.5);
        }
      }
      return;
    }

    // 3. Currently peeking out
    this.animTimer += dt;
    // Advance rising animation (frames 0 to 13)
    if (this.frame < 13) {
      if (this.animTimer >= 3.5) {
        this.animTimer = 0;
        this.frame++;
      }
    } else {
      // Hold peeking position and look around (frames 10-13)
      this.peekDuration += dt;
      if (this.animTimer >= 8) {
        this.animTimer = 0;
        this.frame = 10 + Math.floor(Math.random() * 4);
      }

      if (this.peekDuration >= this.maxPeekDuration) {
        // Duck back in and relocate!
        this.isPeeking = false;
        this.frame = 0;
        this.timer = 0;
        this.peekInterval = 120 + Math.random() * 160;
        this.pickNewSpot();
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.isPeeking || !this.alive || this.isFalling || this.frame < 2) return false;

    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    const pad = 12;

    if (
      clickScreenX >= screenPos.x - pad &&
      clickScreenX <= screenPos.x + this.width + pad &&
      clickScreenY >= screenPos.y - pad &&
      clickScreenY <= screenPos.y + this.height + pad
    ) {
      this.alive = false;

      // If on tree or branch, tumble down realistically!
      if (this.spotType !== 'hole') {
        this.isFalling = true;
        this.fallVy = -2.5;
        this.fallVx = (Math.random() * 2 - 1) * 1.5;
        this.fallRotation = 0;
        this.fallRotSpeed = (Math.random() < 0.5 ? 1 : -1) * 0.08;
        this.deadFrame = 0;
        this.deadAnimTimer = 0;
      } else {
        // Drop back into hole
        this.isPeeking = false;
        this.timer = 0;
        this.peekInterval = 140 + Math.random() * 180;
        this.pickNewSpot();
      }

      return {
        hit: true,
        points: 25,
        x: this.worldX + this.width / 2,
        y: this.worldY + this.height / 2
      };
    }

    return false;
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);

    // 1. If at ground hole, draw hole sprite underneath
    if (this.spotType === 'hole') {
      const holeImg = sprites['hole2'];
      if (holeImg && holeImg.complete) {
        ctx.drawImage(holeImg, Math.round(screenPos.x + 5), Math.round(screenPos.y + 48), 37, 31);
      }
    }

    // 2. Falling chicken death animation
    if (this.isFalling) {
      ctx.save();
      ctx.translate(Math.round(screenPos.x + this.width / 2), Math.round(screenPos.y + this.height / 2));
      ctx.rotate(this.fallRotation);

      let chickdImg = sprites['chickd_hd'];
      let srcW = 240, srcH = 160;
      if (!chickdImg || !chickdImg.complete) {
        chickdImg = sprites['chickd'];
        srcW = 120; srcH = 80;
      }
      if (!chickdImg || !chickdImg.complete) {
        chickdImg = sprites['chickd2'];
        srcW = 60; srcH = 40;
      }

      if (chickdImg && chickdImg.complete) {
        ctx.drawImage(
          chickdImg,
          0, Math.min(18, this.deadFrame) * srcH, srcW, srcH,
          -30, -20, 60, 40
        );
      } else {
        const guckImg = sprites['guck_hd'] || sprites['guck'];
        const gSrcH = (guckImg === sprites['guck_hd']) ? 144 : 72;
        const gSrcW = (guckImg === sprites['guck_hd']) ? 96 : 48;
        if (guckImg && guckImg.complete) {
          ctx.drawImage(guckImg, 0, 7 * gSrcH, gSrcW, gSrcH, -this.width / 2, -this.height / 2, this.width, this.height);
        }
      }
      ctx.restore();
      return;
    }

    // 3. Normal peeking animation
    if (this.isPeeking && this.alive) {
      const guckImg = sprites['guck_hd'] || sprites['guck'];
      const isHd = (guckImg === sprites['guck_hd']);
      const srcW = isHd ? 96 : 48;
      const srcH = isHd ? 144 : 72;
      if (guckImg && guckImg.complete) {
        ctx.drawImage(
          guckImg,
          0, this.frame * srcH, srcW, srcH,
          Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
        );
      }
    }
  }
}

// -------------------------------------------------------------
// 9. TREE BRANCH & FALLING LEAF
// -------------------------------------------------------------
class TreeBranch {
  constructor(worldX = 350, worldY = 160) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.width = 60;
    this.height = 60;
    this.parallax = 1.0;

    this.alive = true;
    this.isFalling = false;
    this.frame = 0;
    this.hitFrame = 0;
    this.animTimer = 0;
    this.vy = 0;
    this.respawnTimer = 0;
  }

  update(dt = 1.0) {
    if (this.alive) {
      this.animTimer += dt;
      if (this.animTimer >= 6) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 19;
      }
    } else if (this.isFalling) {
      this.vy += 0.35 * dt;
      this.worldY += this.vy * dt;
      this.animTimer += dt;
      if (this.animTimer >= 2.5) {
        this.animTimer = 0;
        this.hitFrame++;
        if (this.hitFrame >= 25 || this.worldY > 520) {
          this.isFalling = false;
          this.respawnTimer = 0;
        }
      }
    } else {
      this.respawnTimer += dt;
      if (this.respawnTimer > 700) {
        this.alive = true;
        this.worldY = 160;
      }
    }
  }

  checkHit(clickScreenX, clickScreenY, camera) {
    if (!this.alive) return false;
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);
    if (clickScreenX >= screenPos.x && clickScreenX <= screenPos.x + this.width &&
        clickScreenY >= screenPos.y && clickScreenY <= screenPos.y + this.height) {
      this.alive = false;
      this.isFalling = true;
      this.hitFrame = 0;
      this.vy = 1.0;
      return true;
    }
    return false;
  }

  render(ctx, camera, sprites) {
    const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.parallax);

    if (this.alive) {
      const leafImg = sprites['leaf'];
      if (leafImg && leafImg.complete) {
        ctx.drawImage(
          leafImg,
          0, this.frame * this.height, this.width, this.height,
          Math.round(screenPos.x), Math.round(screenPos.y), this.width, this.height
        );
      }
    } else if (this.isFalling) {
      const leafHitImg = sprites['leafhit'];
      if (leafHitImg && leafHitImg.complete) {
        ctx.drawImage(
          leafHitImg,
          0, this.hitFrame * 80, 80, 80,
          Math.round(screenPos.x - 10), Math.round(screenPos.y), 80, 80
        );
      }
    }
  }
}

// -------------------------------------------------------------
// 10. FLOATING SCORE POP-UP & PARTICLES
// -------------------------------------------------------------
class FloatingText {
  constructor(text, x, y, color = '#69db7c') {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.opacity = 1.0;
    this.vy = -1.8;
    this.lifetime = 50; // frames
    this.age = 0;
  }

  update(dt = 1.0) {
    this.y += this.vy * dt;
    this.age += dt;
    this.opacity = Math.max(0, 1.0 - (this.age / this.lifetime));
  }

  render(ctx) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = 'bold 28px "AA_Magnum", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    // Black stroke shadow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(this.text, this.x, this.y);

    // Text fill (pure white by default like original 1999)
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.feathers = [];
    this.casings = [];
    this.texts = [];
    this.smokes = [];
  }

  // Spawn smoke puff behind crashing plane
  spawnSmoke(screenX, screenY, count = 3) {
    for (let i = 0; i < count; i++) {
      this.smokes.push({
        x: screenX + (Math.random() * 12 - 6),
        y: screenY + (Math.random() * 12 - 6),
        vx: (Math.random() * 2 - 1) * 0.8,
        vy: -0.6 - Math.random() * 1.2,
        size: 3 + Math.random() * 4,
        opacity: 0.85,
        age: 0,
        maxAge: 30 + Math.random() * 20
      });
    }
  }

  // Spawn feather burst on chicken hit
  spawnFeathers(screenX, screenY, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.feathers.push({
        x: screenX,
        y: screenY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 2 - 1) * 0.1,
        size: 3 + Math.random() * 4,
        color: Math.random() < 0.65 ? '#ffffff' : '#d29b5c',
        opacity: 1.0,
        age: 0,
        maxAge: 40 + Math.random() * 25
      });
    }
  }

  // Eject spent shotgun shell casing
  spawnCasing(screenX, screenY) {
    this.casings.push({
      x: screenX,
      y: screenY,
      vx: 3.5 + Math.random() * 2.5,
      vy: -6.0 - Math.random() * 2.5,
      gravity: 0.45,
      frame: 0,
      animTimer: 0,
      rotation: 0,
      rotSpeed: 0.25 + Math.random() * 0.2
    });
  }

  addText(text, x, y, color = '#ffffff') {
    this.texts.push(new FloatingText(text, x, y, color));
  }

  update(dt = 1.0) {
    // 1. Update feathers
    for (let i = this.feathers.length - 1; i >= 0; i--) {
      const f = this.feathers[i];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += 0.12 * dt; // Light fluttering gravity
      f.vx *= 0.96;
      f.rotation += f.rotSpeed * dt;
      f.age += dt;
      f.opacity = Math.max(0, 1.0 - (f.age / f.maxAge));

      if (f.opacity <= 0 || f.y > 550) {
        this.feathers.splice(i, 1);
      }
    }

    // 2. Update casings
    for (let i = this.casings.length - 1; i >= 0; i--) {
      const c = this.casings[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += c.gravity * dt;
      c.rotation += c.rotSpeed * dt;

      c.animTimer += dt;
      if (c.animTimer >= 2) {
        c.animTimer = 0;
        c.frame = (c.frame + 1) % 20;
      }

      if (c.y > 550) {
        this.casings.splice(i, 1);
      }
    }

    // 3. Update floating texts
    for (let i = this.texts.length - 1; i >= 0; i--) {
      this.texts[i].update(dt);
      if (this.texts[i].opacity <= 0) {
        this.texts.splice(i, 1);
      }
    }

    // 4. Update smoke puffs
    for (let i = this.smokes.length - 1; i >= 0; i--) {
      const s = this.smokes[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.age += dt;
      s.size += 0.22 * dt;
      s.opacity = Math.max(0, 0.85 * (1.0 - (s.age / s.maxAge)));
      if (s.opacity <= 0) {
        this.smokes.splice(i, 1);
      }
    }
  }

  render(ctx, sprites) {
    // 0. Render Smoke
    if (this.smokes.length > 0) {
      ctx.save();
      for (const s of this.smokes) {
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 1. Render Feathers
    ctx.save();
    for (const f of this.feathers) {
      ctx.globalAlpha = f.opacity;
      ctx.fillStyle = f.color;
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.restore();

    // 2. Render Casings
    const hulsImg = sprites['huls'];
    if (hulsImg && hulsImg.complete) {
      ctx.save();
      for (const c of this.casings) {
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        // Draw frame from huls.png (60x80) scaled down to 24x32
        ctx.drawImage(hulsImg, 0, c.frame * 80, 60, 80, -12, -16, 24, 32);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.restore();
    }

    // 3. Render Floating Text
    for (const t of this.texts) {
      t.render(ctx);
    }
  }
}

window.Chicken = Chicken;
window.BigChicken = BigChicken;
window.Windmill = Windmill;
window.Scarecrow = Scarecrow;
window.Signpost = Signpost;
window.Balloon = Balloon;
window.Plane = Plane;
window.PeekChicken = PeekChicken;
window.TreeBranch = TreeBranch;
window.FloatingText = FloatingText;
window.ParticleSystem = ParticleSystem;
