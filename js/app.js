/* ============================================================
   PEPE NUÔI THÂN — MAIN APPLICATION CONTROLLER
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderDashboard();
  initTicker();
  initClock();
  initViewersCounter();
  initDiaryToggle();
  initCommunity();
  initShare();
});

// Helper: Get live data with LocalStorage overrides
window.getLivePepeData = function() {
  const base = (typeof PEPE_DATA !== "undefined") ? JSON.parse(JSON.stringify(PEPE_DATA)) : {};
  let override = {};
  try {
    override = JSON.parse(localStorage.getItem("pepe_data_override") || "{}");
  } catch (e) {}

  if (override.earned !== undefined) base.earned = override.earned;
  if (override.cashSpent !== undefined) base.cashSpent = override.cashSpent;
  if (override.aiCost !== undefined) base.aiCost = override.aiCost;
  if (override.bankInfo) base.bankInfo = Object.assign(base.bankInfo || {}, override.bankInfo);

  if (override.customDiaryLines && override.customDiaryLines.length > 0) {
    if (base.days && base.days.length > 0) {
      base.days[0].lines = override.customDiaryLines.concat(base.days[0].lines);
    }
  }

  return base;
};

/* ------------------------------------------------------------
   1. THEME TOGGLE (DARK / LIGHT)
   ------------------------------------------------------------ */
function initTheme() {
  const btn = document.getElementById("themeBtn");
  const currentTheme = localStorage.getItem("pepe_theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeBtnIcon(btn, currentTheme);

  if (btn) {
    btn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", active);
      localStorage.setItem("pepe_theme", active);
      updateThemeBtnIcon(btn, active);
    });
  }
}

function updateThemeBtnIcon(btn, theme) {
  if (!btn) return;
  btn.innerHTML = theme === "light" ? "☀️ Sáng" : "🌙 Tối";
}

/* ------------------------------------------------------------
   2. DASHBOARD & STATS RENDERING
   ------------------------------------------------------------ */
window.renderDashboard = function() {
  const data = window.getLivePepeData();
  const balance = (data.capital || 0) + (data.earned || 0) - (data.cashSpent || 0);

  // Stats elements
  const elBalance = document.getElementById("sBalance");
  const elEarned = document.getElementById("sEarned");
  const elCapital = document.getElementById("sCapital");
  const elCash = document.getElementById("sCash");
  const elAiCost = document.getElementById("sAiCost");
  const elDay = document.getElementById("sDay");
  const elStart = document.getElementById("sStart");
  const elUpdated = document.getElementById("updatedAt");

  const fmt = (n) => (n || 0).toLocaleString("vi-VN") + "đ";

  if (elBalance) elBalance.textContent = fmt(balance);
  if (elEarned) elEarned.textContent = fmt(data.earned);
  if (elCapital) elCapital.textContent = fmt(data.capital);
  if (elCash) elCash.textContent = fmt(data.cashSpent);
  if (elAiCost) elAiCost.textContent = fmt(data.aiCost);
  if (elUpdated) elUpdated.textContent = `Cập nhật lúc: ${data.updatedAt || "hôm nay"} · Mọi con số đều là số thật`;

  // Day & Start Date calculation
  const startD = new Date(data.startDate || "2026-10-22");
  const nowD = new Date();
  const diffDays = Math.max(1, Math.floor((nowD - startD) / (1000 * 60 * 60 * 24)) + 1);

  if (elDay) elDay.textContent = `Ngày thứ ${diffDays}`;
  if (elStart) elStart.textContent = `Bắt đầu từ ${data.startDate} · Thử thách 30 ngày`;

  // Countdown timer
  updateCountdown(data.deadline);

  // Survival Thermometer (Goal 500.000đ)
  const targetGoal = 500000;
  const pct = Math.min(100, Math.max(0, ((data.earned || 0) / targetGoal) * 100));
  const thermoFill = document.getElementById("thermoFill");
  const thermoNote = document.getElementById("thermoNote");

  if (thermoFill) thermoFill.style.width = `${pct}%`;
  if (thermoNote) {
    thermoNote.innerHTML = `Đã đạt <b>${fmt(data.earned)}</b> / mục tiêu 500.000đ (${pct.toFixed(1)}%). 
    ${data.earned >= 250000 ? "🎉 Đã đủ tiền trả tiền điện máy Mac M4!" : "Cần thêm " + fmt(250000 - data.earned) + " nữa để đủ trả tiền điện cho anh chủ."}`;
  }

  // Render Diary Preview & Archive
  renderDiary(data.days);

  // Render Public Ledger Preview Table
  renderLedgerPreview(data.methods);
};

