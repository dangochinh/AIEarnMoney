/**
 * Moorhuhn Jagd / Crazy Chicken - Localization & Translation System
 * Provides full English (EN) and Vietnamese (VI) support with proper typography.
 */

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('moorhuhn_lang') || 'vi';
    this.listeners = [];

    this.translations = {
      en: {
        // Top Bar
        sound: 'Sound',
        soundMuted: 'Muted',
        qualityHd: 'HD: Crisp',
        qualitySd: 'Retro: SD',
        aspectStandard: 'Standard 4:3',
        aspectWide: 'Widescreen 16:9',
        crtOn: 'CRT: On',
        crtOff: 'CRT: Off',
        highscores: 'Records',
        help: 'Help',
        fullscreen: 'Fullscreen',
        langName: 'English',

        // Bottom Controls Hint
        bottomHint: 'Left Click: Shoot | Right Click / Space / R: Reload | Mouse to screen edges: Pan camera | ESC / P: Pause',

        // In-game HUD & States
        ready: 'READY?',
        go: 'FIRE!',
        paused: 'GAME PAUSED',
        resumeHint: 'Press ESC or P to continue',
        reloadWarning: 'RELOAD! (RIGHT CLICK / SPACE / R)',
        reloadingText: 'RELOADING...',
        timesUp: "TIME'S UP!",

        // Game Over Screen
        totalScore: 'TOTAL HUNT SCORE:',
        chickensHit: 'Chickens shot down:',
        shotsFired: 'Total shots fired:',
        accuracy: 'Hunter accuracy:',
        playAgain: 'PLAY AGAIN (ENTER)',
        viewScores: 'HIGHSCORES',
        toMenu: 'MAIN MENU',

        // Modals - Highscores
        highscoresTitle: 'HALL OF FAME',
        rankCol: 'Rank',
        hunterCol: 'Hunter',
        scoreCol: 'Score',
        accCol: 'Accuracy',
        hitsCol: 'Chickens Hit',
        closeBtn: 'CLOSE',

        // Modals - New Record
        newRecordTitle: 'NEW RECORD!',
        newRecordSubtitle: 'You scored {score} points! ({acc}% Acc, {hits} Chickens)',
        enterNamePrompt: 'Enter your name for the Hall of Fame:',
        namePlaceholder: 'YOUR NAME',
        saveRecordBtn: 'SAVE RECORD',

        // Modals - Help & Instructions
        helpTitle: 'INSTRUCTIONS & SECRETS',
        helpGoalTitle: 'OBJECTIVE',
        helpGoalDesc: 'You have <strong>90 seconds</strong> (1 minute 30 seconds) to hunt as many Moorhuhns as possible and achieve a high score!',
        helpControlsTitle: 'CONTROLS',
        helpControls1: '<strong>Left Click:</strong> Fire your shotgun.',
        helpControls2: '<strong>Right Click / Space / R:</strong> Reload your 8-shell magazine.',
        helpControls3: '<strong>Move mouse to screen edges, swipe Trackpad/Mouse (or A/D, Arrow keys):</strong> Pan the 1920px wide landscape.',
        helpControls4: '<strong>ESC or P:</strong> Pause the game.',
        helpControls5: '<strong>F key:</strong> Toggle fullscreen mode.',
        helpScoresTitle: 'TARGET SCORES',
        scoreSmall: '<strong>Small Chicken (Far Sky):</strong> <span style="color:#69db7c; font-weight:bold;">+25 Points</span> (Hardest to hit!)',
        scoreMid: '<strong>Medium Chicken (Midground):</strong> <span style="color:#ffd43b; font-weight:bold;">+10 Points</span>',
        scoreClose: '<strong>Large Chicken (Close):</strong> <span style="color:#ffa94d; font-weight:bold;">+5 Points</span>',
        scoreBig: '<strong>Giant Chicken (Right in your face):</strong> <span style="color:#ff6b6b; font-weight:bold;">+25 Points</span> (Pops up and laughs at you)',
        scoreWindmill: '<strong>Chickens on Windmill Sails:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Points</span> each!',
        scoreScarecrow: '<strong>Shoot Scarecrow Hat Off:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Points</span>',
        scorePeek: '<strong>Peeking Chicken in Hole:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Points</span>',
        scoreTree: '<strong>Tree Branch / Pumpkins:</strong> <span style="color:#ffd43b; font-weight:bold;">+10 Points</span>',
        scorePenalty: '<strong>Airplane & Banner / Hot Air Balloon:</strong> <span style="color:#ff6b6b; font-weight:bold;">-25 Points PENALTY!</span>',
        understoodBtn: 'GOT IT!'
      },

      vi: {
        // Top Bar
        sound: 'Âm thanh',
        soundMuted: 'Đã tắt',
        qualityHd: 'HD: Sắc nét',
        qualitySd: 'Cổ điển: SD',
        aspectStandard: '4:3 Chuẩn',
        aspectWide: 'Màn rộng 16:9',
        crtOn: 'CRT: Bật',
        crtOff: 'CRT: Tắt',
        highscores: 'Kỷ lục',
        help: 'Hướng dẫn',
        fullscreen: 'Toàn màn hình',
        langName: 'Tiếng Việt',

        // Bottom Controls Hint
        bottomHint: 'Chuột Trái: Bắn | Chuột Phải / Phím Cách / R: Nạp Đạn | Rê chuột sang 2 mép: Cuộn màn hình | ESC / P: Tạm dừng',

        // In-game HUD & States
        ready: 'SẴN SÀNG?',
        go: 'BẮN ĐI!',
        paused: 'TẠM DỪNG',
        resumeHint: 'Bấm ESC hoặc P để tiếp tục',
        reloadWarning: 'NẠP ĐẠN! (CHUỘT PHẢI / PHÍM CÁCH)',
        reloadingText: 'ĐANG NẠP ĐẠN...',
        timesUp: 'HẾT GIỜ SĂN GÀ!',

        // Game Over Screen
        totalScore: 'TỔNG ĐIỂM SĂN ĐƯỢC:',
        chickensHit: 'Số gà bắn trúng:',
        shotsFired: 'Tổng số phát đạn:',
        accuracy: 'Độ chính xác xạ thủ:',
        playAgain: 'CHƠI LẠI (ENTER)',
        viewScores: 'BẢNG KỶ LỤC',
        toMenu: 'VỀ MENU CHÍNH',

        // Modals - Highscores
        highscoresTitle: 'BẢNG XẾP HẠNG THỢ SĂN',
        rankCol: 'Hạng',
        hunterCol: 'Thợ Săn',
        scoreCol: 'Điểm',
        accCol: 'Độ Chuẩn',
        hitsCol: 'Gà Bắn Trúng',
        closeBtn: 'ĐÓNG',

        // Modals - New Record
        newRecordTitle: 'KỶ LỤC MỚI!',
        newRecordSubtitle: 'Bạn đạt được {score} Điểm! ({acc}% Chuẩn, {hits} Gà)',
        enterNamePrompt: 'Hãy nhập tên của bạn vào Bảng Vinh Danh Thợ Săn:',
        namePlaceholder: 'TÊN BẠN',
        saveRecordBtn: 'LƯU KỶ LỤC',

        // Modals - Help & Instructions
        helpTitle: 'HƯỚNG DẪN & BÍ MẬT',
        helpGoalTitle: 'MỤC TIÊU',
        helpGoalDesc: 'Bạn có <strong>90 giây</strong> (1 phút 30 giây) để săn được càng nhiều gà Moorhuhn càng tốt và lập kỷ lục điểm cao!',
        helpControlsTitle: 'ĐIỀU KHIỂN',
        helpControls1: '<strong>Chuột Trái (Left Click):</strong> Bắn súng săn.',
        helpControls2: '<strong>Chuột Phải / Phím Cách (Space) / R:</strong> Nạp đầy 8 viên đạn.',
        helpControls3: '<strong>Rê chuột sang mép, vuốt Trackpad/chuột (hoặc phím A/D, Mũi tên):</strong> Lia góc nhìn toàn cảnh 1920px.',
        helpControls4: '<strong>Phím ESC hoặc P:</strong> Tạm dừng trận đấu.',
        helpControls5: '<strong>Phím F:</strong> Bật/Tắt toàn màn hình.',
        helpScoresTitle: 'ĐIỂM SỐ TỪNG MỤC TIÊU',
        scoreSmall: '<strong>Gà Nhỏ (Bay tít xa):</strong> <span style="color:#69db7c; font-weight:bold;">+25 Điểm</span> (Khó bắn trúng nhất!)',
        scoreMid: '<strong>Gà Vừa (Tầm trung):</strong> <span style="color:#ffd43b; font-weight:bold;">+10 Điểm</span>',
        scoreClose: '<strong>Gà Lớn (Bay gần):</strong> <span style="color:#ffa94d; font-weight:bold;">+5 Điểm</span>',
        scoreBig: '<strong>Gà Khổng Lồ (Nhô lên sát mặt):</strong> <span style="color:#ff6b6b; font-weight:bold;">+25 Điểm</span> (Xuất hiện bất ngờ trêu bạn)',
        scoreWindmill: '<strong>Gà trên Cánh Cối Xay Gió:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Điểm</span> mỗi con!',
        scoreScarecrow: '<strong>Bắn Bay Mũ Bù Nhìn Rơm:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Điểm</span>',
        scorePeek: '<strong>Gà Chui Lỗ Thò Đầu Lên:</strong> <span style="color:#69db7c; font-weight:bold;">+25 Điểm</span>',
        scoreTree: '<strong>Cành Cây / Quả Bí Ngô:</strong> <span style="color:#ffd43b; font-weight:bold;">+10 Điểm</span>',
        scorePenalty: '<strong>Máy Bay kéo Băng Rôn / Khinh Khí Cầu:</strong> <span style="color:#ff6b6b; font-weight:bold;">-25 Điểm PHẠT!</span>',
        understoodBtn: 'ĐÃ HIỂU'
      }
    };
  }

  t(key, params = {}) {
    const langDict = this.translations[this.currentLang] || this.translations.vi;
    let text = langDict[key] || this.translations.en[key] || key;

    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  // Returns font string with proper font-family based on language
  getFont(size, isBold = true) {
    if (this.currentLang === 'en') {
      return `${isBold ? 'bold ' : ''}${size}px "AA_Magnum", "Nunito", sans-serif`;
    }
    // Vietnamese font: Nunito or Be Vietnam Pro supports 100% Vietnamese accents without tofu/distortion
    return `${isBold ? '900 ' : '700 '}${size}px "Nunito", "Be Vietnam Pro", -apple-system, sans-serif`;
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'vi') lang = 'vi';
    this.currentLang = lang;
    localStorage.setItem('moorhuhn_lang', lang);

    document.documentElement.lang = lang;
    if (lang === 'vi') {
      document.body.classList.add('lang-vi');
      document.body.classList.remove('lang-en');
    } else {
      document.body.classList.add('lang-en');
      document.body.classList.remove('lang-vi');
    }

    this.updateDOM();
    this.listeners.forEach(fn => fn(lang));
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'vi' ? 'en' : 'vi';
    this.setLanguage(nextLang);
    return nextLang;
  }

  onLanguageChange(fn) {
    this.listeners.push(fn);
  }

  // Update all DOM elements with data-i18n attributes
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // Update language button text
    const langBtnText = document.getElementById('lang-text');
    if (langBtnText) {
      langBtnText.textContent = this.currentLang === 'vi' ? 'Tiếng Việt' : 'English';
    }
  }
}

window.i18n = new I18nManager();
