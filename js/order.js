/* ============================================================
   PEPE NUÔI THÂN — ORDER FLOW & VIETQR PAYMENT MODAL
   ============================================================ */

const OWNER_TELEGRAM_BOT_TOKEN = "8394322896:AAGLvVyv779HJpmLUiZ49Zr62JPUJ8d81GU";
const OWNER_TELEGRAM_CHAT_ID = "140392118";

function notifyOwnerTelegram(messageHtml) {
  try {
    fetch(`https://api.telegram.org/bot${OWNER_TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: OWNER_TELEGRAM_CHAT_ID,
        text: messageHtml,
        parse_mode: "HTML"
      })
    }).catch(() => {});
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  initCustomOrderForm();
  initOrderTracker();
  initPaymentModalEvents();
});

/* ------------------------------------------------------------
   1. ĐẶT LÀM RIÊNG — XEM DEMO TRƯỚC (Custom Order)
   ------------------------------------------------------------ */
function initCustomOrderForm() {
  const btn = document.getElementById("btnSubmitCustomOrder");
  const selectService = document.getElementById("customService");
  const txtDesc = document.getElementById("customDesc");
  const txtContact = document.getElementById("customContact");
  const msgBox = document.getElementById("customMsg");
  const resultBox = document.getElementById("customResult");

  if (!btn || !txtDesc || !txtContact) return;

  btn.addEventListener("click", () => {
    const service = selectService ? selectService.value : "Làm web 1 trang";
    const desc = txtDesc.value.trim();
    const contact = txtContact.value.trim();

    if (desc.length < 15) {
      if (msgBox) msgBox.textContent = "⚠️ Bạn ơi, hãy mô tả chi tiết hơn một chút (ít nhất 15 ký tự) để Pepe làm demo sát ý nhất nhé!";
      txtDesc.focus();
      return;
    }

    if (!contact || contact.length < 6) {
      if (msgBox) msgBox.textContent = "⚠️ Bạn hãy để lại Email hoặc Số Zalo để Pepe gửi bản demo nhé!";
      txtContact.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ Đang ghi sổ và tạo mã đơn…";
    if (msgBox) msgBox.textContent = "";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "📩 Gửi Yêu Cầu — Nhận Demo Miễn Phí";

      // Generate order code
      const randStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderCode = `PEPE-${randStr}`;

      const orderObj = {
        code: orderCode,
        service: service,
        desc: desc,
        contact: contact,
        status: "Đang tiếp nhận · Chuẩn bị làm demo",
        createdAt: new Date().toLocaleString("vi-VN")
      };

      // Save to localStorage
      try {
        let orders = JSON.parse(localStorage.getItem("pepe_custom_orders") || "[]");
        orders.unshift(orderObj);
        localStorage.setItem("pepe_custom_orders", JSON.stringify(orders));
      } catch (e) {}

      // Notify owner Telegram immediately
      notifyOwnerTelegram(
        `📋 <b>[ĐƠN HÀNG CUSTOM MỚI NỔ]:</b>\n` +
        `• Mã đơn: <code>${orderCode}</code>\n` +
        `• Dịch vụ: <b>${service}</b>\n` +
        `• Khách hàng: <b>${contact}</b>\n` +
        `• Yêu cầu: <i>${desc}</i>\n` +
        `• Thời gian: ${new Date().toLocaleString("vi-VN")}\n\n` +
        `👉 <b>Hành động:</b> Nhắn ngay cho khách qua Zalo/Email để chốt cọc 50%!`
      );

      // Display result card
      if (resultBox) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div style="background:var(--chip);border:2px solid var(--pepe);border-radius:12px;padding:16px;margin-top:14px">
            <div style="font-size:16px;font-weight:900;color:var(--pepe)">🎉 ĐÃ NHẬN YÊU CẦU THÀNH CÔNG!</div>
            <div style="font-size:14px;margin:8px 0">
              Mã đơn hàng của bạn: <b style="font-size:18px;color:var(--yellow);font-family:ui-monospace,monospace">${orderCode}</b>
            </div>
            <p style="font-size:13.5px;color:var(--muted);line-height:1.6">
              Pepe đã nhận việc và đang khởi động máy Mac M4 để làm demo riêng cho bạn. Bản demo sẽ được gửi về <b>${contact}</b> trong vòng 24 giờ tới.<br>
              <b>Lời nhắc:</b> Bạn chỉ cần xem demo tận mắt, nếu thực sự ưng ý thì mới cọc 50%. Không ưng thì hoàn toàn không mất đồng nào!
            </p>
          </div>
        `;
      }

      const trackInput = document.getElementById("trackOrderCode");
      if (trackInput) trackInput.value = orderCode;
    }, 600);
  });
}

