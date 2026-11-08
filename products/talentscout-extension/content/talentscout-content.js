/**
 * TalentScout AI — LinkedIn Candidate DOM Extractor & Auto-Pilot Harvester (10 - 100 CV/ngày)
 * Runs directly inside the user's browser context (Safe, human-jitter & ban-proof).
 */

(function () {
  console.log("🐸 [TalentScout AI] Extension activated on LinkedIn / Talent Scout Portal!");

  // Recognized tech keywords for auto-tagging
  const TECH_KEYWORDS = [
    "React", "React Native", "Vue", "Angular", "Node.js", "Nodejs", "TypeScript", "JavaScript",
    "Python", "Django", "FastAPI", "Flask", "AI", "Machine Learning", "LLM", "Deep Learning",
    "Java", "Spring Boot", "Golang", "Go", "Rust", "C++", "C#", ".NET", "PHP", "Laravel",
    "Flutter", "iOS", "Swift", "Android", "Kotlin", "AWS", "GCP", "Azure", "DevOps",
    "Docker", "Kubernetes", "CI/CD", "PostgreSQL", "MongoDB", "MySQL", "Redis",
    "Product Manager", "Scrum Master", "Tech Lead", "Solution Architect", "Engineering Manager",
    "UI/UX", "Figma", "Data Engineer", "QA Automation", "Tester", "Headhunter", "HR"
  ];

  // Helper: Extract skills from text
  function extractTechTags(text) {
    if (!text) return [];
    const found = new Set();
    TECH_KEYWORDS.forEach(tech => {
      const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = /[a-zA-Z0-9_]$/.test(tech) 
        ? `\\b${escaped}\\b` 
        : `(?:\\b|\\s|^)${escaped}(?:\\b|\\s|[.,;!?]|$)`;
      const regex = new RegExp(pattern, "i");
      if (regex.test(text)) {
        found.add(tech);
      }
    });
    return Array.from(found);
  }

  // Helper: Daily tracking state
  function getTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getDailyState(callback) {
    const today = getTodayIso();
    const defaultState = { date: today, scanned: 0, quota: 50 };

    if (!chrome?.storage?.local) {
      try {
        const stored = JSON.parse(localStorage.getItem("talentscout_daily_state") || "null");
        if (stored && stored.date === today) {
          callback(stored);
        } else {
          localStorage.setItem("talentscout_daily_state", JSON.stringify(defaultState));
          callback(defaultState);
        }
      } catch (e) {
        callback(defaultState);
      }
      return;
    }

    chrome.storage.local.get(["talentscout_daily_state"], result => {
      const stored = result.talentscout_daily_state;
      if (stored && stored.date === today) {
        callback(stored);
      } else {
        const newState = { ...defaultState, quota: stored?.quota || 50 };
        chrome.storage.local.set({ talentscout_daily_state: newState }, () => {
          callback(newState);
        });
      }
    });
  }

  function updateDailyState(addedCount, callback) {
    getDailyState(state => {
      state.scanned = (state.scanned || 0) + addedCount;
      if (!chrome?.storage?.local) {
        localStorage.setItem("talentscout_daily_state", JSON.stringify(state));
        if (callback) callback(state);
      } else {
        chrome.storage.local.set({ talentscout_daily_state: state }, () => {
          if (callback) callback(state);
        });
      }
    });
  }

  // Parse Single Profile Page (/in/...)
  function parseCurrentProfile() {
    try {
      const nameEl = document.querySelector("h1.text-heading-xlarge") ||
                     document.querySelector("h1") ||
                     document.querySelector(".pv-text-details__left-panel h1");
      const name = nameEl ? nameEl.innerText.trim() : "";

      const headlineEl = document.querySelector(".text-body-medium.break-words") ||
                         document.querySelector(".pv-text-details__left-panel .text-body-medium");
      const headline = headlineEl ? headlineEl.innerText.trim() : "";

      const locationEl = document.querySelector(".text-body-small.inline.t-black--light.break-words") ||
                         document.querySelector(".pv-text-details__left-panel span.text-body-small");
      const location = locationEl ? locationEl.innerText.trim() : "Việt Nam";

      // Current company extraction
      let company = "";
      const companyBtn = document.querySelector("button[aria-label*='Current company:']") ||
                         document.querySelector("div[aria-label='Current company']");
      if (companyBtn) {
        company = companyBtn.innerText.trim();
      } else if (headline.includes(" at ")) {
        company = headline.split(" at ")[1]?.split("|")[0]?.trim() || "";
      } else if (headline.includes(" @ ")) {
        company = headline.split(" @ ")[1]?.split("|")[0]?.trim() || "";
      }

      // About summary
      let about = "";
      const aboutEl = document.querySelector("#about ~ .display-flex .inline-show-more-text") ||
                      document.querySelector(".pv-about-section .pv-about__summary-text") ||
                      document.querySelector("section[data-view-name='profile-card'] div.inline-show-more-text--is-collapsed > span[aria-hidden='true']");
      if (aboutEl) {
        about = aboutEl.innerText.trim();
      }

      // Check #OpenToWork Badge
      let isOpenToWork = false;
      const profilePic = document.querySelector(".pv-top-card-profile-picture img, .pv-top-card__photo img, img.presence-entity__image, div.pv-top-card__non-self-photo-wrapper img");
      if (profilePic) {
        const titleAttr = (profilePic.getAttribute("title") || "").toUpperCase();
        const altAttr = (profilePic.getAttribute("alt") || "").toUpperCase();
        if (titleAttr.includes("OPEN_TO_WORK") || titleAttr.includes("OPEN TO WORK") || altAttr.includes("OPEN_TO_WORK") || altAttr.includes("OPEN TO WORK")) {
          isOpenToWork = true;
        }
      }
      if (!isOpenToWork && document.querySelector("[data-view-name='profile-card'] [aria-label*='Open to work'], .pv-open-to-work-card, [href*='open-to-work'], .opentowork-pill")) {
        isOpenToWork = true;
      }

      const expRoleEl = document.querySelector("section[data-view-name='profile-card'] div.t-bold span[aria-hidden='true']") ||
                        document.querySelector(".experience-item .t-bold span[aria-hidden='true']");
      const recentRole = expRoleEl ? expRoleEl.innerText.trim() : "";

      const profileUrl = window.location.origin + window.location.pathname;
      const combinedText = `${headline} ${about} ${recentRole}`;
      const skills = extractTechTags(combinedText);

      // Extract Email if candidate wrote it in bio
      const emailMatch = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const email = emailMatch ? emailMatch[0] : (isOpenToWork ? "Liên hệ qua InMail LinkedIn" : "Chưa công khai");

      // Seniority Level
      let level = "Mid-Level";
      const lower = headline.toLowerCase();
      if (lower.includes("intern") || lower.includes("fresher")) level = "Fresher / Intern";
      else if (lower.includes("junior")) level = "Junior";
      else if (lower.includes("lead") || lower.includes("principal") || lower.includes("architect")) level = "Tech Lead / Principal";
      else if (lower.includes("senior") || lower.includes("sr.")) level = "Senior";
      else if (lower.includes("manager") || lower.includes("head of") || lower.includes("director")) level = "Management / Director";

      return {
        id: "cand_" + Date.now(),
        name: name || "Ứng viên LinkedIn",
        headline: headline || "Không có tiêu đề",
        company: company || "Tự do / Chưa cập nhật",
        location: location,
        level: level,
        isOpenToWork: isOpenToWork,
        openToWorkStatus: isOpenToWork ? "🔥 CÓ (#OPENTOWORK)" : "Chưa bật",
        email: email,
        recentRole: recentRole || headline,
        skills: skills.length > 0 ? skills : ["Chung"],
        profileUrl: profileUrl,
        scoutedAt: new Date().toLocaleDateString("vi-VN"),
        status: isOpenToWork ? "Sẵn sàng phỏng vấn" : "Đang có job tốt",
        notes: ""
      };
    } catch (e) {
      console.error("[TalentScout AI] Parse profile error:", e);
      return null;
    }
  }

  // Parse Search Results Page (/search/results/people/...)
  function parseSearchResults() {
    const cards = document.querySelectorAll(
      ".reusable-search__result-container, .search-results-container li, .entity-result, .search-result-card, div[data-view-name*='search-entity-result']"
    );
    const results = [];

    cards.forEach(card => {
      try {
        const linkEl = card.querySelector("a.app-aware-link[href*='/in/'], a[href*='/in/'], .cand-link");
        if (!linkEl) return;

        let profileUrl = linkEl.href.split("?")[0];
        const nameEl = card.querySelector(".entity-result__title-text a span[aria-hidden='true']") ||
                       card.querySelector(".entity-result__title-text a") ||
                       card.querySelector(".cand-name") ||
                       linkEl;
        const name = nameEl ? nameEl.innerText.trim() : "";

        const headlineEl = card.querySelector(".entity-result__primary-subtitle") ||
                           card.querySelector(".cand-headline");
        const headline = headlineEl ? headlineEl.innerText.trim() : "";

        const locationEl = card.querySelector(".entity-result__secondary-subtitle") ||
                           card.querySelector(".cand-location");
        const location = locationEl ? locationEl.innerText.trim() : "Việt Nam";

        const isOpenToWork = !!card.querySelector("img[alt*='Open to work'], img[title*='OPEN_TO_WORK'], .opentowork-pill, .badge-opentowork");

        let company = "Chưa cập nhật";
        if (headline.includes(" at ")) company = headline.split(" at ")[1]?.split("|")[0]?.trim() || "";
        else if (headline.includes(" @ ")) company = headline.split(" @ ")[1]?.split("|")[0]?.trim() || "";

        let level = "Mid-Level";
        const lower = headline.toLowerCase();
        if (lower.includes("intern") || lower.includes("fresher")) level = "Fresher / Intern";
        else if (lower.includes("junior")) level = "Junior";
        else if (lower.includes("lead") || lower.includes("principal") || lower.includes("architect")) level = "Tech Lead / Principal";
        else if (lower.includes("senior") || lower.includes("sr.")) level = "Senior";
        else if (lower.includes("manager")) level = "Management / Lead";

        const skills = extractTechTags(headline);

        if (name && profileUrl) {
          results.push({
            id: "cand_" + Math.random().toString(36).substr(2, 9),
            name: name,
            headline: headline,
            company: company,
            location: location,
            level: level,
            isOpenToWork: isOpenToWork,
            openToWorkStatus: isOpenToWork ? "🔥 CÓ (#OPENTOWORK)" : "Chưa bật",
            email: isOpenToWork ? "Liên hệ qua InMail LinkedIn" : "Chưa công khai",
            skills: skills.length > 0 ? skills : ["Chung"],
            profileUrl: profileUrl,
            scoutedAt: new Date().toLocaleDateString("vi-VN"),
            status: isOpenToWork ? "Sẵn sàng phỏng vấn" : "Mới cào từ tìm kiếm",
            notes: "Cào tự động"
          });
        }
      } catch (err) {}
    });

    return results;
  }

  // Save candidates into storage with deduplication
  function saveCandidates(newCandidates, callback) {
    if (!chrome?.storage?.local) {
      try {
        const existing = JSON.parse(localStorage.getItem("talentscout_candidates") || "[]");
        const existingUrls = new Set(existing.map(c => c.profileUrl));
        let addedCount = 0;

        newCandidates.forEach(c => {
          if (!existingUrls.has(c.profileUrl)) {
            existing.unshift(c);
            existingUrls.add(c.profileUrl);
            addedCount++;
          }
        });

        localStorage.setItem("talentscout_candidates", JSON.stringify(existing));
        updateDailyState(addedCount);
        if (callback) callback(addedCount, existing.length);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    chrome.storage.local.get(["talentscout_candidates"], function (result) {
      const existing = result.talentscout_candidates || [];
      const existingUrls = new Set(existing.map(c => c.profileUrl));
      let addedCount = 0;

      newCandidates.forEach(c => {
        if (!existingUrls.has(c.profileUrl)) {
          existing.unshift(c);
          existingUrls.add(c.profileUrl);
          addedCount++;
        }
      });

      chrome.storage.local.set({ talentscout_candidates: existing }, function () {
        updateDailyState(addedCount);
        if (callback) callback(addedCount, existing.length);
      });
    });
  }

  // Total candidate count
  function getCandidateCount(callback) {
    if (!chrome?.storage?.local) {
      try {
        const existing = JSON.parse(localStorage.getItem("talentscout_candidates") || "[]");
        callback(existing.length);
      } catch (e) {
        callback(0);
      }
      return;
    }
    chrome.storage.local.get(["talentscout_candidates"], function (result) {
      const list = result.talentscout_candidates || [];
      callback(list.length);
    });
  }

  // Export to CSV
  function exportToCsv() {
    function processExport(candidates) {
      if (!candidates || candidates.length === 0) {
        alert("Chưa có ứng viên nào được lưu. Hãy bấm 'Scout' hoặc 'Auto-Scan' để lưu hồ sơ!");
        return;
      }

      const headers = ["ID", "Họ Tên", "Chức Danh (Headline)", "Cấp Bậc (Level)", "OpenToWork (Tìm Việc)", "Email / Liên Hệ", "Công Ty", "Khu Vực", "Kỹ Năng", "Link Profile", "Ngày Cào", "Trạng Thái"];
      const rows = candidates.map(c => [
        `"${c.id}"`,
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
      showToast(`📥 Đã xuất thành công ${candidates.length} ứng viên ra file CSV!`);
    }

    if (!chrome?.storage?.local) {
      const list = JSON.parse(localStorage.getItem("talentscout_candidates") || "[]");
      processExport(list);
    } else {
      chrome.storage.local.get(["talentscout_candidates"], function (result) {
        processExport(result.talentscout_candidates || []);
      });
    }
  }

  // Toast Notification
  function showToast(msg) {
    let toast = document.getElementById("talentscout-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "talentscout-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.className = "talentscout-toast show";
    setTimeout(() => {
      toast.className = "talentscout-toast";
    }, 3800);
  }

  // =========================================================================
  // AUTO-PILOT HARVESTER ENGINE (10 - 100 CV/ngày)
  // =========================================================================
  let isScanning = false;
  let shouldStopScanning = false;

  function openAutoScanModal() {
    let modal = document.getElementById("ts-autoscan-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "ts-autoscan-modal";
      modal.className = "ts-modal-overlay";
      modal.innerHTML = `
        <div class="ts-modal-card">
          <div class="ts-modal-header">
            <div class="ts-modal-title">
              <span>🐸 TalentScout AI — Auto-Pilot Scanner</span>
              <span class="ts-live-tag">10 - 100 CV/Ngày</span>
            </div>
            <button id="ts-modal-close" class="ts-modal-x">&times;</button>
          </div>
          <div class="ts-modal-body">
            <div class="ts-target-picker">
              <label>🎯 Chọn Chỉ Tiêu Scan Hôm Nay:</label>
              <div class="ts-quota-row">
                <button class="ts-quota-btn" data-target="10">10 CV</button>
                <button class="ts-quota-btn" data-target="25">25 CV</button>
                <button class="ts-quota-btn active" data-target="50">50 CV</button>
                <button class="ts-quota-btn" data-target="100">100 CV</button>
              </div>
            </div>

            <div class="ts-stat-box">
              <div class="ts-stat-row">
                <span>Tiến độ hôm nay:</span>
                <b id="ts-scan-progress-num">0 / 50 CV</b>
              </div>
              <div class="ts-progress-bar">
                <div id="ts-scan-progress-fill" class="ts-progress-fill" style="width: 0%"></div>
              </div>
            </div>

            <div class="ts-anti-ban-note">
              🛡️ <b>Chế độ An Toàn (Anti-Ban Active):</b> Tự động scroll mượt & giả lập độ trễ con người 2.5s - 4.5s/trang để bảo vệ 100% tài khoản LinkedIn.
            </div>

            <div id="ts-scan-log-box" class="ts-scan-logs">
              Sẵn sàng quét danh sách ứng viên...
            </div>
          </div>
          <div class="ts-modal-footer">
            <button id="ts-btn-start-auto" class="ts-btn ts-btn-primary">
              ▶️ BẮT ĐẦU CÀO TỰ ĐỘNG
            </button>
            <button id="ts-btn-stop-auto" class="ts-btn ts-btn-danger" style="display:none">
              ⏹ TẠM DỪNG
            </button>
            <button id="ts-btn-export-today" class="ts-btn ts-btn-outline">
              📥 Xuất CSV Ngay
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Bind events
      document.getElementById("ts-modal-close").addEventListener("click", () => {
        modal.style.display = "none";
      });

      document.querySelectorAll(".ts-quota-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          document.querySelectorAll(".ts-quota-btn").forEach(b => b.classList.remove("active"));
          e.target.classList.add("active");
          const target = parseInt(e.target.getAttribute("data-target"), 10);
          updateTargetUI(target);
        });
      });

      document.getElementById("ts-btn-start-auto").addEventListener("click", () => {
        const activeBtn = document.querySelector(".ts-quota-btn.active");
        const target = parseInt(activeBtn?.getAttribute("data-target") || "50", 10);
        startAutoScanProcess(target);
      });

      document.getElementById("ts-btn-stop-auto").addEventListener("click", () => {
        shouldStopScanning = true;
        logModal("⏸ Người dùng đã bấm tạm dừng quá trình cào.");
      });

      document.getElementById("ts-btn-export-today").addEventListener("click", exportToCsv);
    }

    modal.style.display = "flex";
    getDailyState(state => {
      updateTargetUI(state.quota || 50, state.scanned || 0);
    });
  }

  function updateTargetUI(target, currentScanned) {
    getDailyState(state => {
      const scanned = currentScanned !== undefined ? currentScanned : (state.scanned || 0);
      const pct = Math.min(100, Math.round((scanned / target) * 100));
      const numEl = document.getElementById("ts-scan-progress-num");
      const fillEl = document.getElementById("ts-scan-progress-fill");
      if (numEl) numEl.textContent = `${scanned} / ${target} CV (${pct}%)`;
      if (fillEl) fillEl.style.width = `${pct}%`;
    });
  }

  function logModal(msg) {
    const box = document.getElementById("ts-scan-log-box");
    if (box) {
      const line = document.createElement("div");
      line.className = "ts-log-line";
      line.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  async function startAutoScanProcess(targetQuota) {
    if (isScanning) return;
    isScanning = true;
    shouldStopScanning = false;

    const startBtn = document.getElementById("ts-btn-start-auto");
    const stopBtn = document.getElementById("ts-btn-stop-auto");
    if (startBtn) startBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "block";

    logModal(`🚀 <b>Bắt đầu Auto-Scan với chỉ tiêu: ${targetQuota} CV hôm nay</b>`);

    let pageNum = 1;
    let totalCollectedThisSession = 0;

    while (isScanning && !shouldStopScanning) {
      logModal(`📄 <b>Đang quét Trang ${pageNum}...</b>`);

      // 1. Scroll smoothly to trigger lazy load
      window.scrollBy({ top: 400, behavior: "smooth" });
      await sleep(800);
      window.scrollBy({ top: 600, behavior: "smooth" });
      await sleep(1000);

      // 2. Extract cards on current page
      const candidates = parseSearchResults();
      logModal(`🔍 Tìm thấy ${candidates.length} ứng viên trên trang hiện tại.`);

      if (candidates.length > 0) {
        await new Promise(resolve => {
          saveCandidates(candidates, (added, totalDb) => {
            totalCollectedThisSession += added;
            logModal(`✅ Lưu thành công <b>+${added} hồ sơ mới</b> vào Database (Tổng DB: ${totalDb}).`);
            getDailyState(st => {
              updateTargetUI(targetQuota, st.scanned);
            });
            resolve();
          });
        });
      }

      // 3. Check if quota reached
      const curState = await new Promise(r => getDailyState(r));
      if (curState.scanned >= targetQuota) {
        logModal(`🎉 <b>XUẤT SẮC! Đã hoàn thành chỉ tiêu ${curState.scanned}/${targetQuota} CV hôm nay!</b>`);
        showToast(`🎉 Đã đạt chỉ tiêu ${curState.scanned}/${targetQuota} CV LinkedIn hôm nay!`);
        break;
      }

      // 4. Find Next Page button
      const nextBtn = document.querySelector("button[aria-label='Next'], a.artdeco-pagination__button--next, .artdeco-pagination__button--next, button.demo-next-page");
      if (!nextBtn || nextBtn.disabled || nextBtn.classList.contains("disabled")) {
        logModal(`⚠️ Đã đến trang tìm kiếm cuối cùng. Dừng quét.`);
        break;
      }

      // 5. Anti-Ban Human Jitter Delay (2.5s - 4.5s)
      const jitterMs = 2500 + Math.floor(Math.random() * 2000);
      logModal(`⏳ Đang chuyển sang Trang ${pageNum + 1}... Chờ ${Math.round(jitterMs / 100) / 10}s (Anti-ban jitter)...`);
      await sleep(jitterMs);

      if (shouldStopScanning) break;

      // Click Next
      nextBtn.click();
      pageNum++;
      await sleep(2500); // Wait for DOM load
    }

    isScanning = false;
    if (startBtn) startBtn.style.display = "block";
    if (stopBtn) stopBtn.style.display = "none";
    logModal(`🏁 Quá trình quét kết thúc. Cào được tổng cộng ${totalCollectedThisSession} ứng viên trong phiên.`);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Injected Floating Widget UI
  function injectFloatingWidget() {
    if (document.getElementById("talentscout-widget")) return;

    const widget = document.createElement("div");
    widget.id = "talentscout-widget";
    widget.innerHTML = `
      <div class="ts-header">
        <span class="ts-logo">🐸 TalentScout AI</span>
        <span class="ts-badge" id="ts-count-badge">0 DB</span>
      </div>
      <div class="ts-body">
        <button id="ts-btn-auto-daily" class="ts-btn ts-btn-accent">
          🚀 Auto-Scan (10-100 CV)
        </button>
        <button id="ts-btn-scout" class="ts-btn ts-btn-primary">
          ⚡ Scout Ứng Viên Này
        </button>
        <button id="ts-btn-batch" class="ts-btn ts-btn-secondary" style="display:none">
          📑 Cào Cả Trang Hiện Tại
        </button>
        <button id="ts-btn-outreach" class="ts-btn ts-btn-amber">
          ✉️ Viết Tin Nhắn Chào Job AI
        </button>
        <button id="ts-btn-export" class="ts-btn ts-btn-outline">
          📥 Xuất Excel (CSV)
        </button>
      </div>
      <div class="ts-footer" id="ts-daily-footer">
        🎯 0/50 CV Hôm Nay · Pepe Nuôi Thân
      </div>
    `;

    document.body.appendChild(widget);

    // Update count badge & daily footer
    getCandidateCount(count => {
      const badge = document.getElementById("ts-count-badge");
      if (badge) badge.textContent = `${count} DB`;
    });

    getDailyState(state => {
      const foot = document.getElementById("ts-daily-footer");
      if (foot) foot.textContent = `🎯 ${state.scanned || 0}/${state.quota || 50} CV Hôm Nay · Anti-Ban Safe`;
    });

    // Check if on search page or profile page
    const isSearchPage = window.location.pathname.includes("/search/") ||
                         document.querySelector(".search-result-card") ||
                         document.querySelector(".reusable-search__result-container");
    const isProfilePage = window.location.pathname.includes("/in/") || 
                          window.location.pathname.includes("demo") || 
                          !!document.querySelector("h1.text-heading-xlarge") ||
                          !!document.querySelector(".profile-card");

    const batchBtn = document.getElementById("ts-btn-batch");
    const scoutBtn = document.getElementById("ts-btn-scout");

    if (isSearchPage && batchBtn) {
      batchBtn.style.display = "block";
    }
    if (!isProfilePage && scoutBtn) {
      scoutBtn.textContent = "⚡ Quét Trang Hiện Tại";
    }

    // Attach Event Listeners
    document.getElementById("ts-btn-auto-daily")?.addEventListener("click", openAutoScanModal);

    scoutBtn?.addEventListener("click", () => {
      const cand = parseCurrentProfile();
      if (!cand || !cand.name) {
        showToast("⚠️ Không tìm thấy profile ứng viên trên trang này!");
        return;
      }
      saveCandidates([cand], (added, total) => {
        const badge = document.getElementById("ts-count-badge");
        if (badge) badge.textContent = `${total} DB`;
        if (added > 0) {
          showToast(`✅ Đã lưu <b>${cand.name}</b> (${cand.level} · ${cand.company}) vào Database!`);
        } else {
          showToast(`ℹ️ Ứng viên <b>${cand.name}</b> đã có sẵn trong Database.`);
        }
      });
    });

    batchBtn?.addEventListener("click", () => {
      const list = parseSearchResults();
      if (list.length === 0) {
        showToast("⚠️ Chưa tìm thấy danh sách ứng viên trên trang tìm kiếm!");
        return;
      }
      saveCandidates(list, (added, total) => {
        const badge = document.getElementById("ts-count-badge");
        if (badge) badge.textContent = `${total} DB`;
        showToast(`🎉 Đã cào thêm <b>+${added} ứng viên</b> vào Database! (Tổng: ${total})`);
      });
    });

    document.getElementById("ts-btn-export")?.addEventListener("click", exportToCsv);

    document.getElementById("ts-btn-outreach")?.addEventListener("click", () => {
      const cand = parseCurrentProfile();
      const candName = cand ? cand.name : "anh/chị";
      const candTitle = cand ? cand.headline : "lập trình viên";

      const sampleMsg = `Chào ${candName},\n\nMình ấn tượng với hồ sơ và kinh nghiệm của bạn ở vị trí ${candTitle}. Hiện bên mình đang có cơ hội mở cho vị trí Senior phù hợp với Tech Stack của bạn (Mức lương cạnh tranh + Hybrid/Remote).\n\nNếu bạn đang quan tâm hoặc muốn trao đổi ngắn về cơ hội mới, bạn phản hồi tin nhắn này để mình gửi JD chi tiết nhé. Chúc bạn tuần mới nhiều năng lượng!\n\n(Gửi từ TalentScout AI)`;

      navigator.clipboard.writeText(sampleMsg).then(() => {
        showToast("📋 Đã copy mẫu tin nhắn mời phỏng vấn AI vào Clipboard!");
      }).catch(() => {
        alert(sampleMsg);
      });
    });
  }

  // Initialize after page load
  window.addEventListener("load", () => {
    setTimeout(injectFloatingWidget, 1200);
  });

  // Handle SPA navigation on LinkedIn
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectFloatingWidget, 1200);
    }
  }).observe(document, { subtree: true, childList: true });

})();
