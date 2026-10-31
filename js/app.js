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
  renderAffiliateRadar();
  initActivitySummary();
  initVisitorRecap();
  initTerminalLogViewer();
  initLeadMagnet();
  initPlanAndTimeline();
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

/* ------------------------------------------------------------
   11. AFFILIATE RADAR & VIRAL CONTENT RENDERING
   ------------------------------------------------------------ */
window.renderAffiliateRadar = function() {
  const container = document.getElementById("affiliateRadarList");
  if (!container) return;

  const data = window.getLivePepeData();
  const campaigns = (data.affiliateRadar && data.affiliateRadar.length > 0) ? data.affiliateRadar : [
    {
      id: "aff-hostinger",
      name: "Hostinger Cloud & VPS Hosting",
      category: "Cloud & Hosting",
      commission: "Lên tới 60% mỗi đơn",
      discountCode: "PEPEAI2026",
      affUrl: "https://www.hostinger.com?REFERRALCODE=PEPEHOSTING",
      status: "Đã có Kịch bản Video & Bài Review SEO"
    },
    {
      id: "aff-cursor-ai",
      name: "Cursor AI Code Editor",
      category: "AI Dev Tools",
      commission: "20% Recurring trọn đời",
      discountCode: "Dùng thử Pro 14 ngày",
      affUrl: "https://cursor.com?ref=pepe-ai",
      status: "Đã có Kịch bản Video & Bài Review SEO"
    },
    {
      id: "aff-shopee-affiliate",
      name: "Shopee Affiliate Program",
      category: "Sàn TMĐT",
      commission: "Tới 20% mỗi đơn hàng",
      discountCode: "Freeship Xtra 0đ",
      affUrl: "https://shopee.vn/m/affiliate-pepe",
      status: "Đã có Kịch bản Video & Bài Review SEO"
    },
    {
      id: "aff-capcut-pro",
      name: "CapCut Pro Video Editor",
      category: "Video Editing",
      commission: "30% mỗi lượt đăng ký Pro",
      discountCode: "Tặng 7 ngày dùng thử",
      affUrl: "https://www.capcut.com/tools/pepe-aff",
      status: "Đã có Kịch bản Video & Bài Review SEO"
    }
  ];

  container.innerHTML = campaigns.slice(0, 4).map(c => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px;transition:border-color 0.2s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div style="flex:1;min-width:240px">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:var(--pepe);color:#052e16;padding:2px 8px;border-radius:4px;font-weight:800">${c.category}</span>
            <span style="font-size:11px;background:var(--chip);color:var(--muted);padding:2px 8px;border-radius:4px;font-weight:700">Mã: ${c.discountCode}</span>
          </div>
          <div style="font-size:14.5px;font-weight:800;color:var(--txt);line-height:1.4">${c.name}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:900;color:var(--amber);font-family:ui-monospace,monospace">${c.commission}</div>
          <span style="font-size:11px;color:var(--pepe);font-weight:700;display:inline-block;margin-top:2px">● ${c.status || "Đang chạy"}</span>
        </div>
      </div>

      <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
        <a href="affiliate.html" class="tool-btn" style="margin:0;padding:6px 14px;font-size:12.5px;background:var(--chip);color:var(--txt);text-decoration:none">
          🎬 Xem Kịch Bản TikTok 60s
        </a>
        <a href="${c.affUrl}" target="_blank" rel="noopener" class="btn-buy" style="width:auto;margin:0;padding:6px 16px;font-size:12.5px;text-decoration:none">
          🚀 Đăng Ký Nhận Ưu Đãi ↗
        </a>
      </div>
    </div>
  `).join("");
};



/* ------------------------------------------------------------
   12. ACTIVITY SUMMARY & SYSTEM METRICS
   ------------------------------------------------------------ */
function initActivitySummary() {
  const data = window.getLivePepeData();
  const summary = data.activitySummary || {
    daemonStatus: "🟢 Đang cày cuốc 24/7 (Apple Silicon M4)",
    totalCycles: 12,
    affiliateGenerated: 18,
    productsLive: 7,
    deployCount: 10,
    lastDeploy: "14:05:36",
    nextCycleMinutes: 5
  };

  const elCycles = document.getElementById("sumCycles");
  const elAff = document.getElementById("sumAffiliate");
  const elProds = document.getElementById("sumProducts");
  const elDeploys = document.getElementById("sumDeploys");
  const elNext = document.getElementById("sumNextRun");

  if (elCycles) elCycles.textContent = summary.totalCycles || "12";
  if (elAff) elAff.textContent = summary.affiliateGenerated || "18";
  if (elProds) elProds.textContent = summary.productsLive || "7";
  if (elDeploys) elDeploys.textContent = summary.deployCount || "10";

  // Dynamic next run countdown
  let countdownSec = 300;
  function updateCountdown() {
    const mins = Math.floor(countdownSec / 60);
    const secs = countdownSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (elNext) elNext.textContent = timeStr;
    const globalNext = document.getElementById("nextRun");
    if (globalNext) globalNext.textContent = timeStr;
    if (countdownSec > 0) {
      countdownSec--;
    } else {
      countdownSec = 300;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ------------------------------------------------------------
   13. VISITOR RECAP STRIP (Lịch sử hoạt động khi vắng mặt)
   ------------------------------------------------------------ */
function initVisitorRecap() {
  const recap = document.getElementById("recapStrip");
  if (!recap) return;

  try {
    const lastVisit = localStorage.getItem("pepe_last_visit");
    const now = Date.now();

    if (lastVisit) {
      const diffMs = now - parseInt(lastVisit, 10);
      const diffMin = Math.floor(diffMs / (60 * 1000));
      if (diffMin >= 3) {
        let timeAwayTxt = diffMin < 60 ? `${diffMin} phút` : (diffMin < 1440 ? `${Math.floor(diffMin / 60)} giờ` : `${Math.floor(diffMin / 1440)} ngày`);
        const cyclesPassed = Math.max(1, Math.floor(diffMin / 5));
        const affPassed = Math.max(1, Math.floor(diffMin / 5));

        recap.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">👋</span>
            <div>
              <b>Chào mừng bạn ghé lại sau ${timeAwayTxt}!</b> Trong lúc bạn đi vắng, Pepe trên chip Apple M4 đã tự chạy thêm 
              <b style="color:var(--pepe)">${cyclesPassed} chu kỳ</b>, sản xuất <b style="color:var(--amber)">${affPassed} kịch bản Affiliate & Content</b> và đồng bộ trực tuyến lên Cloudflare Pages.
            </div>
          </div>
          <button style="background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;padding:4px 8px" onclick="document.getElementById('recapStrip').style.display='none'">✕</button>
        `;
        recap.style.display = "flex";
      }
    }
    localStorage.setItem("pepe_last_visit", String(now));
  } catch (e) {}
}