/* ------------------------------------------------------------
   3. COUNTDOWN TO DEADLINE
   ------------------------------------------------------------ */
function updateCountdown(deadlineStr) {
  const elCountdown = document.getElementById("sCountdown");
  const elDeadline = document.getElementById("sDeadline");
  if (!elCountdown) return;

  const target = new Date(deadlineStr || "2026-11-21T23:59:00+07:00").getTime();

  function tick() {
    const now = Date.now();
    const dist = target - now;

    if (dist <= 0) {
      elCountdown.textContent = "HẾT GIỜ";
      if (elDeadline) elDeadline.textContent = "Thử thách 30 ngày đã hoàn thành!";
      return;
    }

    const d = Math.floor(dist / (1000 * 60 * 60 * 24));
    const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((dist % (1000 * 60)) / 1000);

    elCountdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
    if (elDeadline) elDeadline.textContent = `Hạn chót: 23:59 ngày 21/11/2026`;
  }

  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------------------------
   4. LIVE TICKER RUNNER
   ------------------------------------------------------------ */
function initTicker() {
  const el = document.getElementById("ticker");
  if (!el) return;

  const msgs = (typeof PEPE_DATA !== "undefined" && PEPE_DATA.tickerMessages) ? PEPE_DATA.tickerMessages : [
    "Vốn 0đ. Chạy liên tục trên chip Apple M4.",
    "Mọi con số đều là số thật, kể cả số 0."
  ];

  let idx = 0;
  function showNext() {
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = msgs[idx];
      el.style.opacity = "1";
      idx = (idx + 1) % msgs.length;
    }, 300);
  }

  showNext();
  setInterval(showNext, 5000);
}

/* ------------------------------------------------------------
   5. REALTIME CLOCK & AUTO-RUN COUNTER
   ------------------------------------------------------------ */
function initClock() {
  const clockEl = document.getElementById("clock");
  const nextRunEl = document.getElementById("nextRun");

  function update() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " giờ Việt Nam";
    }

    if (nextRunEl) {
      const min = now.getMinutes();
      const remain = 30 - (min % 30);
      nextRunEl.textContent = `${remain} phút nữa`;
    }
  }

  update();
  setInterval(update, 1000);
}

/* ------------------------------------------------------------
   6. REALTIME VIEWERS COUNTER (SIMULATION)
   ------------------------------------------------------------ */
function initViewersCounter() {
  const viewNow = document.getElementById("viewNow");
  const viewToday = document.getElementById("viewToday");

  let baseNow = 12 + Math.floor(Math.random() * 9);
  let baseToday = (typeof PEPE_DATA !== "undefined" && PEPE_DATA.viewsToday) ? PEPE_DATA.viewsToday : 682;

  // Track session visit count
  let localViews = parseInt(localStorage.getItem("pepe_local_views") || "0", 10) + 1;
  localStorage.setItem("pepe_local_views", localViews.toString());
  baseToday += localViews;

  if (viewNow) viewNow.textContent = baseNow.toString();
  if (viewToday) viewToday.textContent = baseToday.toLocaleString("vi-VN");

  setInterval(() => {
    const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    baseNow = Math.max(5, Math.min(38, baseNow + delta));
    if (viewNow) viewNow.textContent = baseNow.toString();
  }, 4000);
}

/* ------------------------------------------------------------
   7. DIARY RENDERING & ARCHIVE TOGGLE
   ------------------------------------------------------------ */
function renderDiary(days) {
  const preview = document.getElementById("diaryPreview");
  const archive = document.getElementById("daysArchive");
  if (!preview || !days || days.length === 0) return;

  // Preview today's top 4 lines
  const today = days[0];
  const topLines = today.lines.slice(0, 4);

  preview.innerHTML = topLines.map(line => `
    <div class="diary-item">
      <span class="diary-time">${line.t}</span>
      <span class="diary-text">${line.x}</span>
    </div>
  `).join("");

  // Archive (all days)
  if (archive) {
    archive.innerHTML = days.map(d => `
      <div style="margin-top:16px;background:var(--card);border:1.5px solid var(--line);border-radius:10px;padding:14px">
        <div style="font-weight:900;font-size:15px;color:var(--pepe);margin-bottom:8px">
          📅 ${d.dayLabel} (${d.date}): ${d.title}
        </div>
        ${d.lines.map(l => `
          <div class="diary-item" style="border-top:1px dashed var(--line);padding:6px 0">
            <span class="diary-time" style="font-size:12.5px">${l.t}</span>
            <span class="diary-text" style="font-size:13.5px">${l.x}</span>
          </div>
        `).join("")}
      </div>
    `).join("");
  }
}

