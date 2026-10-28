/**
 * Moorhuhn Jagd / Crazy Chicken - UI & DOM Controller
 * Handles buttons, modals, settings, responsive scaling, language switcher, and inputs.
 */

class UIManager {
  constructor(engine) {
    this.engine = engine;
    this.isWidescreen = false;
    this.isCrtEnabled = false;
    this.isHdEnabled = true;

    this.initElements();
    this.attachEventListeners();
    this.setupResizeHandler();

    // Initialize DOM with current language
    window.i18n.setLanguage(window.i18n.currentLang);
    this.updateButtonsLanguage();
  }

  initElements() {
    this.btnLang = document.getElementById('btn-lang');
    this.langText = document.getElementById('lang-text');

    this.btnSound = document.getElementById('btn-sound');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundText = document.getElementById('sound-text');

    this.btnQuality = document.getElementById('btn-quality');
    this.qualityText = document.getElementById('quality-text');

    this.btnAspect = document.getElementById('btn-aspect');
    this.aspectText = document.getElementById('aspect-text');

    this.btnCrt = document.getElementById('btn-crt');
    this.crtText = document.getElementById('crt-text');
    this.crtOverlay = document.getElementById('crt-overlay');

    this.btnHighscores = document.getElementById('btn-highscores');
    this.modalHighscores = document.getElementById('modal-highscores');
    this.btnCloseHighscores = document.getElementById('btn-close-highscores');

    this.btnHelp = document.getElementById('btn-help');
    this.modalHelp = document.getElementById('modal-help');
    this.btnCloseHelp = document.getElementById('btn-close-help');

    this.modalNameInput = document.getElementById('modal-name-input');
    this.playerNameInput = document.getElementById('player-name-input');
    this.btnSubmitScore = document.getElementById('btn-submit-score');
    this.newRecordScoreText = document.getElementById('new-record-score-text');

    this.btnFullscreen = document.getElementById('btn-fullscreen');

    // Touch controls
    this.btnTouchPanL = document.getElementById('btn-touch-pan-l');
    this.btnTouchPanR = document.getElementById('btn-touch-pan-r');
    this.btnTouchReload = document.getElementById('btn-touch-reload');

    this.canvasContainer = document.getElementById('canvas-container');
    this.canvas = document.getElementById('game-canvas');
  }

