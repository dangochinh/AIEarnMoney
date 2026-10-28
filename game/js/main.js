/**
 * Moorhuhn Jagd / Crazy Chicken - Main Entry Point
 * Orchestrates preloading of all original assets, engine startup,
 * and UI bindings.
 */

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas');
  const engine = new MoorhuhnEngine(canvas);
  window.engine = engine;

  const uiManager = new UIManager(engine);
  window.uiManager = uiManager;

  console.log('Preloading Moorhuhn Jagd audio & graphic assets...');

  try {
    // 1. Preload audio in parallel
    const audioPromise = window.audioManager.preload((progress) => {
      // Audio progress
    });

    // 2. Preload graphic sprites & layers
    const imagePromise = engine.preload((progress) => {
      // Image progress
    });

    await Promise.all([audioPromise, imagePromise]);
    console.log('Moorhuhn Jagd ready to play!');
  } catch (err) {
    console.error('Asset preloading error:', err);
    engine.state = 'MENU';
  }

  // Start 60 FPS animation loop
  engine.run();

  // If URL has ?test=gameplay, auto-start hunt for testing & screenshots
  if (window.location.search.includes('test=gameplay')) {
    setTimeout(() => {
      engine.startNewGame();
    }, 500);
  }
});