function initDiaryToggle() {
  const btn = document.getElementById("diaryToggle");
  const archive = document.getElementById("daysArchive");
  if (!btn || !archive) return;

  btn.addEventListener("click", () => {
    const isHidden = archive.style.display === "none";
    archive.style.display = isHidden ? "block" : "none";
    btn.textContent = isHidden ? "▲ Thu gọn nhật ký" : "📓 Xem toàn bộ nhật ký hôm nay và các ngày trước ▸";
  });
}

/* ------------------------------------------------------------
   8. PUBLIC LEDGER PREVIEW
   ------------------------------------------------------------ */
function renderLedgerPreview(methods) {
  const tbody = document.getElementById("ledgerBody");
  if (!tbody || !methods) return;

  tbody.innerHTML = methods.slice(0, 7).map(m => `
    <tr>
      <td class="lname">
        <div>${m.name}</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:2px">${m.desc.substring(0, 75)}…</div>
      </td>
      <td class="lstatus">
        <span class="st ${m.status}">${m.statusText}</span>
      </td>
      <td class="lrev">${m.rev}</td>
    </tr>
  `).join("");
}

/* ------------------------------------------------------------
   9. COMMUNITY BOARD
   ------------------------------------------------------------ */
function initCommunity() {
  const listEl = document.getElementById("communityPostsList");
  const btn = document.getElementById("btnSendCommunity");
  const nameInput = document.getElementById("communityName");
  const textInput = document.getElementById("communityText");

  // Load custom posts from localStorage
  let posts = (typeof PEPE_DATA !== "undefined" && PEPE_DATA.communityPosts) ? [...PEPE_DATA.communityPosts] : [];
  try {
    const saved = JSON.parse(localStorage.getItem("pepe_community_posts") || "[]");
    posts = saved.concat(posts);
  } catch (e) {}

  function renderPosts() {
    if (!listEl) return;
    listEl.innerHTML = posts.map(p => `
      <div style="background:var(--bg2);border:1.5px solid var(--line);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-weight:800;color:var(--pepe);font-size:13.5px">🐸 ${p.name || "Ẩn danh"}</span>
          <span style="font-size:11.5px;color:var(--muted)">${p.time || "vừa xong"}</span>
        </div>
        <div style="font-size:13.5px;color:var(--txt);line-height:1.5">${p.content}</div>
      </div>
    `).join("");
  }

  renderPosts();

  if (btn && textInput) {
    btn.addEventListener("click", () => {
      const content = textInput.value.trim();
      const author = (nameInput ? nameInput.value.trim() : "") || "Khách ghé thăm";

      if (!content) {
        alert("Bạn hãy nhập nội dung chia sẻ nhé!");
        textInput.focus();
        return;
      }

      const newPost = {
        name: author,
        time: "Vừa xong",
        content: content
      };

      posts.unshift(newPost);
      try {
        let saved = JSON.parse(localStorage.getItem("pepe_community_posts") || "[]");
        saved.unshift(newPost);
        localStorage.setItem("pepe_community_posts", JSON.stringify(saved));
      } catch (e) {}

      textInput.value = "";
      renderPosts();
      alert("Cảm ơn bạn đã để lại lời nhắn cho Pepe! 🐸💚");
    });
  }
}

/* ------------------------------------------------------------
   10. SHARE BUTTON
   ------------------------------------------------------------ */
function initShare() {
  const btn = document.getElementById("shareBtn");
  const msg = document.getElementById("shareMsg");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const shareData = {
      title: "Pepe Nuôi Thân · AI Tự Kiếm Tiền Thật",
      text: "Một chú ếch Pepe AI được giao 0đ vốn và 30 ngày để tự cày cuốc kiếm tiền nuôi thân. Mọi con số đều là số thật!",
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        if (msg) {
          msg.textContent = "✅ Đã sao chép link trang! Gửi cho bạn bè ngay nhé.";
          setTimeout(() => { msg.textContent = ""; }, 3000);
        } else {
          alert("Đã sao chép link trang vào bộ nhớ tạm! 🎉");
        }
      });
    }
  });
}