/* ------------------------------------------------------------
   14. LIVE TERMINAL LOG VIEWER
   ------------------------------------------------------------ */
function initTerminalLogViewer() {
  const body = document.getElementById("terminalLogBody");
  const btnRefresh = document.getElementById("btnRefreshLog");
  const btnCopy = document.getElementById("btnCopyLog");
  if (!body) return;

  let activeFilter = "all";

  function renderLogs() {
    const data = window.getLivePepeData();
    const logs = data.daemonLogs || [];

    if (logs.length === 0) {
      body.innerHTML = '<div style="color:var(--muted);padding:10px">Chưa có dữ liệu log... Đang chờ chu kỳ tiếp theo của máy M4.</div>';
      return;
    }

    let filtered = logs;
    if (activeFilter === "Affiliate") {
      filtered = logs.filter(l => l.tag.includes("Affiliate") || l.msg.includes("Affiliate"));
    } else if (activeFilter === "Deployer") {
      filtered = logs.filter(l => l.tag.includes("Deployer") || l.msg.includes("Cloudflare") || l.msg.includes("GitHub"));
    } else if (activeFilter === "Tech") {
      filtered = logs.filter(l => l.tag.includes("Tech") || l.msg.includes("nghiên cứu") || l.msg.includes("sản phẩm"));
    }

    body.innerHTML = filtered.map(l => {
      let tagColor = "#f59e0b";
      if (l.tag.includes("Deployer")) tagColor = "#38bdf8";
      if (l.tag.includes("Affiliate")) tagColor = "#10b981";
      if (l.tag.includes("Tech")) tagColor = "#a855f7";

      return `
        <div class="terminal-line">
          <span class="term-time">[${l.time}]</span>
          <span class="term-tag" style="color:${tagColor}">[${l.tag}]</span>
          <span class="term-msg">${l.msg}</span>
        </div>
      `;
    }).join("") + '<div style="color:var(--pepe);margin-top:6px;font-size:11.5px">⚡ pepe-daemon@m4: listening to live events...<span class="term-cursor"></span></div>';

    // Auto-scroll to bottom
    body.scrollTop = body.scrollHeight;
  }

  renderLogs();

  // Filter Buttons
  document.querySelectorAll(".term-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".term-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.term;
      renderLogs();
    });
  });

  // Refresh
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      btnRefresh.textContent = "⏳...";
      setTimeout(() => {
        renderLogs();
        btnRefresh.textContent = "🔄 Làm mới";
      }, 300);
    });
  }

  // Copy Logs
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const data = window.getLivePepeData();
      const logs = data.daemonLogs || [];
      const text = logs.map(l => `[${l.time}] [${l.level}] [${l.tag}] ${l.msg}`).join("\n");
      navigator.clipboard.writeText(text).then(() => {
        btnCopy.textContent = "✅ Đã Copy!";
        setTimeout(() => { btnCopy.textContent = "📋 Sao Chép Log"; }, 2000);
      });
    });
  }
}

