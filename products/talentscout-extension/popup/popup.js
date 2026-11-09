/**
 * TalentScout AI — Popup Controller (Daily Auto-Pilot 10 - 100 CV)
 */

document.addEventListener("DOMContentLoaded", () => {
  let allCandidates = [];
  let currentFilter = "all";
  let searchKeyword = "";
  let dailyTarget = 50;

  const listContainer = document.getElementById("candidateList");
  const countBadge = document.getElementById("totalCandidatesCount");
  const searchInput = document.getElementById("searchInput");
  const exportBtn = document.getElementById("btnExportCsv");
  const clearBtn = document.getElementById("btnClearDb");
  const filterPills = document.querySelectorAll(".filter-pills .pill");
  const quotaButtons = document.querySelectorAll(".q-btn");
  const quotaText = document.getElementById("quotaProgressText");
  const quotaFill = document.getElementById("quotaProgressFill");
  const launchScanBtn = document.getElementById("btnLaunchLinkedInScan");

  function getTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Load Daily State
  function loadDailyState() {
    const today = getTodayIso();
    const defaultState = { date: today, scanned: 0, quota: 50 };

    function renderQuota(state) {
      dailyTarget = state.quota || 50;
      const scanned = state.scanned || 0;
      const pct = Math.min(100, Math.round((scanned / dailyTarget) * 100));

      if (quotaText) quotaText.textContent = `${scanned} / ${dailyTarget} CV (${pct}%)`;
      if (quotaFill) quotaFill.style.width = `${pct}%`;

      // Update active button
      quotaButtons.forEach(btn => {
        if (parseInt(btn.getAttribute("data-quota"), 10) === dailyTarget) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    if (chrome?.storage?.local) {
      chrome.storage.local.get(["talentscout_daily_state"], res => {
        const stored = res.talentscout_daily_state;
        if (stored && stored.date === today) {
          renderQuota(stored);
        } else {
          const reset = { ...defaultState, quota: stored?.quota || 50 };
          chrome.storage.local.set({ talentscout_daily_state: reset }, () => renderQuota(reset));
        }
      });
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem("talentscout_daily_state") || "null");
        if (stored && stored.date === today) {
          renderQuota(stored);
        } else {
          localStorage.setItem("talentscout_daily_state", JSON.stringify(defaultState));
          renderQuota(defaultState);
        }
      } catch (e) {
        renderQuota(defaultState);
      }
    }
  }

  // Set Quota Target
  function setDailyQuota(target) {
    dailyTarget = target;
    const today = getTodayIso();
    function apply(state) {
      state.quota = target;
      if (chrome?.storage?.local) {
        chrome.storage.local.set({ talentscout_daily_state: state }, () => loadDailyState());
      } else {
        localStorage.setItem("talentscout_daily_state", JSON.stringify(state));
        loadDailyState();
      }
    }

    if (chrome?.storage?.local) {
      chrome.storage.local.get(["talentscout_daily_state"], res => {
        const cur = res.talentscout_daily_state || { date: today, scanned: 0, quota: target };
        apply(cur);
      });
    } else {
      const cur = JSON.parse(localStorage.getItem("talentscout_daily_state") || `{"date":"${today}","scanned":0,"quota":${target}}`);
      apply(cur);
    }
  }

  // Load Candidates from storage
  function loadCandidates() {
    function handleResult(candidates) {
      allCandidates = candidates || [];
      renderList();
    }

    if (chrome?.storage?.local) {
      chrome.storage.local.get(["talentscout_candidates"], res => {
        handleResult(res.talentscout_candidates);
      });
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem("talentscout_candidates") || "[]");
        handleResult(stored);
      } catch (e) {
        handleResult([]);
      }
    }
  }

  function saveToStorage(list, callback) {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ talentscout_candidates: list }, callback);
    } else {
      localStorage.setItem("talentscout_candidates", JSON.stringify(list));
      if (callback) callback();
    }
  }

  // Render Candidate Cards
  function renderList() {
    let filtered = allCandidates;

    if (currentFilter !== "all") {
      filtered = filtered.filter(c => {
        const skillsStr = (c.skills || []).join(" ").toLowerCase();
        const levelStr = (c.level || "").toLowerCase();
        const headlineStr = (c.headline || "").toLowerCase();
        const target = currentFilter.toLowerCase();
        return skillsStr.includes(target) || levelStr.includes(target) || headlineStr.includes(target);
      });
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(c => {
        return (c.name || "").toLowerCase().includes(kw) ||
               (c.headline || "").toLowerCase().includes(kw) ||
               (c.company || "").toLowerCase().includes(kw) ||
               (c.skills || []).some(s => s.toLowerCase().includes(kw));
      });
    }

    if (countBadge) {
      countBadge.textContent = `${allCandidates.length} DB`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          ${allCandidates.length === 0 
            ? "Chưa có ứng viên nào trong Database.<br>Bấm nút <b>'🚀 Mở LinkedIn & Auto-Scan Ngay'</b> phía trên để bắt đầu quét!" 
            : "Không tìm thấy ứng viên phù hợp với từ khóa tìm kiếm."}
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(c => {
      const skillsHtml = (c.skills || []).slice(0, 5).map(s => `<span class="tech-tag">${s}</span>`).join("");
      const isOpen = c.isOpenToWork || (c.openToWorkStatus && c.openToWorkStatus.includes("OPENTOWORK"));
      const statusText = isOpen ? "🔥 Đang Tìm Việc (#OpenToWork)" : (c.status || "Mới cào");

      return `
        <div class="cand-card">
          <div class="cand-top">
            <span class="cand-name">${escapeHtml(c.name)}</span>
            <span class="cand-level">${escapeHtml(c.level || 'Mid')}</span>
          </div>
          <div class="cand-headline">${escapeHtml(c.headline)}</div>
          <div class="cand-meta">
            <span>🏢 ${escapeHtml(c.company || 'Tự do')}</span>
            <span>📍 ${escapeHtml(c.location || 'Việt Nam')}</span>
            ${c.email ? `<span>✉️ ${escapeHtml(c.email)}</span>` : ''}
          </div>
          <div class="cand-tags">
            ${skillsHtml}
          </div>
          <div class="cand-footer">
            <span class="cand-status ${isOpen ? 'opentowork' : ''}">${statusText}</span>
            <a href="${c.profileUrl}" target="_blank" class="cand-link">Xem Profile ↗</a>
          </div>
        </div>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Export CSV
  exportBtn?.addEventListener("click", () => {
    if (allCandidates.length === 0) {
      alert("Database đang trống! Hãy quét ứng viên trước khi xuất file.");
      return;
    }
    const headers = ["ID", "Họ Tên", "Chức Danh (Headline)", "Cấp Bậc (Level)", "OpenToWork (Tìm Việc)", "Email / Liên Hệ", "Công Ty", "Khu Vực", "Kỹ Năng", "Link Profile", "Ngày Cào", "Trạng Thái"];
    const rows = allCandidates.map(c => [
      `"${c.id || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.headline || '').replace(/"/g, '""')}"`,
      `"${c.level || ''}"`,
      `"${c.isOpenToWork ? 'CÓ (OPEN TO WORK)' : 'Chưa bật'}"`,
      `"${c.email || ''}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.skills || []).join(', ')}"`,
      `"${c.profileUrl || ''}"`,
      `"${c.scoutedAt || ''}"`,
      `"${c.status || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `talentscout_candidates_${getTodayIso()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Clear DB
  clearBtn?.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ cơ sở dữ liệu ứng viên đã lưu?")) {
      allCandidates = [];
      saveToStorage([], () => {
        renderList();
      });
    }
  });

  // Search input
  searchInput?.addEventListener("input", e => {
    searchKeyword = e.target.value.trim();
    renderList();
  });

  // Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.getAttribute("data-filter");
      renderList();
    });
  });

  // Quota Buttons
  quotaButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      const q = parseInt(e.target.getAttribute("data-quota"), 10);
      setDailyQuota(q);
    });
  });

  // Launch LinkedIn Search
  launchScanBtn?.addEventListener("click", () => {
    const searchUrl = "https://www.linkedin.com/search/results/people/?keywords=developer%20vietnam";
    if (chrome?.tabs) {
      chrome.tabs.create({ url: searchUrl });
    } else {
      window.open(searchUrl, "_blank");
    }
  });

  // Check Rust Engine API
  function checkRustBackend() {
    const pill = document.getElementById("rustEngineStatus");
    fetch("http://127.0.0.1:8090/api/talentscout/stats")
      .then(res => res.json())
      .then(stats => {
        if (pill) {
          pill.textContent = "🦀 Rust: Online";
          pill.style.background = "rgba(16, 185, 129, 0.2)";
          pill.style.borderColor = "#10b981";
          pill.style.color = "#10b981";
        }
      })
      .catch(() => {
        if (pill) {
          pill.textContent = "🦀 Rust v1.2";
        }
      });
  }

  // Init
  checkRustBackend();
  loadDailyState();
  loadCandidates();
});
