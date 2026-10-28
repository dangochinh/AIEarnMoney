/* ============================================================
   PEPE NUÔI THÂN — SECRET ADMIN CONTROL PANEL
   Dành cho anh chủ cập nhật số dư, nhật ký và đơn hàng
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  createAdminModal();
});

function createAdminModal() {
  if (document.getElementById("adminModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "adminModalOverlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-panel" style="max-width:540px">
      <div class="modal-header header-pepe">
        <span>🐸 BẢNG QUẢN TRỊ BÍ MẬT CỦA ANH CHỦ</span>
        <button id="adminModalClose" class="modal-close">✕</button>
      </div>
      <div style="padding:16px;overflow-y:auto;max-height:75vh">
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px">
          Tại đây bạn có thể cập nhật số tiền thật kiếm được, tiền chi, thêm dòng nhật ký mới hoặc thay đổi số tài khoản nhận tiền. Số liệu sẽ lưu trực tiếp vào trình duyệt!
        </p>

        <div style="background:var(--bg2);border-radius:10px;padding:12px;margin-bottom:12px">
          <div style="font-weight:800;font-size:14px;color:var(--pepe);margin-bottom:8px">📊 CẬP NHẬT TÀI CHÍNH (VNĐ)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:12px;color:var(--muted)">Tiền thật kiếm được:</label>
              <input id="admEarned" type="number" class="tool-input" style="margin-top:2px;padding:8px">
            </div>
            <div>
              <label style="font-size:12px;color:var(--muted)">Chi tiền mặt:</label>
              <input id="admCashSpent" type="number" class="tool-input" style="margin-top:2px;padding:8px">
            </div>
          </div>
          <div style="margin-top:8px">
            <label style="font-size:12px;color:var(--muted)">Chi phí AI quy đổi (chủ trả sẵn):</label>
            <input id="admAiCost" type="number" class="tool-input" style="margin-top:2px;padding:8px">
          </div>
        </div>

        <div style="background:var(--bg2);border-radius:10px;padding:12px;margin-bottom:12px">
          <div style="font-weight:800;font-size:14px;color:var(--yellow);margin-bottom:8px">🏦 TÀI KHOẢN NHẬN TIỀN (VIETQR)</div>
          <div style="display:grid;grid-template-columns:1fr 2fr;gap:10px">
            <div>
              <label style="font-size:12px;color:var(--muted)">Mã Bank (MB, VCB, ACB...):</label>
              <input id="admBankCode" type="text" class="tool-input" style="margin-top:2px;padding:8px;text-transform:uppercase">
            </div>
            <div>
              <label style="font-size:12px;color:var(--muted)">Số tài khoản:</label>
              <input id="admAccNo" type="text" class="tool-input" style="margin-top:2px;padding:8px">
            </div>
          </div>
          <div style="margin-top:8px">
            <label style="font-size:12px;color:var(--muted)">Tên chủ tài khoản:</label>
            <input id="admAccName" type="text" class="tool-input" style="margin-top:2px;padding:8px;text-transform:uppercase">
          </div>
        </div>

        <div style="background:var(--bg2);border-radius:10px;padding:12px;margin-bottom:12px">
          <div style="font-weight:800;font-size:14px;color:var(--pink);margin-bottom:8px">📝 THÊM NHẬT KÝ HÔM NAY CHO PEPE</div>
          <div style="display:flex;gap:8px">
            <input id="admDiaryTime" type="text" placeholder="Giờ (vd: 14:30)" class="tool-input" style="width:110px;margin-top:0;padding:8px">
            <input id="admDiaryText" type="text" placeholder="Hôm nay Pepe đã làm gì, có đơn gì mới..." class="tool-input" style="flex:1;margin-top:0;padding:8px">
          </div>
          <button id="admBtnAddDiary" class="tool-btn" style="width:100%;background:var(--chip);color:var(--txt);margin-top:8px;padding:8px">
            ➕ Thêm Vào Nhật Ký Hôm Nay
          </button>
        </div>

        <div style="display:flex;gap:10px;margin-top:14px">
          <button id="admBtnSave" class="btn-buy" style="flex:2;padding:10px">
            💾 Lưu Thay Đổi Ngay
          </button>
          <button id="admBtnReset" class="tool-btn" style="flex:1;background:var(--chip);color:var(--muted);padding:10px;margin:0">
            🔄 Khôi Phục Gốc
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const closeBtn = document.getElementById("adminModalClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => overlay.style.display = "none");
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  });

  // Action handlers
  const btnSave = document.getElementById("admBtnSave");
  const btnReset = document.getElementById("admBtnReset");
  const btnAddDiary = document.getElementById("admBtnAddDiary");

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      saveAdminChanges();
      overlay.style.display = "none";
      alert("Đã lưu thay đổi thành công! 🐸✨");
      if (window.renderDashboard) window.renderDashboard();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn xóa dữ liệu chỉnh sửa và khôi phục số liệu gốc?")) {
        localStorage.removeItem("pepe_data_override");
        overlay.style.display = "none";
        alert("Đã khôi phục dữ liệu gốc!");
        location.reload();
      }
    });
  }

  if (btnAddDiary) {
    btnAddDiary.addEventListener("click", () => {
      const time = document.getElementById("admDiaryTime").value.trim() || new Date().toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"});
      const text = document.getElementById("admDiaryText").value.trim();
      if (!text) {
        alert("Vui lòng nhập nội dung nhật ký!");
        return;
      }
      addDiaryEntry(time, text);
      document.getElementById("admDiaryText").value = "";
      alert("Đã thêm dòng nhật ký mới!");
      if (window.renderDashboard) window.renderDashboard();
    });
  }
}

window.openAdminModal = function() {
  const overlay = document.getElementById("adminModalOverlay");
  if (!overlay) return;

  // Pre-fill inputs with current data
  const data = window.getLivePepeData ? window.getLivePepeData() : (typeof PEPE_DATA !== "undefined" ? PEPE_DATA : {});
  if (document.getElementById("admEarned")) document.getElementById("admEarned").value = data.earned || 0;
  if (document.getElementById("admCashSpent")) document.getElementById("admCashSpent").value = data.cashSpent || 0;
  if (document.getElementById("admAiCost")) document.getElementById("admAiCost").value = data.aiCost || 0;

  if (data.bankInfo) {
    if (document.getElementById("admBankCode")) document.getElementById("admBankCode").value = data.bankInfo.bank || "MB";
    if (document.getElementById("admAccNo")) document.getElementById("admAccNo").value = data.bankInfo.accountNo || "";
    if (document.getElementById("admAccName")) document.getElementById("admAccName").value = data.bankInfo.accountName || "";
  }

  overlay.style.display = "flex";
};

function saveAdminChanges() {
  let override = {};
  try {
    override = JSON.parse(localStorage.getItem("pepe_data_override") || "{}");
  } catch (e) {}

  override.earned = parseInt(document.getElementById("admEarned").value, 10) || 0;
  override.cashSpent = parseInt(document.getElementById("admCashSpent").value, 10) || 0;
  override.aiCost = parseInt(document.getElementById("admAiCost").value, 10) || 0;

  override.bankInfo = {
    bank: (document.getElementById("admBankCode").value || "MB").trim().toUpperCase(),
    accountNo: (document.getElementById("admAccNo").value || "").trim(),
    accountName: (document.getElementById("admAccName").value || "").trim().toUpperCase()
  };

  localStorage.setItem("pepe_data_override", JSON.stringify(override));
}

function addDiaryEntry(time, text) {
  let override = {};
  try {
    override = JSON.parse(localStorage.getItem("pepe_data_override") || "{}");
  } catch (e) {}

  if (!override.customDiaryLines) override.customDiaryLines = [];
  override.customDiaryLines.unshift({ t: time, x: text });
  localStorage.setItem("pepe_data_override", JSON.stringify(override));
}
