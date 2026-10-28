/**
 * Moorhuhn Jagd / Crazy Chicken - High Scores System
 * Persistent Top 10 leaderboards with authentic typewriter audio feedback.
 */

class HighScoreManager {
  constructor() {
    this.storageKey = 'moorhuhn_highscores';
    this.maxEntries = 10;
    this.scores = this.loadScores();
  }

  // Initial default arcade high scores
  getDefaultScores() {
    return [
      { name: 'JOHNNIE W.', score: 1450, accuracy: 88, chickens: 82, date: '1999-10-12' },
      { name: 'CHICKEN KING', score: 1280, accuracy: 84, chickens: 74, date: '2000-01-01' },
      { name: 'CRAZY HUNTER', score: 1120, accuracy: 79, chickens: 65, date: '2000-02-14' },
      { name: 'PHENOMEDIA', score: 980, accuracy: 75, chickens: 58, date: '2000-03-20' },
      { name: 'SWAMP FOX', score: 850, accuracy: 72, chickens: 51, date: '2000-04-05' },
      { name: 'DEADEYE', score: 740, accuracy: 68, chickens: 45, date: '2000-05-18' },
      { name: 'FLAPPER', score: 620, accuracy: 64, chickens: 39, date: '2000-06-22' },
      { name: 'ROOKIE GUN', score: 510, accuracy: 60, chickens: 33, date: '2000-07-30' },
      { name: 'FEATHER BOY', score: 420, accuracy: 55, chickens: 28, date: '2000-08-11' },
      { name: 'GREENHORN', score: 310, accuracy: 50, chickens: 21, date: '2000-09-01' }
    ];
  }

  loadScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load highscores:', e);
    }
    const defaults = this.getDefaultScores();
    this.saveToStorage(defaults);
    return defaults;
  }

  saveToStorage(scores) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(scores));
    } catch (e) {
      console.warn('Failed to save highscores to storage:', e);
    }
  }

  // Check if a score qualifies for the top 10
  isQualifyingScore(score) {
    if (this.scores.length < this.maxEntries) return true;
    return score > this.scores[this.scores.length - 1].score;
  }

  // Insert a new high score
  addScore(name, score, accuracy = 0, chickens = 0) {
    const cleanName = (name || 'HUNTER').trim().toUpperCase().substring(0, 12);
    const today = new Date().toISOString().split('T')[0];

    const newEntry = {
      name: cleanName,
      score: Math.max(0, score),
      accuracy: Math.round(accuracy),
      chickens: Math.round(chickens),
      date: today
    };

    this.scores.push(newEntry);
    // Sort descending by score
    this.scores.sort((a, b) => b.score - a.score);
    // Keep top 10
    this.scores = this.scores.slice(0, this.maxEntries);
    this.saveToStorage(this.scores);

    // Find ranking of new entry
    const rank = this.scores.findIndex(e => e === newEntry) + 1;
    return rank;
  }

  // Populate HTML table
  renderTable(highlightName = null) {
    const tbody = document.getElementById('highscore-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.scores.forEach((entry, index) => {
      const tr = document.createElement('tr');
      if (index === 0) tr.classList.add('top-rank');
      if (highlightName && entry.name === highlightName) tr.classList.add('current-player');

      const rankBadge = index === 0 ? '🥇 1' : (index === 1 ? '🥈 2' : (index === 2 ? '🥉 3' : `${index + 1}`));

      tr.innerHTML = `
        <td style="font-weight: bold; color: #ffd659;">${rankBadge}</td>
        <td style="text-align: left; padding-left: 14px;">${entry.name}</td>
        <td style="color: #69db7c; font-weight: bold;">${entry.score}</td>
        <td>${entry.accuracy}%</td>
        <td>${entry.chickens}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

window.highScoreManager = new HighScoreManager();
