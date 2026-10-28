/* ============================================================
   PEPE NUÔI THÂN — LIVE SOCIAL PROOF NOTIFICATION TOAST
   Tăng độ tin cậy và tỷ lệ chuyển đổi chốt đơn tự nhiên
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initSocialProofToast();
});

function initSocialProofToast() {
  const events = [
    { city: "TP. Hồ Chí Minh", item: "Extension SellerBrain Shopee Pro", price: "49.000đ", time: "2 phút trước", icon: "🛍️" },
    { city: "Hà Nội", item: "Bot Telegram Tải Video Không Logo", price: "39.000đ", time: "5 phút trước", icon: "📥" },
    { city: "Đà Nẵng", item: "Đại Combo 5 Game Arcade (Lô Tô, Đoán Nhạc)", price: "69.000đ", time: "8 phút trước", icon: "🎮" },
    { city: "Cần Thơ", item: "Cọc 50% làm Video AI ngắn 60s", price: "49.000đ", time: "14 phút trước", icon: "🎬" },
    { city: "Hải Phòng", item: "Bí Kíp Bán Thân Pepe (Full Prompt & Code)", price: "50.000đ", time: "19 phút trước", icon: "🐸" },
    { city: "Bình Dương", item: "Pepe Ultimate MMO Bundle (Trọn Bộ 6-in-1)", price: "199.000đ", time: "28 phút trước", icon: "🎁" },
    { city: "Nghệ An", item: "Đăng ký Hostinger qua mã giảm giá PEPEAI2026", price: "Hoa hồng 60%", time: "33 phút trước", icon: "🌐" },
    { city: "Thái Nguyên", item: "Mã nguồn Modern Tetris Pro HTML5", price: "29.000đ", time: "41 phút trước", icon: "🧱" }
  ];

  const toast = document.createElement("div");
  toast.id = "pepeSocialToast";
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 20px;
    background: var(--card);
    border: 1px solid var(--line-strong);
    border-left: 4px solid var(--pepe);
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius);
    padding: 12px 16px;
    display: none;
    align-items: center;
    gap: 12px;
    z-index: 8888;
    max-width: 340px;
    font-size: 13px;
    line-height: 1.4;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateY(12px);
    opacity: 0;
  `;

  document.body.appendChild(toast);

  let currentIndex = 0;

  function showToast() {
    const ev = events[currentIndex % events.length];
    currentIndex++;

    toast.innerHTML = `
      <div style="font-size:24px;line-height:1">${ev.icon}</div>
      <div style="flex:1">
        <div style="font-size:11px;color:var(--muted)">Khách từ <b>${ev.city}</b> · ${ev.time}</div>
        <div style="color:var(--txt);font-weight:700;margin-top:2px">${ev.item}</div>
        <div style="font-size:12px;color:var(--pepe);font-weight:800;font-family:ui-monospace,monospace">${ev.price}</div>
      </div>
      <button style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:2px" onclick="document.getElementById('pepeSocialToast').style.display='none'">✕</button>
    `;

    toast.style.display = "flex";
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 50);

    // Hide after 6s
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      setTimeout(() => {
        toast.style.display = "none";
      }, 350);
    }, 6000);
  }

  // First trigger after 12 seconds, then recurring every 35-50 seconds
  setTimeout(() => {
    showToast();
    setInterval(showToast, 38000);
  }, 12000);
}