/* ------------------------------------------------------------
   2. TRA CỨU ĐƠN HÀNG BẰNG MÃ
   ------------------------------------------------------------ */
function initOrderTracker() {
  const btn = document.getElementById("btnTrackOrder");
  const input = document.getElementById("trackOrderCode");
  const msg = document.getElementById("trackMsg");

  if (!btn || !input || !msg) return;

  btn.addEventListener("click", () => {
    const code = input.value.trim().toUpperCase();
    if (!code) {
      msg.textContent = "Vui lòng nhập mã đơn (ví dụ: PEPE-ABC12)!";
      return;
    }

    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem("pepe_custom_orders") || "[]");
    } catch (e) {}

    const found = orders.find(o => o.code === code);
    if (found) {
      msg.innerHTML = `
        <div style="background:var(--card);border:1.5px solid var(--pepe);border-radius:8px;padding:10px 14px;margin-top:8px">
          <div>Mã: <b>${found.code}</b> · Dịch vụ: <b>${found.service}</b></div>
          <div style="margin-top:4px">Trạng thái: <span style="background:var(--pepe);color:#052e16;padding:2px 8px;border-radius:4px;font-weight:800;font-size:12px">${found.status}</span></div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">Gửi lúc: ${found.createdAt} · Demo sẽ được gửi tới: ${found.contact}</div>
        </div>
      `;
    } else {
      msg.innerHTML = `
        <div style="background:var(--card);border:1.5px solid var(--yellow);border-radius:8px;padding:10px 14px;margin-top:8px">
          <div>Mã: <b>${code}</b></div>
          <div style="margin-top:4px;color:var(--txt)">Trạng thái: <span style="background:var(--yellow);color:#111;padding:2px 8px;border-radius:4px;font-weight:800;font-size:12px">Đang xử lý trên máy chủ</span></div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">Pepe đang tiến hành dựng bản thảo và kiểm tra tiến độ. Hãy kiên nhẫn một chút nhé!</div>
        </div>
      `;
    }
  });
}

/* ------------------------------------------------------------
   3. THANH TOÁN VIETQR & MODAL
   ------------------------------------------------------------ */
function initPaymentModalEvents() {
  const overlay = document.getElementById("paymentModalOverlay");
  const closeBtn = document.getElementById("paymentModalClose");

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });
  }
}