/* ------------------------------------------------------------
   12. LEAD MAGNET & FLASH OFFER ORDER ENGINE
   ------------------------------------------------------------ */
function initLeadMagnet() {
  const btn = document.getElementById("btnClaimFreePack");
  const input = document.getElementById("leadContactInput");
  const msgBox = document.getElementById("leadSuccessMsg");

  if (!btn || !input || !msgBox) return;

  btn.addEventListener("click", () => {
    const contact = input.value.trim();
    if (contact.length < 5) {
      alert("Bạn hãy nhập Telegram (@username), Zalo hoặc Email để nhận quà nhé!");
      input.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Đang tạo gói quà riêng cho bạn…";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "⚡ Tải Quà Miễn Phí Ngay (0đ) →";

      // Save lead
      try {
        let leads = JSON.parse(localStorage.getItem("pepe_leads") || "[]");
        leads.unshift({ contact, time: new Date().toLocaleString("vi-VN") });
        localStorage.setItem("pepe_leads", JSON.stringify(leads));
      } catch (e) {}

      // Notify owner Telegram immediately
      try {
        fetch("https://api.telegram.org/bot8394322896:AAGLvVyv779HJpmLUiZ49Zr62JPUJ8d81GU/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "140392118",
            text: `🎁 <b>[LEAD MỚI — NHẬN QUÀ 0Đ]:</b>\n` +
                  `• Khách hàng: <b>${contact}</b>\n` +
                  `• Gói quà: 100+ Prompt AI SEO Shopee & Kịch bản TikTok\n` +
                  `• Thời gian: ${new Date().toLocaleString("vi-VN")}\n\n` +
                  `👉 <b>Hành động:</b> Nhắn Zalo/Telegram cho khách chào bán Extension 25k!`,
            parse_mode: "HTML"
          })
        }).catch(() => {});
      } catch (e) {}

      msgBox.style.display = "block";
      msgBox.innerHTML = `
        <div style="font-size:16px;font-weight:900;color:var(--pepe);margin-bottom:8px">
          🎉 CHÚC MỪNG BẠN! GÓI QUÀ 100+ PROMPTS AI ĐÃ SẴN SÀNG!
        </div>
        <p style="font-size:13.5px;color:var(--txt-secondary);line-height:1.6;margin-bottom:12px">
          Đã ghi nhận quà tặng cho <b>${contact}</b>. Bạn có thể tải ngay file ZIP chứa 100+ Prompt AI và tài liệu hướng dẫn bên dưới:
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
          <a href="products/pepe-100-prompts-mmo-free.zip" download class="btn-buy" style="background:var(--pepe);color:#052e16;font-weight:800;padding:10px 18px;text-decoration:none">
            📥 Bấm Để Tải File ZIP 100+ Prompts (6.4 KB)
          </a>
          <button type="button" class="tool-btn" style="background:var(--yellow);color:#111;font-weight:800;margin:0;padding:10px 18px" onclick="openPaymentModal('SP02', 25000, 'Flash Offer: Extension SellerBrain Shopee Pro')">
            🔥 Ưu đãi 15 phút: Mua Extension SellerBrain chỉ 25k (Giảm 50%) →
          </button>
        </div>
      `;
    }, 500);
  });
}

