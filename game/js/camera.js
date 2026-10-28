/**
 * Moorhuhn Jagd / Crazy Chicken - Camera System
 * Handles horizontal panorama scrolling (1920px width), edge-panning,
 * keyboard/touch navigation, multi-layer parallax, and gun recoil shake.
 */

class Camera {
  constructor(viewportWidth = 640, viewportHeight = 480, worldWidth = 1920, worldHeight = 500) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = (this.worldWidth - this.viewportWidth) / 2; // Start centered (~640)
    this.targetX = this.x;
    this.panVelocity = 0;
    this.maxPanSpeed = 18.0; // Max pixels per frame
    this.edgeZone = 130; // Dynamic edge distance in pixels where panning begins

    // Recoil trauma / shake
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Manual pan controls state
    this.keyLeft = false;
    this.keyRight = false;
    this.touchPanDirection = 0; // -1 for left, +1 for right, 0 for none

    // Trackpad swipe / wheel inertia impulse
    this.wheelImpulse = 0;
  }

  resize(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.clamp();
  }

  get maxScrollX() {
    return Math.max(0, this.worldWidth - this.viewportWidth);
  }

  clamp() {
    this.x = Math.max(0, Math.min(this.maxScrollX, this.x));
    this.targetX = Math.max(0, Math.min(this.maxScrollX, this.targetX));
  }

  // Add recoil impulse on gunshot
  addTrauma(amount = 0.5) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // Handle Trackpad / Magic Mouse / Wheel swipe gestures with inertia
  addWheelPan(delta) {
    // Delta on macOS trackpad usually ranges from 1 to 40 per wheel event
    const impulse = Math.max(-28, Math.min(28, delta * 0.5));
    this.wheelImpulse = Math.max(
      -this.maxPanSpeed * 1.5,
      Math.min(this.maxPanSpeed * 1.5, this.wheelImpulse + impulse)
    );
  }

  update(cursorX, dt = 1.0, isMouseInside = true) {
    let desiredSpeed = 0;

    // 1. Mouse edge-scroll calculation (responsive dynamic zone + smoothstep curve)
    const effectiveEdgeZone = Math.max(120, Math.min(190, this.viewportWidth * 0.22));
    if (isMouseInside && cursorX !== null && cursorX !== undefined) {
      if (cursorX < effectiveEdgeZone) {
        // Closer to edge = faster pan with smooth cubic smoothstep
        const ratio = (effectiveEdgeZone - Math.max(0, cursorX)) / effectiveEdgeZone;
        const smoothRatio = ratio * ratio * (3 - 2 * ratio);
        desiredSpeed = -this.maxPanSpeed * Math.max(0.06, smoothRatio);
      } else if (cursorX > this.viewportWidth - effectiveEdgeZone) {
        const dist = cursorX - (this.viewportWidth - effectiveEdgeZone);
        const ratio = Math.min(1.0, dist / effectiveEdgeZone);
        const smoothRatio = ratio * ratio * (3 - 2 * ratio);
        desiredSpeed = this.maxPanSpeed * Math.max(0.06, smoothRatio);
      }
    }

    // 2. Keyboard & Touch pan buttons override/addition
    if (this.keyLeft || this.touchPanDirection < 0) {
      desiredSpeed = -this.maxPanSpeed * 1.15;
    } else if (this.keyRight || this.touchPanDirection > 0) {
      desiredSpeed = this.maxPanSpeed * 1.15;
    }

    // 3. Trackpad / Wheel swipe momentum
    if (Math.abs(this.wheelImpulse) > 0.05) {
      desiredSpeed += this.wheelImpulse;
      this.wheelImpulse *= Math.pow(0.82, dt); // smooth friction damping
      if (Math.abs(this.wheelImpulse) < 0.1) this.wheelImpulse = 0;
    }

    // 4. Framerate-independent smooth velocity interpolation
    const accelFactor = desiredSpeed !== 0 ? 0.35 : 0.28;
    const lerpRate = 1 - Math.pow(1 - accelFactor, Math.min(3.0, dt));
    this.panVelocity += (desiredSpeed - this.panVelocity) * lerpRate;
    if (Math.abs(this.panVelocity) < 0.01 && desiredSpeed === 0) {
      this.panVelocity = 0;
    }

    this.x += this.panVelocity * dt;
    this.clamp();

    // 5. Update screen shake (decaying quadratic trauma)
    if (this.trauma > 0) {
      const shakeMag = this.trauma * this.trauma * 7.0; // Up to 7 pixels shake
      this.shakeOffsetX = (Math.random() * 2 - 1) * shakeMag;
      this.shakeOffsetY = (Math.random() * 2 - 1) * shakeMag;
      this.trauma = Math.max(0, this.trauma - 0.06 * dt);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  // Returns screen coordinates for an entity given its world coordinates and parallax factor
  worldToScreen(worldX, worldY, parallaxFactor = 1.0) {
    const effectiveCamX = this.x * parallaxFactor;
    return {
      x: worldX - effectiveCamX + this.shakeOffsetX,
      y: worldY + this.shakeOffsetY
    };
  }

  // Returns world coordinates from screen click
  screenToWorld(screenX, screenY, parallaxFactor = 1.0) {
    const effectiveCamX = this.x * parallaxFactor;
    return {
      x: screenX + effectiveCamX - this.shakeOffsetX,
      y: screenY - this.shakeOffsetY
    };
  }

  // Draw a parallax background layer (subpixel floating-point position for ultra-smooth scrolling)
  renderLayer(ctx, img, parallaxFactor = 1.0, yOffset = 0, customWidth = null, customHeight = null) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const layerWidth = customWidth || img.naturalWidth || this.worldWidth;
    const layerHeight = customHeight || img.naturalHeight;

    // Calculate layer scroll offset based on camera progress
    const maxLayerScroll = Math.max(0, layerWidth - this.viewportWidth);
    const scrollRatio = this.maxScrollX > 0 ? (this.x / this.maxScrollX) : 0;
    const layerX = -scrollRatio * maxLayerScroll * parallaxFactor;

    ctx.drawImage(
      img,
      layerX + this.shakeOffsetX,
      yOffset + this.shakeOffsetY,
      layerWidth,
      layerHeight
    );
  }
}

window.Camera = Camera;
