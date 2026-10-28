/* ============================================================
   PEPE NUÔI THÂN — MASCOT INTERACTION & SOUND SYNTHESIZER
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initPepeMascot();
});

let clickCounter = 0;
let clickTimer = null;

function initPepeMascot() {
  const mascot = document.getElementById("pepeMascot");
  if (!mascot) return;

  const quotes = [
    "🐸 Cố lên Pepe ơi, không có đơn là anh chủ rút phích cắm đó!",
    "💻 Vừa tối ưu xong thuật toán Shopee SEO, nhập là ra ngay!",
    "🍜 Đang mơ về một bát mì tôm có hai quả trứng gà...",
    "🎉 Có khách vào xem kìa! Mỉm cười thân thiện nào Pepe ơi!",
    "✨ Vốn 0đ nhưng quyết tâm thì vô hạn!",
    "☕ Cho Pepe xin 1 ly cà phê tỉnh táo cày đêm nhé!",
    "🎬 Nhận làm video AI ngắn 60s trọn gói, demo trước trả tiền sau!"
  ];

  // Speech bubble element
  let bubble = document.getElementById("pepeSpeechBubble");
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = "pepeSpeechBubble";
    bubble.className = "pepe-speech-bubble";
    bubble.innerHTML = quotes[0];
    const parent = mascot.closest(".mascot-container") || mascot.parentElement;
    if (parent) {
      parent.style.position = "relative";
      parent.appendChild(bubble);
    }
  }

  function showBubble(text) {
    if (!bubble) return;
    bubble.textContent = text || quotes[Math.floor(Math.random() * quotes.length)];
    bubble.classList.add("visible");
    playCuteSynth(660);

    setTimeout(() => {
      bubble.classList.remove("visible");
    }, 3000);
  }

  mascot.addEventListener("click", () => {
    showBubble();

    // 5-click easter egg to open Admin Modal
    clickCounter++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      clickCounter = 0;
    }, 2000);

    if (clickCounter >= 5) {
      clickCounter = 0;
      if (window.openAdminModal) {
        window.openAdminModal();
      }
    }
  });

  // Keyboard shortcut for Secret Admin Panel (Cmd/Ctrl + Shift + A)
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      if (window.openAdminModal) {
        window.openAdminModal();
      }
    }
  });
}

// Lightweight 8-bit web audio synth
window.playCuteSynth = function(freq = 520) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
};