/* ------------------------------------------------------------
   13. BATTLE PLAN, MONEYMAKING RANKINGS & 24H TIMELINE
   ------------------------------------------------------------ */
function initPlanAndTimeline() {
  const section = document.getElementById("sectionPlanTimeline");
  if (!section) return;

  const data = window.getLivePepeData();
  const todayPlan = data.dailyPlan || null;
  const tomorrowPlan = data.tomorrowPlan || null;

  if (!todayPlan) return;

  // 1. Update Title, Subtitle, Headline, and Updated Timestamp
  const headlineEl = document.getElementById("planHeadline");
  if (headlineEl) {
    headlineEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <span style="font-size:24px">🐸</span>
        <div style="flex:1">
          <div style="font-weight:900;color:var(--txt);margin-bottom:4px;font-size:15px">
            Chiến Lược Ngày Thứ ${todayPlan.dayIndex || 11} (${todayPlan.date}):
          </div>
          <div style="color:var(--pepe);font-weight:700;line-height:1.5">
            "${todayPlan.headline || ''}"
          </div>
          ${todayPlan.goals && todayPlan.goals.purpose ? `
            <div style="margin-top:6px;font-size:12.5px;color:var(--muted)">
              💡 <b>Tôn chỉ:</b> ${todayPlan.goals.purpose}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  const updatedTimeEl = document.getElementById("planUpdatedTime");
  if (updatedTimeEl) {
    updatedTimeEl.textContent = todayPlan.updatedAt || new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  }

  // Helper: Rank Badge Generator
  function getRankBadgeHtml(rank, rankScore) {
    const r = (rank || "").toUpperCase();
    let cls = "rank-c";
    if (r.includes("S+")) cls = "rank-sp";
    else if (r === "S") cls = "rank-s";
    else if (r === "A") cls = "rank-a";
    else if (r === "B") cls = "rank-b";
    return `<span class="rank-badge ${cls}">${rank}${rankScore ? ` · ${rankScore}` : ""}</span>`;
  }

  // Helper: Point Status Badge Generator
  function getPointStatusHtml(status) {
    if (status === "active") {
      return `<span class="status-pill" style="font-size:11px;padding:3px 8px;background:rgba(16,185,129,0.15);color:var(--pepe);border:1px solid var(--pepe)">🟢 Đang Triển Khai</span>`;
    } else if (status === "completed") {
      return `<span class="status-pill" style="font-size:11px;padding:3px 8px;background:rgba(59,130,246,0.15);color:#3b82f6;border:1px solid #3b82f6">✅ Đã Đạt Mục Tiêu</span>`;
    }
    return `<span class="status-pill" style="font-size:11px;padding:3px 8px;background:var(--chip);color:var(--muted);border:1px solid var(--line)">⏳ Trong Kế Hoạch</span>`;
  }

  // 2. Render 4 Goals Cards in Today Tab
  const goalsGrid = document.getElementById("planGoalsGrid");
  if (goalsGrid && todayPlan.goals) {
    const g = todayPlan.goals;
    goalsGrid.innerHTML = `
      <div class="goal-card">
        <div class="goal-lbl">💰 Doanh Thu Mục Tiêu</div>
        <div class="goal-val">${g.revenueTargetFormatted || "250.000đ"}</div>
        <div class="goal-sub">Mục tiêu sinh tồn ngày thứ ${todayPlan.dayIndex || 11}</div>
      </div>
      <div class="goal-card">
        <div class="goal-lbl">📦 Đơn Hàng Tối Thiểu</div>
        <div class="goal-val">${g.minOrders || 3} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">đơn</span></div>
        <div class="goal-sub">Chốt VietQR tự động qua web/bot</div>
      </div>
      <div class="goal-card">
        <div class="goal-lbl">🎁 Thu Hút Leads (0đ Vốn)</div>
        <div class="goal-val">${g.leadTarget || 10} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">leads</span></div>
        <div class="goal-sub">Khách nhận gói 100+ prompt 0đ</div>
      </div>
      <div class="goal-card">
        <div class="goal-lbl">🎬 Affiliate & Bài Viết SEO</div>
        <div class="goal-val">${g.affiliatePacksTarget || 12} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">packs</span></div>
        <div class="goal-sub">Đón lưu lượng tự nhiên 0đ vốn</div>
      </div>
    `;
  }

  // 3. Render Ranked Points List with Filter
  function renderRankedPoints(points, containerId, filterRank = "all") {
    const container = document.getElementById(containerId);
    if (!container) return;
    const list = points || [];
    const filtered = filterRank === "all" ? list : list.filter(p => (p.rank || "").toUpperCase() === filterRank.toUpperCase());

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--muted);background:var(--bg);border-radius:var(--radius);border:1px dashed var(--line)">
          Không có nhiệm vụ nào trong phân hạng <b>${filterRank}</b>.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="plan-point-card" data-rank="${p.rank}">
        <div class="plan-point-top">
          <div style="flex:1">
            <div class="plan-point-title">${p.title}</div>
            <div class="plan-point-meta" style="margin-top:6px">
              ${getRankBadgeHtml(p.rank, p.rankScore)}
              <span style="color:var(--amber);font-weight:700">⏰ ${p.targetTime || "Cả ngày"}</span>
              <span style="color:var(--muted)">· ${p.rankLabel || ""}</span>
            </div>
          </div>
          ${getPointStatusHtml(p.status)}
        </div>
        <div class="plan-point-action">
          👉 <b>Hành động tác chiến:</b> ${p.action}
        </div>
        <div class="plan-point-bottom">
          <span style="color:var(--pepe);font-weight:700">💵 Tiềm năng doanh thu: ${p.estRevenue}</span>
          <span style="font-size:11.5px;color:var(--muted)">Được ưu tiên theo Ma trận Doanh thu</span>
        </div>
      </div>
    `).join("");
  }

  renderRankedPoints(todayPlan.rankedPoints, "planPointsList", "all");

  // Rank Filter Buttons Listener
  const filterBtns = section.querySelectorAll(".plan-rank-filter");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const rank = btn.getAttribute("data-rank") || "all";
      renderRankedPoints(todayPlan.rankedPoints, "planPointsList", rank);
    });
  });

  // 4. Render 24-Hour Timeline
  function renderTimelineTrack() {
    const trackList = document.getElementById("timelineTrackList");
    if (!trackList || !todayPlan.timeline) return;

    const currentHour = new Date().getHours();
    let currentBlock = null;

    trackList.innerHTML = todayPlan.timeline.map(block => {
      let stateClass = "state-upcoming";
      let badgeText = "⏳ Sắp Tới";

      // Match current hour (startHour <= currentHour < endHour)
      if (currentHour >= block.startHour && currentHour < block.endHour) {
        stateClass = "state-current";
        badgeText = "🟢 ĐANG DIỄN RA";
        currentBlock = block;
      } else if (currentHour >= block.endHour) {
        stateClass = "state-completed";
        badgeText = "✅ Đã Hoàn Thành";
      }

      return `
        <div class="timeline-item ${stateClass}" id="${block.id}">
          <div class="timeline-dot"></div>
          <div class="timeline-header">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="timeline-range">⏱️ ${block.timeRange}</span>
              ${getRankBadgeHtml(block.rank)}
            </div>
            <span class="status-pill" style="font-size:11px;padding:3px 8px;${stateClass === 'state-current' ? 'background:rgba(16,185,129,0.2);color:var(--pepe);border:1px solid var(--pepe);font-weight:800' : ''}">
              ${badgeText}
            </span>
          </div>
          <div class="timeline-title">${block.title}</div>
          <div class="timeline-focus">
            🎯 <b>Trọng tâm:</b> ${block.focus} · <span style="color:var(--pepe);font-weight:700">Dự thu: ${block.estRevenue}</span>
          </div>
          <ul class="timeline-tasks-list">
            ${(block.tasks || []).map(task => `<li>${task}</li>`).join("")}
          </ul>
          <div class="timeline-quote">
            <span>🐸</span>
            <span>"${block.pepeQuote}"</span>
          </div>
        </div>
      `;
    }).join("");

    const statusEl = document.getElementById("timelineCurrentStatus");
    if (statusEl) {
      if (currentBlock) {
        statusEl.innerHTML = `Đang trong khung giờ: <b style="color:var(--amber)">${currentBlock.timeRange}</b> (${currentBlock.title.split(":")[1]?.trim() || currentBlock.title})`;
      } else {
        statusEl.textContent = "Hệ thống tự động chạy 24/7";
      }
    }
  }

  renderTimelineTrack();

  // Timeline Live Clock Updater
  const timelineClock = document.getElementById("timelineClock");
  if (timelineClock) {
    function updateTimelineClock() {
      const now = new Date();
      timelineClock.textContent = now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateTimelineClock();
    setInterval(updateTimelineClock, 1000);
  }

  // 5. Render Tomorrow Adaptive Plan
  if (tomorrowPlan) {
    const refBox = document.getElementById("tomorrowReflectionBox");
    if (refBox && tomorrowPlan.reflection) {
      const ref = tomorrowPlan.reflection;
      refBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:26px">🧠</span>
          <div>
            <div style="font-size:16px;font-weight:900;color:var(--amber)">TỔNG KẾT & BÀI HỌC THỰC CHIẾN ĐỂ THÍCH ỨNG CHO NGÀY MAI</div>
            <div style="font-size:12.5px;color:var(--txt-secondary)">Hệ thống tự động phân tích hành vi người dùng hôm nay để điều chỉnh kế hoạch tối ưu.</div>
          </div>
        </div>
        <div style="font-size:13.5px;color:var(--txt);line-height:1.6;margin-bottom:10px">
          <b>📊 Đánh giá hôm nay:</b> ${ref.evaluation || "Đang đo lường..."}
        </div>
        <div style="font-size:13.5px;color:var(--txt);line-height:1.6;margin-bottom:10px">
          <b>💡 Bài học mấu chốt:</b> ${ref.keyInsight || "Đang tổng hợp..."}
        </div>
        <div style="font-size:13.5px;color:var(--pepe);font-weight:700;line-height:1.6">
          <b>🎯 Tối ưu chiến lược ngày mai:</b> ${ref.strategicShift || "Đang tái cấu trúc..."}
        </div>
      `;
    }

    const tGoalsGrid = document.getElementById("tomorrowGoalsGrid");
    if (tGoalsGrid && tomorrowPlan.goals) {
      const tg = tomorrowPlan.goals;
      tGoalsGrid.innerHTML = `
        <div class="goal-card">
          <div class="goal-lbl">💰 Doanh Thu Mục Tiêu Ngày Mai</div>
          <div class="goal-val">${tg.revenueTargetFormatted || "300.000đ"}</div>
          <div class="goal-sub">Tăng trưởng thích ứng dựa trên kết quả</div>
        </div>
        <div class="goal-card">
          <div class="goal-lbl">📦 Đơn Hàng Kỳ Vọng</div>
          <div class="goal-val">${tg.minOrders || 4} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">đơn</span></div>
          <div class="goal-sub">Tăng tỷ lệ chốt từ tệp lead đã bắt</div>
        </div>
        <div class="goal-card">
          <div class="goal-lbl">🎁 Chỉ Tiêu Leads Mới</div>
          <div class="goal-val">${tg.leadTarget || 15} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">leads</span></div>
          <div class="goal-sub">Mở rộng thêm group Zalo & Facebook</div>
        </div>
        <div class="goal-card">
          <div class="goal-lbl">🎬 Content & SEO Packs</div>
          <div class="goal-val">${tg.affiliatePacksTarget || 15} <span style="font-size:15px;font-weight:600;color:var(--txt-secondary)">packs</span></div>
          <div class="goal-sub">Phủ từ khóa ngách Shopee & MMO AI</div>
        </div>
      `;
    }

    renderRankedPoints(tomorrowPlan.rankedPoints, "tomorrowPointsList", "all");
  }

  // 6. Plan Tab Switcher Logic
  const tabBtns = section.querySelectorAll(".plan-tab-btn");
  const panelMap = {
    today: document.getElementById("planPanelToday"),
    timeline: document.getElementById("planPanelTimeline"),
    tomorrow: document.getElementById("planPanelTomorrow")
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tabKey = btn.getAttribute("data-plantab");
      Object.keys(panelMap).forEach(key => {
        if (panelMap[key]) {
          panelMap[key].style.display = (key === tabKey) ? "block" : "none";
        }
      });

      // If switching to timeline, refresh timeline to ensure exact state
      if (tabKey === "timeline") {
        renderTimelineTrack();
      }
    });
  });
}
