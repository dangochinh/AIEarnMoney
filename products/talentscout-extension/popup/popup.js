/**
 * TalentScout AI — Popup Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  let allCandidates = [];
  let currentFilter = "all";
  let searchKeyword = "";

  const listContainer = document.getElementById("candidateList");
  const countBadge = document.getElementById("totalCandidatesCount");
  const searchInput = document.getElementById("searchInput");
  const exportBtn = document.getElementById("btnExportCsv");
  const clearBtn = document.getElementById("btnClearDb");
  const filterPills = document.querySelectorAll(".filter-pills .pill");

  // Sample seed data so users can test immediately
  const SAMPLE_DATA = [
    {
      id: "cand_demo_01",
      name: "Nguyễn Văn Hùng",
      headline: "Senior Python & AI Engineer | LLM Finetuning | Ex-VinAI",
      company: "TechNova Corp",
      location: "Hà Nội, Việt Nam",
      level: "Senior",
      skills: ["Python", "FastAPI", "AI", "LLM", "Docker"],
      profileUrl: "https://www.linkedin.com/in/demo-hung-ai",
      scoutedAt: "01/11/2026",
      status: "Sẵn sàng phỏng vấn"
    },
    {
      id: "cand_demo_02",
      name: "Trần Thị Mai Anh",
      headline: "Tech Lead Frontend (React / TypeScript / Next.js)",
      company: "Shopee Vietnam",
      location: "TP. Hồ Chí Minh",
      level: "Tech Lead / Principal",
      skills: ["React", "TypeScript", "Nodejs", "UI/UX"],
      profileUrl: "https://www.linkedin.com/in/demo-maianh-lead",
      scoutedAt: "31/10/2026",
      status: "Cân nhắc cơ hội mới"
    },
    {
      id: "cand_demo_03",
      name: "Lê Quốc Bảo",
      headline: "Fullstack Golang & React Developer (4+ YOE)",
      company: "Fintech Growth Hub",
      location: "Đà Nẵng / Remote",
      level: "Senior",
      skills: ["Golang", "React", "PostgreSQL", "Docker", "AWS"],
      profileUrl: "https://www.linkedin.com/in/demo-bao-fullstack",
      scoutedAt: "30/10/2026",
      status: "Mới cào"
    }
  ];

  // Load from chrome.storage.local
  function loadCandidates() {
    function handleResult(candidates) {
      if (!candidates || candidates.length === 0) {
        // Auto-seed with demo data so the tool is instantly usable
        allCandidates = SAMPLE_DATA;
        saveToStorage(SAMPLE_DATA);
      } else {
        allCandidates = candidates;
      }
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

    // Filter by Pill (Level or Skill)
    if (currentFilter !== "all") {
      filtered = filtered.filter(c => {
        const skillsStr = (c.skills || []).join(" ").toLowerCase();
        const levelStr = (c.level || "").toLowerCase();
        const f = currentFilter.toLowerCase();
        return skillsStr.includes(f) || levelStr.includes(f);
      });
    }

    // Filter by Search Keyword
    if (searchKeyword.trim() !== "") {
      const q = searchKeyword.toLowerCase();
      filtered = filtered.filter(c => {
        return (c.name || "").toLowerCase().includes(q) ||
               (c.headline || "").toLowerCase().includes(q) ||
               (c.company || "").toLowerCase().includes(q) ||
               (c.location || "").toLowerCase().includes(q) ||
               (c.skills || []).join(" ").toLowerCase().includes(q);
      });
    }

    countBadge.textContent = `${allCandidates.length} Ứng viên`;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          Không tìm thấy ứng viên phù hợp với từ khóa "${searchKeyword}".
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(c => `
      <div class="cand-card" data-id="${c.id}">
        <div class="cand-top">
          <div class="cand-name">${c.name}</div>
          <span class="cand-level">${c.level}</span>
        </div>
        <div class="cand-headline">${c.headline}</div>
        <div class="cand-meta">
          <span>🏢 ${c.company}</span>
          <span>📍 ${c.location}</span>
          <span>📅 ${c.scoutedAt}</span>
        </div>
        <div class="cand-skills">
          ${(c.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("")}
        </div>
        <div class="cand-actions">
          <a href="${c.profileUrl}" target="_blank" class="cand-btn">
            Mở LinkedIn ↗
          </a>
          <button class="cand-btn btn-outreach" data-name="${c.name}" data-title="${c.headline}">
            ✉️ Mẫu Mời Phỏng Vấn AI
          </button>
        </div>
      </div>
    `).join("");

    // Attach Outreach listeners
    listContainer.querySelectorAll(".btn-outreach").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name") || "Bạn";
        const title = btn.getAttribute("data-title") || "Ứng viên";
        const msg = `Chào ${name},\n\nMình thấy profile của bạn rất ấn tượng ở vị trí ${title}. Bên mình đang có dự án công nghệ mới với đãi ngộ rất tốt và đang tìm kiếm nhân sự chủ chốt.\n\nNếu bạn quan tâm tìm hiểu cơ hội mới, nhắn lại mình nhé. Mình sẽ gửi JD chi tiết để bạn tham khảo. Cảm ơn bạn!\n\n(Headhunter Lead from TalentScout AI)`;
        navigator.clipboard.writeText(msg).then(() => {
          btn.textContent = "✅ Đã Copy!";
          setTimeout(() => { btn.textContent = "✉️ Mẫu Mời Phỏng Vấn AI"; }, 2000);
        });
      });
    });
  }

  // Export to CSV
  exportBtn.addEventListener("click", () => {
    if (allCandidates.length === 0) {
      alert("Chưa có ứng viên nào để xuất file!");
      return;
    }

    const headers = ["ID", "Họ Tên", "Chức Danh (Headline)", "Cấp Bậc (Level)", "OpenToWork (Tìm Việc)", "Email / Liên Hệ", "Công Ty", "Khu Vực", "Kỹ Năng", "Link Profile", "Ngày Cào", "Trạng Thái"];
    const rows = allCandidates.map(c => [
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
    link.setAttribute("download", `talentscout_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Clear Database
  clearBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách ứng viên đã lưu?")) {
      allCandidates = [];
      saveToStorage([], () => {
        renderList();
      });
    }
  });

  // Search input handler
  searchInput.addEventListener("input", e => {
    searchKeyword = e.target.value;
    renderList();
  });

  // Filter pills handler
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.getAttribute("data-filter") || "all";
      renderList();
    });
  });

  // Start loading
  loadCandidates();
});