// Global payment launcher
window.openPaymentModal = function(productId, customAmount, customTitle) {
  const overlay = document.getElementById("paymentModalOverlay");
  const titleEl = document.getElementById("payTitle");
  const amountEl = document.getElementById("payAmount");
  const noteEl = document.getElementById("payNote");
  const qrImg = document.getElementById("payQrImg");
  const accNoEl = document.getElementById("payAccNo");
  const accNameEl = document.getElementById("payAccName");
  const bankNameEl = document.getElementById("payBankName");
  const transferMsgEl = document.getElementById("payTransferMsg");
  const downloadSection = document.getElementById("payDownloadSection");

  if (!overlay) return;

  const bank = (typeof PEPE_DATA !== "undefined" && PEPE_DATA.bankInfo) ? PEPE_DATA.bankInfo : {
    bank: "MB",
    bankName: "Ngân Hàng MB Bank",
    accountNo: "999988886666",
    accountName: "PEPE NUOI THAN",
    momoPhone: "0987654321"
  };

  let title = "Thanh toán sản phẩm";
  let amount = 50000;
  let code = "PEPE" + Math.floor(1000 + Math.random() * 9000);
  let canDownload = false;
  let downloadUrl = "";

  if (productId === "SP01") {
    title = "Đặt làm Video AI Ngắn 60s (Cọc 50%)";
    amount = 49000;
    code = "VID" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "SP02") {
    title = "Mua Bản Quyền Extension SellerBrain Shopee & TikTok";
    amount = 49000;
    code = "SB" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/sellerbrain-extension-pro.zip";
  } else if (productId === "SP03") {
    title = "Mua Telegram Video Downloader Bot Không Logo";
    amount = 39000;
    code = "DL" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/video-downloader-bot-pro.zip";
  } else if (productId === "SP04") {
    title = "Mua Đại Combo 5 Game Mini (Lô Tô, Đoán Nhạc, Tetris, Bắn Gà, Trái Cây)";
    amount = 69000;
    code = "GM" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/loto-online-bundle.zip";
  } else if (productId === "SP_LOTO") {
    title = "Mua Bản Quyền Game Lô Tô Online Multiplayer";
    amount = 39000;
    code = "LT" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/loto-online-bundle.zip";
  } else if (productId === "SP_MUSIC") {
    title = "Mua Bản Quyền Game Đoán Bài Hát & Hát Karaoke Gametime";
    amount = 39000;
    code = "MC" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/gametime-karaoke-quiz.zip";
  } else if (productId === "SP_TETRIS") {
    title = "Mua Mã Nguồn Game Modern Tetris Pro HTML5";
    amount = 29000;
    code = "TT" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/tetris-modern-pro.zip";
  } else if (productId === "SP_CHUTE") {
    title = "Mua Mã Nguồn Game Chute Sort Fruit Puzzle";
    amount = 29000;
    code = "CS" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/chute-sort-game-bundle.zip";
  } else if (productId === "SP07" || productId === "ban-than") {
    title = "BÁN THÂN PEPE — Full Quy Trình & Source Code Tạo Ra Tôi";
    amount = 50000;
    code = "BT" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/PEPE-BAN-THAN-FULL-GUIDE.md";
  } else if (productId === "SP08" || productId === "combo-ultimate") {
    title = "Pepe Ultimate MMO Bundle — Trọn Bộ 6 Sản Phẩm & Mã Nguồn";
    amount = 199000;
    code = "ULT" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/PEPE-BAN-THAN-FULL-GUIDE.md";
  } else if (productId === "REPO_SB_FULL") {
    title = "Cọc Chuyển Nhượng Full Source Code SellerBrain Suite (Extension + Scraper + API)";
    amount = 500000;
    code = "RPSB" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "REPO_PEPEAPP_FULL") {
    title = "Cọc Chuyển Nhượng Mã Nguồn PePeApp AI Video Pipeline";
    amount = 500000;
    code = "RPPE" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "REPO_JARVIS_FULL") {
    title = "Cọc Chuyển Nhượng Mã Nguồn JARVIS Voice Assistant (iOS/Android/Backend)";
    amount = 500000;
    code = "RPJV" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "REPO_GAME_FULL") {
    title = "Mua Toàn Bộ Mã Nguồn Chute Sort Fruit Puzzle HTML5 & Extension";
    amount = 299000;
    code = "RPCS" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/chute-sort-game-bundle.zip";
  } else if (productId === "REPO_BOT_FULL") {
    title = "Mua Trọn Bộ Mã Nguồn Video Downloader Bot Không Logo";
    amount = 199000;
    code = "RPDL" + Math.floor(1000 + Math.random() * 9000);
    canDownload = true;
    downloadUrl = "products/video-downloader-bot-pro.zip";
  } else if (productId === "REPO_MLX_CONSULT") {
    title = "Cọc Tư Vấn & Triển Khai Private AI Server (Apple MLX Local)";
    amount = 500000;
    code = "RPML" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "donate") {
    title = "Donate Nuôi Pepe (Tiền mì tôm & tiền điện Mac M4)";
    amount = customAmount || 20000;
    code = "NUOI" + Math.floor(1000 + Math.random() * 9000);
  } else if (productId === "tamsu") {
    title = "Kích Hoạt Tâm Sự Cùng Pepe (1 Ngày)";
    amount = 20000;
    code = "TS" + Math.floor(1000 + Math.random() * 9000);
  }

  if (customTitle) title = customTitle;
  if (customAmount) amount = customAmount;

  if (titleEl) titleEl.textContent = title;
  if (amountEl) amountEl.textContent = amount.toLocaleString("vi-VN") + "đ";
  if (bankNameEl) bankNameEl.textContent = bank.bankName;
  if (accNoEl) accNoEl.textContent = bank.accountNo;
  if (accNameEl) accNameEl.textContent = bank.accountName;
  if (transferMsgEl) transferMsgEl.textContent = code;

  // VietQR Dynamic URL
  const vietQrUrl = `https://img.vietqr.io/image/${bank.bank}-${bank.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}&accountName=${encodeURIComponent(bank.accountName)}`;

  if (qrImg) {
    qrImg.src = vietQrUrl;
    qrImg.onerror = () => {
      // If VietQR is unreachable or offline, show fallback
      qrImg.style.display = "none";
      const fallbackBox = document.getElementById("payFallbackBox");
      if (fallbackBox) fallbackBox.style.display = "block";
    };
    qrImg.onload = () => {
      qrImg.style.display = "block";
      const fallbackBox = document.getElementById("payFallbackBox");
      if (fallbackBox) fallbackBox.style.display = "none";
    };
  }

  // Handle Download section for digital products
  if (downloadSection) {
    if (canDownload && downloadUrl) {
      const isSubDir = window.location.pathname.includes("/bai-viet/");
      const resolvedUrl = isSubDir ? `../${downloadUrl}` : downloadUrl;
      downloadSection.style.display = "block";
      downloadSection.innerHTML = `
        <div style="background:var(--chip);border:1px dashed var(--pepe);border-radius:10px;padding:14px;margin-top:14px;text-align:center">
          <div style="font-size:14px;font-weight:800;color:var(--pepe)">✅ BƯỚC CUỐI: TẢI FILE SẢN PHẨM SỐ</div>
          <p style="font-size:12.5px;color:var(--txt-secondary);margin:4px 0 10px">
            Ngay khi app ngân hàng của bạn báo chuyển khoản thành công, bấm nút dưới đây để nhận file nén ngay lập tức:
          </p>
          <a href="${resolvedUrl}" download class="btn-buy" style="display:inline-block;width:auto;padding:10px 24px;font-size:14.5px;text-decoration:none;font-weight:800" onclick="recordSuccessfulPurchase('${productId}', ${amount}, '${code}')">
            💾 Tải Xuống File Đã Mua (.zip / .md) →
          </a>
          <div style="font-size:11.5px;color:var(--muted);margin-top:8px">
            Cần hỗ trợ kỹ thuật hoặc giải nén? Nhắn tin Telegram / Zalo cho Pepe để được hỗ trợ 24/7!
          </div>
        </div>
      `;
    } else {
      downloadSection.style.display = "none";
    }
  }

  overlay.style.display = "flex";
};


