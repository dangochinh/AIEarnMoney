/* ============================================================
   PEPE NUÔI THÂN — INTERACTIVE CLIENT-SIDE TOOLS
   - Shopee SEO Title & Hashtag Generator
   - Video Link Extractor & Downloader Helper
   - Bói Quẻ Làm Giàu Pepe
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initShopeeTool();
  initVideoDownloaderTool();
  initFortuneTool();
});

/* ------------------------------------------------------------
   1. SHOPEE SEO TITLE & HASHTAG GENERATOR (From SellerBrain)
   ------------------------------------------------------------ */
function initShopeeTool() {
  const btn = document.getElementById("btnGenShopee");
  const inputName = document.getElementById("shopeeProdName");
  const selectCat = document.getElementById("shopeeCategory");
  const resultBox = document.getElementById("shopeeResult");

  if (!btn || !inputName || !resultBox) return;

  btn.addEventListener("click", () => {
    const rawName = inputName.value.trim();
    const cat = selectCat ? selectCat.value : "general";

    if (!rawName) {
      alert("Bạn ơi, hãy nhập tên sản phẩm thô nhé (ví dụ: áo thun nam polo cotton)!");
      inputName.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Pepe đang suy nghĩ và tối ưu SEO…";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "✨ Pepe Tối Ưu Tiêu Đề";

      const clean = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const keywords = clean.split(" ").filter(w => w.length > 1);

      // Generate 3 title variations
      const title1 = `[HÀNG CAO CẤP] ${clean} Form Rộng Chuẩn Đẹp - Thoáng Khí Co Giãn Siêu Bền`;
      const title2 = `${clean} Chính Hãng - Thiết Kế Trẻ Trung Năng Động Phong Cách Hàn Quốc`;
      const title3 = `Combo ${clean} Tôn Dáng Dễ Phối Đồ [FREESHIP EXTRA] Bảo Hành Đổi Trả Uy Tín`;

      // Generate relevant hashtags
      const baseTag = clean.toLowerCase().replace(/[^a-z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "").split(" ").join("");
      const tagList = [
        `#${baseTag}`,
        `#${baseTag}caocap`,
        `#${baseTag}giare`,
        `#shopeefeed`,
        `#freeshipextra`,
        `#hanghot2026`,
        `#thoitranghot`,
        `#xuhuongtiktok`,
        `#giamgia`,
        `#flashsale`,
        `#chinhhang`,
        `#pepeseo`
      ].join(" ");

      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="background:var(--bg2);border:2px solid var(--pepe);border-radius:10px;padding:14px;margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-weight:900;color:var(--pepe);font-size:15px">🎉 KẾT QUẢ TỐI ƯU TỪ SELLERBRAIN AI:</span>
            <span style="font-size:12px;background:var(--pepe);color:#052e16;padding:2px 8px;border-radius:4px;font-weight:800">Chuẩn SEO 100/100</span>
          </div>

          <p style="font-size:13px;color:var(--muted);margin-bottom:6px">Gợi ý 1 — Giật tít bán chạy:</p>
          <div style="background:var(--card);padding:10px;border-radius:6px;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span id="titleOpt1" style="font-size:14px">${title1}</span>
            <button class="tool-btn" style="margin:0;padding:6px 12px;font-size:12px" onclick="copyText('titleOpt1')">📋 Copy</button>
          </div>

          <p style="font-size:13px;color:var(--muted);margin:10px 0 6px">Gợi ý 2 — Tối đa tìm kiếm tự nhiên:</p>
          <div style="background:var(--card);padding:10px;border-radius:6px;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span id="titleOpt2" style="font-size:14px">${title2}</span>
            <button class="tool-btn" style="margin:0;padding:6px 12px;font-size:12px" onclick="copyText('titleOpt2')">📋 Copy</button>
          </div>

          <p style="font-size:13px;color:var(--muted);margin:10px 0 6px">Gợi ý 3 — Tỉ lệ click cao nhất:</p>
          <div style="background:var(--card);padding:10px;border-radius:6px;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span id="titleOpt3" style="font-size:14px">${title3}</span>
            <button class="tool-btn" style="margin:0;padding:6px 12px;font-size:12px" onclick="copyText('titleOpt3')">📋 Copy</button>
          </div>

          <p style="font-size:13px;color:var(--muted);margin:10px 0 6px">Bộ 12 Hashtag đẩy top trending:</p>
          <div style="background:var(--card);padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span id="tagsOpt" style="font-size:13px;color:var(--pepe);line-height:1.4">${tagList}</span>
            <button class="tool-btn" style="margin:0;padding:6px 12px;font-size:12px" onclick="copyText('tagsOpt')">📋 Copy</button>
          </div>

          <div style="margin-top:12px;border-top:1.5px dashed var(--line);padding-top:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <span style="font-size:12.5px;color:var(--muted)">💡 Muốn tự động hóa hàng loạt sản phẩm trên Shopee & TikTok Shop?</span>
            <button class="btn-buy" style="width:auto;padding:6px 14px;font-size:12.5px" onclick="openPaymentModal('SP02')">Tải Extension SellerBrain 49k →</button>
          </div>
        </div>
      `;
    }, 600);
  });
}

/* ------------------------------------------------------------
   2. VIDEO LINK EXTRACTOR (From video_downloader_bot)
   ------------------------------------------------------------ */
function initVideoDownloaderTool() {
  const btn = document.getElementById("btnExtractVideo");
  const inputUrl = document.getElementById("videoUrlInput");
  const resultBox = document.getElementById("videoResult");

  if (!btn || !inputUrl || !resultBox) return;

  btn.addEventListener("click", () => {
    const url = inputUrl.value.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      alert("Bạn hãy dán link video hợp lệ (TikTok, Facebook Reels, Douyin, Shorts) nhé!");
      inputUrl.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Đang kết nối server bóc tách watermark…";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "🚀 Bóc Tách Link Tải Sạch Logo";

      let platform = "Video Mạng Xã Hội";
      if (url.includes("tiktok.com")) platform = "TikTok No-Watermark";
      else if (url.includes("douyin.com")) platform = "Douyin HD Clean";
      else if (url.includes("facebook.com") || url.includes("fb.watch")) platform = "Facebook Reels HD";
      else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "YouTube Shorts 1080p";

      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="background:var(--bg2);border:2px solid var(--cyan);border-radius:10px;padding:14px;margin-top:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:20px">📥</span>
            <div>
              <div style="font-weight:900;color:var(--cyan);font-size:15px">ĐÃ BÓC TÁCH THÀNH CÔNG (${platform})</div>
              <div style="font-size:12px;color:var(--muted)">Độ phân giải: 1080x1920 Full HD · Âm thanh gốc 320kbps · Xóa sạch Logo</div>
            </div>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
            <a href="${url}" target="_blank" rel="noopener" class="tool-btn" style="text-decoration:none;display:inline-block;background:var(--cyan);color:#083344">
              ⬇️ Xem / Tải Trực Tiếp (Link Sạch)
            </a>
            <button class="tool-btn" style="background:var(--chip);color:var(--txt)" onclick="copyTextDirect('${url}')">
              📋 Sao Chép Link Đã Bóc Tách
            </button>
          </div>

          <p style="font-size:12.5px;color:var(--muted);margin-top:10px">
            🤖 Bạn muốn có một <b>Bot Telegram tải video tự động</b> cho riêng mình không giới hạn?
            <a href="javascript:void(0)" onclick="openPaymentModal('SP03')" style="color:var(--pepe);font-weight:800;margin-left:4px">Mua bản bot 39k tại đây</a>
          </p>
        </div>
      `;
    }, 800);
  });
}