  attachEventListeners() {
    // 0. Language Switcher (EN / VI)
    if (this.btnLang) {
      this.btnLang.addEventListener('click', () => {
        window.audioManager.resumeContext();
        window.audioManager.playSfx('typewriter', 0.9);
        window.i18n.toggleLanguage();
        this.updateButtonsLanguage();
        if (window.highScoreManager) {
          window.highScoreManager.renderTable();
        }
      });
    }

    // 1. Sound Button
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        window.audioManager.resumeContext();
        const muted = window.audioManager.toggleMute();
        this.updateSoundButton(muted);
      });
    }

    // 1.5. HD Quality Toggle (Crisp High-DPI vs Retro SD)
    if (this.btnQuality) {
      this.btnQuality.addEventListener('click', () => {
        window.audioManager.resumeContext();
        window.audioManager.playSfx('typewriter', 0.85);
        this.isHdEnabled = !this.isHdEnabled;
        this.updateQualityButton();
        this.applyCanvasSizing();
      });
    }

    // 2. Aspect Ratio Toggle (4:3 vs Widescreen)
    if (this.btnAspect) {
      this.btnAspect.addEventListener('click', () => {
        this.isWidescreen = !this.isWidescreen;
        this.updateAspectButton();
        this.applyCanvasSizing();
      });
    }

    // 3. CRT Scanline Toggle
    if (this.btnCrt) {
      this.btnCrt.addEventListener('click', () => {
        this.isCrtEnabled = !this.isCrtEnabled;
        if (this.isCrtEnabled) {
          this.crtOverlay.classList.remove('disabled');
        } else {
          this.crtOverlay.classList.add('disabled');
        }
        this.updateCrtButton();
      });
    }

    // 4. Highscores Modal
    if (this.btnHighscores) {
      this.btnHighscores.addEventListener('click', () => {
        window.highScoreManager.renderTable();
        this.openModal(this.modalHighscores);
      });
    }
    if (this.btnCloseHighscores) {
      this.btnCloseHighscores.addEventListener('click', () => {
        this.closeModal(this.modalHighscores);
      });
    }

    // 5. Help / Instructions Modal
    if (this.btnHelp) {
      this.btnHelp.addEventListener('click', () => {
        this.openModal(this.modalHelp);
      });
    }
    if (this.btnCloseHelp) {
      this.btnCloseHelp.addEventListener('click', () => {
        this.closeModal(this.modalHelp);
      });
    }

    // 6. Fullscreen
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // 7. Typewriter audio on name input
    if (this.playerNameInput) {
      this.playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.submitHighscore();
        } else if (e.key.length === 1 || e.key === 'Backspace') {
          window.audioManager.playSfx('typewriter', 0.85);
        }
      });
    }

    if (this.btnSubmitScore) {
      this.btnSubmitScore.addEventListener('click', () => {
        this.submitHighscore();
      });
    }

    // 8. Touch Controls
    if (this.btnTouchPanL) {
      this.btnTouchPanL.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.engine.camera.touchPanDirection = -1;
      });
      this.btnTouchPanL.addEventListener('touchend', () => {
        this.engine.camera.touchPanDirection = 0;
      });
    }

    if (this.btnTouchPanR) {
      this.btnTouchPanR.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.engine.camera.touchPanDirection = 1;
      });
      this.btnTouchPanR.addEventListener('touchend', () => {
        this.engine.camera.touchPanDirection = 0;
      });
    }

    if (this.btnTouchReload) {
      this.btnTouchReload.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.engine.reload();
      });
    }

    // Close modals on Escape key or outside click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal(this.modalHighscores);
        this.closeModal(this.modalHelp);
      }
    });

    [this.modalHighscores, this.modalHelp].forEach((modal) => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal(modal);
        });
      }
    });
  }

  updateButtonsLanguage() {
    this.updateSoundButton(window.audioManager.isMuted);
    this.updateQualityButton();
    this.updateAspectButton();
    this.updateCrtButton();
  }

  updateQualityButton() {
    if (!this.qualityText) return;
    this.qualityText.textContent = this.isHdEnabled ? window.i18n.t('qualityHd') : window.i18n.t('qualitySd');
  }

  updateSoundButton(isMuted) {
    if (!this.soundIcon || !this.soundText) return;
    if (isMuted) {
      this.soundIcon.textContent = '🔇';
      this.soundText.textContent = window.i18n.t('soundMuted');
    } else {
      this.soundIcon.textContent = '🔊';
      this.soundText.textContent = window.i18n.t('sound');
    }
  }

  updateAspectButton() {
    if (!this.aspectText) return;
    this.aspectText.textContent = this.isWidescreen ? window.i18n.t('aspectWide') : window.i18n.t('aspectStandard');
  }

  updateCrtButton() {
    if (!this.crtText) return;
    this.crtText.textContent = this.isCrtEnabled ? window.i18n.t('crtOn') : window.i18n.t('crtOff');
  }

  openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    if (this.engine.state === 'PLAYING') {
      this.engine.pause();
    }
  }

  closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
  }

  promptNameInput(score, accuracy, chickens) {
    this.pendingScore = { score, accuracy, chickens };
    this.newRecordScoreText.textContent = window.i18n.t('newRecordSubtitle', {
      score: score,
      acc: accuracy,
      hits: chickens
    });
    this.playerNameInput.value = '';
    this.openModal(this.modalNameInput);
    setTimeout(() => {
      this.playerNameInput.focus();
    }, 150);
  }

  submitHighscore() {
    if (!this.pendingScore) return;
    const name = this.playerNameInput.value.trim() || 'HUNTER';
    window.highScoreManager.addScore(
      name,
      this.pendingScore.score,
      this.pendingScore.accuracy,
      this.pendingScore.chickens
    );
    this.closeModal(this.modalNameInput);
    this.pendingScore = null;

    // Show high scores table with newly submitted entry highlighted
    window.highScoreManager.renderTable(name);
    this.openModal(this.modalHighscores);
  }

  toggleFullscreen() {
    const wrapper = document.getElementById('game-wrapper');
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.applyCanvasSizing();
    });
    this.applyCanvasSizing();
  }

  applyCanvasSizing() {
    const maxWidth = window.innerWidth * 0.96;
    const maxHeight = (window.innerHeight - 70) * 0.94;

    let targetWidth = 640;
    let targetHeight = 480;

    if (this.isWidescreen) {
      targetWidth = 854;
      targetHeight = 480;
    }

    // Calculate scale to fit viewport while preserving aspect ratio
    const scaleX = maxWidth / targetWidth;
    const scaleY = maxHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);

    const displayWidth = Math.floor(targetWidth * scale);
    const displayHeight = Math.floor(targetHeight * scale);

    // High-DPI / Retina Crisp Rendering:
    // Match the canvas pixel buffer 1:1 with physical screen pixels to eliminate all blur
    const screenDpr = Math.max(1, window.devicePixelRatio || 1);
    const bufferWidth = this.isHdEnabled ? Math.round(displayWidth * screenDpr) : targetWidth;
    const bufferHeight = this.isHdEnabled ? Math.round(displayHeight * screenDpr) : targetHeight;

    this.canvas.width = bufferWidth;
    this.canvas.height = bufferHeight;

    this.canvasContainer.style.width = `${displayWidth}px`;
    this.canvasContainer.style.height = `${displayHeight}px`;

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    if (this.isHdEnabled) {
      this.canvas.classList.remove('pixelated');
    } else {
      this.canvas.classList.add('pixelated');
    }

    const engineDpr = bufferWidth / targetWidth;
    if (this.engine) {
      this.engine.setResolution(targetWidth, targetHeight, engineDpr);
    }
  }
}

window.UIManager = UIManager;