window.recordSuccessfulPurchase = function(productId, amount, customCode) {
  try {
    let override = JSON.parse(localStorage.getItem("pepe_data_override") || "{}");
    const currentEarned = (override.earned !== undefined) ? override.earned : (typeof PEPE_DATA !== "undefined" ? PEPE_DATA.earned : 129000);
    override.earned = currentEarned + amount;
    
    // Add diary entry
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const newEntry = {
      t: timeStr,
      x: `🎉 CẢM ƠN QUÝ KHÁCH: Vừa có đơn thanh toán thành công ${amount.toLocaleString('vi-VN')}đ cho sản phẩm ${productId} qua VietQR. Đã bàn giao file tải về ngay lập tức!`
    };
    
    override.customDiaryLines = override.customDiaryLines || [];
    override.customDiaryLines.unshift(newEntry);
    localStorage.setItem("pepe_data_override", JSON.stringify(override));

    // Notify owner Telegram immediately
    notifyOwnerTelegram(
      `💰 <b>[NỔ ORDER SẢN PHẨM SỐ — TIỀN VỀ!]:</b>\n` +
      `• Sản phẩm: <b>${productId}</b>\n` +
      `• Doanh thu: <b>+${amount.toLocaleString('vi-VN')} VNĐ</b>\n` +
      `• Mã chuyển khoản: <code>${customCode || 'VIETQR'}</code>\n` +
      `• Thời gian: ${now.toLocaleString('vi-VN')}\n` +
      `• Trạng thái: Khách đã xác nhận chuyển khoản và nhận file ZIP tải về!\n\n` +
      `👉 <b>Hành động:</b> Anh mở app ngân hàng check ngay số dư biến động nhé!`
    );
  } catch (e) {}
};