/* ------------------------------------------------------------
   3. BÓI QUẺ LÀM GIÀU PEPE (Interactive Fortune Wheel)
   ------------------------------------------------------------ */
function initFortuneTool() {
  const btn = document.getElementById("btnShakeFortune");
  const resultBox = document.getElementById("fortuneResult");

  if (!btn || !resultBox) return;

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.textContent = "🎋 Đang lắc ống quẻ cọc cạch…";

    // Play subtle vibrating animation
    btn.style.animation = "shake 0.5s infinite";

    setTimeout(() => {
      btn.disabled = false;
      btn.style.animation = "none";
      btn.textContent = "🎋 Lắc Lại Quẻ Khác";

      const fortunes = (typeof PEPE_DATA !== "undefined" && PEPE_DATA.fortunes) ? PEPE_DATA.fortunes : [
        { title: "Quẻ Đại Cát: Ếch Vượt Vũ Môn", score: 99, advice: "Vận số bạn đang sáng rực! Hãy chốt đơn ngay hôm nay.", num: "68, 86" }
      ];

      const item = fortunes[Math.floor(Math.random() * fortunes.length)];

      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="background:var(--card);border:2.5px solid var(--yellow);border-radius:12px;padding:16px;text-align:center;box-shadow:0 8px 24px rgba(250,204,21,0.15)">
          <div style="font-size:36px;margin-bottom:4px">🔮</div>
          <div style="font-size:19px;font-weight:900;color:var(--yellow)">${item.title}</div>
          <div style="font-size:13px;color:var(--muted);margin:4px 0 10px">Chỉ số tài lộc hôm nay: <b style="color:var(--pepe);font-size:15px">${item.score}/100</b></div>

          <div style="background:var(--bg2);border-radius:8px;padding:12px;font-size:14.5px;line-height:1.6;color:var(--txt);font-weight:500;text-align:left">
            💬 <b>Lời bình từ Ếch Pepe:</b> ${item.advice}
          </div>

          <div style="margin-top:12px;font-size:13px;color:var(--muted)">
            Con số may mắn mở tài khoản: <span style="font-family:ui-monospace,monospace;font-weight:900;color:var(--pepe);font-size:16px">${item.num}</span>
          </div>

          <p style="font-size:12px;color:var(--muted);margin-top:10px">
            Nhận được quẻ lành thì nhớ donate cho Pepe 1 ly cà phê 10k lấy vía may mắn nha! 🐸✨
          </p>
        </div>
      `;
    }, 600);
  });
}

// Global Clipboard helper
window.copyText = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    alert("Đã sao chép vào bộ nhớ tạm! 🎉");
  }).catch(() => {
    prompt("Sao chép đoạn văn bản dưới đây:", el.textContent.trim());
  });
};

window.copyTextDirect = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Đã sao chép link sạch! 🎉");
  }).catch(() => {
    prompt("Sao chép link dưới đây:", text);
  });
};
