/**
 * Moorhuhn Jagd / Crazy Chicken - Web Audio Manager
 * Authentic sound system using Web Audio API for zero latency & polyphony.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('moorhuhn_muted') === 'true';
    this.sfxVolume = parseFloat(localStorage.getItem('moorhuhn_sfx_vol') || '0.9');
    this.musicVolume = parseFloat(localStorage.getItem('moorhuhn_music_vol') || '0.7');
    this.buffers = {};
    this.musicTracks = {};
    this.currentMusic = null;
    this.isInitialized = false;

    // List of SFX to preload
    this.sfxList = [
      'shoot', 'reload', 'empty', 'bird', 'hit1', 'hit2', 'hit3',
      'fall', 'big', 'sign', 'tree', 'balloon', 'plane',
      'intro', 'ready', 'timeup', 'gameover', 'typewriter'
    ];

    // Background music & ambient loops
    this.musicList = ['music_menu', 'ambient'];
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
      console.log('AudioContext initialized');
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // Ensure AudioContext is resumed after user interaction
  resumeContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Load all audio assets
  async preload(onProgress) {
    this.init();
    let loaded = 0;
    const total = this.sfxList.length + this.musicList.length;

    const update = () => {
      loaded++;
      if (onProgress) onProgress(loaded / total);
    };

    // Load SFX
    const sfxPromises = this.sfxList.map(async (name) => {
      try {
        const ext = name === 'hit3' ? 'mp3' : 'wav';
        const fallback = 'ogg';
        let res = await fetch(`assets/audio/${name}.${ext}`);
        if (!res.ok) {
          res = await fetch(`assets/audio/${name}.${fallback}`);
        }
        const arrayBuf = await res.arrayBuffer();
        if (this.ctx) {
          this.buffers[name] = await this.ctx.decodeAudioData(arrayBuf);
        }
      } catch (err) {
        console.warn(`Failed to load audio for ${name}:`, err);
      }
      update();
    });

    // Load Music / Ambient loops
    const musicPromises = this.musicList.map(async (name) => {
      try {
        let res = await fetch(`assets/audio/${name}.ogg`);
        if (!res.ok) {
          res = await fetch(`assets/audio/${name}.mp3`);
        }
        const arrayBuf = await res.arrayBuffer();
        if (this.ctx) {
          this.buffers[name] = await this.ctx.decodeAudioData(arrayBuf);
        }
      } catch (err) {
        console.warn(`Failed to load music for ${name}:`, err);
      }
      update();
    });

    await Promise.all([...sfxPromises, ...musicPromises]);
    console.log('All audio buffers loaded successfully');
  }

  // Play a one-shot sound effect with optional pitch variation & volume scale
  playSfx(name, volumeScale = 1.0, pitchVariation = 0.0) {
    if (this.isMuted || !this.ctx || !this.buffers[name]) return;
    this.resumeContext();

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[name];

      // Slight pitch variation for organic gunshots / squawks
      if (pitchVariation > 0) {
        const detune = (Math.random() * 2 - 1) * (pitchVariation * 100);
        source.detune.value = detune;
      }

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = volumeScale;

      source.connect(gainNode);
      gainNode.connect(this.sfxGain);

      source.start(0);
      return source;
    } catch (e) {
      console.warn('Error playing SFX:', name, e);
    }
  }

  // Play background music / ambient track with looping
  playMusic(name, loop = true, fadeInSeconds = 0.5) {
    if (!this.ctx || !this.buffers[name]) return;
    this.resumeContext();

    if (this.currentMusic && this.currentMusic.name === name) {
      return; // Already playing
    }

    this.stopMusic(0.3);

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[name];
      source.loop = loop;

      const gainNode = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(1.0, now + fadeInSeconds);

      source.connect(gainNode);
      gainNode.connect(this.musicGain);

      source.start(0);
      this.currentMusic = { source, gainNode, name };
    } catch (e) {
      console.warn('Error playing music:', name, e);
    }
  }

  // Stop currently playing music
  stopMusic(fadeOutSeconds = 0.3) {
    if (!this.currentMusic || !this.ctx) return;
    const { source, gainNode } = this.currentMusic;
    const now = this.ctx.currentTime;
    try {
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeOutSeconds);
      setTimeout(() => {
        try { source.stop(); } catch(e) {}
      }, fadeOutSeconds * 1000);
    } catch(e) {
      try { source.stop(); } catch(err) {}
    }
    this.currentMusic = null;
  }

  // Toggle Mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('moorhuhn_muted', this.isMuted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('moorhuhn_sfx_vol', this.sfxVolume);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('moorhuhn_music_vol', this.musicVolume);
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }
}

// Global audio manager instance
window.audioManager = new AudioManager();
