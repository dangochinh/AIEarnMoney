/**
 * TalentScout AI — LinkedIn Candidate DOM Extractor & Headhunter Sidecar
 * Runs directly inside the user's browser context (Safe & ban-proof).
 */

(function () {
  console.log("🐸 [TalentScout AI] Extension activated on LinkedIn!");

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
    const lower = text.toLowerCase();
    TECH_KEYWORDS.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace(".", "\\.")}\\b`, "i");
      if (regex.test(text)) {
        found.add(tech);
      }
    });
    return Array.from(found);
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

      // Check #OpenToWork Badge (from joeyism/linkedin_scraper pattern)
      let isOpenToWork = false;
      const profilePic = document.querySelector(".pv-top-card-profile-picture img, .pv-top-card__photo img, img.presence-entity__image, div.pv-top-card__non-self-photo-wrapper img");
      if (profilePic) {
        const titleAttr = (profilePic.getAttribute("title") || "").toUpperCase();
        const altAttr = (profilePic.getAttribute("alt") || "").toUpperCase();
        if (titleAttr.includes("OPEN_TO_WORK") || titleAttr.includes("OPEN TO WORK") || altAttr.includes("OPEN_TO_WORK") || altAttr.includes("OPEN TO WORK")) {
          isOpenToWork = true;
        }
      }
      if (!isOpenToWork && document.querySelector("[data-view-name='profile-card'] [aria-label*='Open to work'], .pv-open-to-work-card, [href*='open-to-work']")) {
        isOpenToWork = true;
      }

      // Check Recent Experience Title (from Yale3 selector patterns)
      const expRoleEl = document.querySelector("section[data-view-name='profile-card'] div.t-bold span[aria-hidden='true']") ||
                        document.querySelector(".experience-item .t-bold span[aria-hidden='true']");
      const recentRole = expRoleEl ? expRoleEl.innerText.trim() : "";

      const profileUrl = window.location.origin + window.location.pathname;
      const combinedText = `${headline} ${about} ${recentRole}`;
      const skills = extractTechTags(combinedText);

      // Extract Email if candidate wrote it in bio
      const emailMatch = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const email = emailMatch ? emailMatch[0] : "";

      // Estimated Seniority Level
      let level = "Mid-Level";
      const lower = headline.toLowerCase();
      if (lower.includes("intern") || lower.includes("fresher")) level = "Fresher / Intern";
      else if (lower.includes("junior")) level = "Junior";
      else if (lower.includes("lead") || lower.includes("principal")) level = "Tech Lead / Principal";
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
        email: email,
        recentRole: recentRole || headline,
        skills: skills.length > 0 ? skills : ["Chung"],
        profileUrl: profileUrl,
        scoutedAt: new Date().toLocaleDateString("vi-VN"),
        status: isOpenToWork ? "🔥 Đang Tìm Việc (OpenToWork)" : "Mới cào",
        notes: ""
      };
    } catch (e) {
      console.error("[TalentScout AI] Parse profile error:", e);
      return null;
    }
  }

  // Parse Search Results Page (/search/results/people/...)
  function parseSearchResults() {
    const cards = document.querySelectorAll(".reusable-search__result-container, .search-results-container li");
    const results = [];

    cards.forEach(card => {
      try {
        const linkEl = card.querySelector("a.app-aware-link[href*='/in/']");
        if (!linkEl) return;

        const profileUrl = linkEl.href.split("?")[0];
        const nameEl = card.querySelector(".entity-result__title-text a span[aria-hidden='true']") ||
                       card.querySelector(".entity-result__title-text a");
        const name = nameEl ? nameEl.innerText.trim() : "";

        const headlineEl = card.querySelector(".entity-result__primary-subtitle");
        const headline = headlineEl ? headlineEl.innerText.trim() : "";

        const locationEl = card.querySelector(".entity-result__secondary-subtitle");
        const location = locationEl ? locationEl.innerText.trim() : "Việt Nam";

        if (name && profileUrl) {
          results.push({
            id: "cand_" + Math.random().toString(36).substr(2, 9),
            name: name,
            headline: headline,
            company: headline.split(" at ")[1]?.trim() || "Chưa cập nhật",
            location: location,
            level: headline.toLowerCase().includes("senior") ? "Senior" : "Mid-Level",
            skills: extractTechTags(headline),
            profileUrl: profileUrl,
            scoutedAt: new Date().toLocaleDateString("vi-VN"),
            status: "Mới cào",
            notes: "Cào từ Search Results"
          });
        }
      } catch (err) {}
    });

    return results;
  }

  // Save candidates into chrome.storage.local
  function saveCandidates(newCandidates, callback) {
    if (!chrome?.storage?.local) {
      // Fallback to localStorage
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
        if (callback) callback(addedCount, existing.length);
      });
    });
  }

  // Get total candidate count
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
        alert("Chưa có ứng viên nào được lưu. Hãy bấm 'Scout Candidate' để lưu hồ sơ!");
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
      link.setAttribute("download", `talentscout_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
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
    }, 3500);
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
        <button id="ts-btn-scout" class="ts-btn ts-btn-primary">
          ⚡ Scout Ứng Viên Này
        </button>
        <button id="ts-btn-batch" class="ts-btn ts-btn-secondary" style="display:none">
          📑 Cào Cả Trang Tìm Kiếm
        </button>
        <button id="ts-btn-outreach" class="ts-btn ts-btn-amber">
          ✉️ Viết Tin Nhắn Chào Job AI
        </button>
        <button id="ts-btn-export" class="ts-btn ts-btn-outline">
          📥 Xuất Excel (CSV)
        </button>
      </div>
      <div class="ts-footer">
        Headhunter Pro Tool · Pepe Nuôi Thân
      </div>
    `;

    document.body.appendChild(widget);

    // Update count badge
    getCandidateCount(count => {
      const badge = document.getElementById("ts-count-badge");
      if (badge) badge.textContent = `${count} DB`;
    });

    // Check if on search page
    const isSearchPage = window.location.pathname.includes("/search/");
    const isProfilePage = window.location.pathname.includes("/in/");

    const batchBtn = document.getElementById("ts-btn-batch");
    const scoutBtn = document.getElementById("ts-btn-scout");

    if (isSearchPage && batchBtn) {
      batchBtn.style.display = "block";
    }
    if (!isProfilePage && scoutBtn) {
      scoutBtn.textContent = "⚡ Quét Trang Hiện Tại";
    }

    // Attach Event Listeners
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
    setTimeout(injectFloatingWidget, 1500);
  });

  // Handle SPA navigation on LinkedIn
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectFloatingWidget, 1500);
    }
  }).observe(document, { subtree: true, childList: true });

})();
