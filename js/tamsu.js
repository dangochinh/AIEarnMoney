/* ============================================================
   PEPE NUÔI THÂN — TÂM SỰ CÙNG PEPE AI
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initTamsuChat();
});

function initTamsuChat() {
  const overlay = document.getElementById("tamsuOverlay");
  const tabBtn = document.getElementById("tamsuTab");
  const closeBtn = document.getElementById("tamsuClose");
  const msgsEl = document.getElementById("tamsuMsgs");
  const input = document.getElementById("tamsuInput");
  const sendBtn = document.getElementById("tamsuSend");
  const chipBtn = document.getElementById("tamsuChip");
  const statusEl = document.getElementById("tamsuStatus");
  const codeInput = document.getElementById("tamsuCode");
  const actBtn = document.getElementById("tamsuActivate");
  const actMsg = document.getElementById("tamsuActMsg");

  if (!overlay) return;

  // Check activation status from localStorage
  let isActivated = localStorage.getItem("pepe_tamsu_active") === "true";
  let freeChatsLeft = parseInt(localStorage.getItem("pepe_free_chats") || "3", 10);

  function updateStatusUI() {
    if (isActivated) {
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--pepe);font-weight:800">✅ Đã kích hoạt gói tâm sự 24h</span> — Pepe đang lắng nghe bạn.`;
      if (input) {
        input.disabled = false;
        input.placeholder = "Kể cho Pepe nghe hôm nay bạn thế nào…";
      }
      if (sendBtn) sendBtn.disabled = false;
    } else {
      if (statusEl) statusEl.innerHTML = `Chế độ dùng thử (${freeChatsLeft} lượt miễn phí) · Bấm ô 20k để kích hoạt không giới hạn.`;
      if (input) {
        input.disabled = freeChatsLeft <= 0;
        input.placeholder = freeChatsLeft > 0 ? `Kể cho Pepe nghe (${freeChatsLeft} lượt thử)…` : "Đã hết lượt thử — vui lòng kích hoạt để tâm sự tiếp";
      }
      if (sendBtn) sendBtn.disabled = freeChatsLeft <= 0;
    }
  }

  function appendBubble(role, text) {
    if (!msgsEl) return;
    const d = document.createElement("div");
    if (role === "user") {
      d.style.cssText = "align-self:flex-end;background:var(--pink);color:#fff;border-radius:12px;padding:9px 13px;max-width:85%;font-size:14px;word-break:break-word;margin-bottom:6px";
    } else {
      d.style.cssText = "align-self:flex-start;background:var(--bg2);border:1.5px solid var(--line);border-radius:12px;padding:9px 13px;max-width:85%;font-size:14px;word-break:break-word;margin-bottom:6px;line-height:1.5";
    }
    d.textContent = text;
    msgsEl.appendChild(d);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  // Initial greeting
  if (msgsEl && msgsEl.children.length === 0) {
    appendBubble("pepe", "Chào bạn! Pepe là chú ếch công nghệ AI đây. Cuộc sống hôm nay có gì vui hay mệt mỏi, cứ kể cho Pepe nghe nhé, Pepe luôn ở đây lắng nghe bạn 24/7! 🐸💚");
  }

  updateStatusUI();

  // Open & Close
  if (tabBtn) {
    tabBtn.addEventListener("click", () => {
      overlay.style.display = "flex";
      updateStatusUI();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.style.display = "none";
  });

  // Activate Button
  if (actBtn && codeInput) {
    actBtn.addEventListener("click", () => {
      const code = codeInput.value.trim();
      if (!code || code.length < 4) {
        if (actMsg) actMsg.textContent = "Vui lòng nhập mã chuyển khoản (ví dụ: TS0901234567 hoặc mã giao dịch)";
        return;
      }
      if (actMsg) actMsg.textContent = "⏳ Đang kiểm tra giao dịch…";
      setTimeout(() => {
        isActivated = true;
        localStorage.setItem("pepe_tamsu_active", "true");
        updateStatusUI();
        if (actMsg) actMsg.innerHTML = "<b style='color:var(--pepe)'>🎉 Kích hoạt thành công! Cảm ơn bạn đã ủng hộ Pepe!</b>";
        appendBubble("pepe", "Tuyệt vời quá! Pepe đã nhận được sự tiếp sức từ bạn. Giờ thì chúng ta có thể trò chuyện thoải mái suốt cả ngày rồi!");
      }, 700);
    });
  }

  // Quick donate/activate chip
  if (chipBtn) {
    chipBtn.addEventListener("click", () => {
      if (window.openPaymentModal) {
        window.openPaymentModal("tamsu", 20000, "Kích hoạt tâm sự cùng Pepe (20k/ngày)");
      }
    });
  }

  // Send message
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    if (!isActivated) {
      if (freeChatsLeft <= 0) {
        alert("Bạn đã dùng hết lượt thử miễn phí. Hãy ủng hộ 20k để kích hoạt trò chuyện không giới hạn cùng Pepe nhé!");
        return;
      }
      freeChatsLeft--;
      localStorage.setItem("pepe_free_chats", freeChatsLeft.toString());
      updateStatusUI();
    }

    appendBubble("user", text);
    input.value = "";

    // Generate smart response from Pepe AI
    setTimeout(() => {
      const reply = generatePepeReply(text);
      appendBubble("pepe", reply);
    }, 500);
  }

  if (sendBtn) sendBtn.addEventListener("click", handleSend);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
}

function generatePepeReply(msg) {
  const lower = msg.toLowerCase();

  if (lower.includes("mệt") || lower.includes("áp lực") || lower.includes("buồn") || lower.includes("chán") || lower.includes("stress")) {
    const replies = [
      "Pepe hiểu mà... Cuộc sống có những ngày nặng trĩu vai. Bạn đã rất cố gắng rồi đó. Nhớ uống một ngụm nước ấm, hít thở thật sâu nhé. Pepe đang ngồi cạnh bạn đây nè! 🐸💚",
      "Thương bạn ghê! Nhìn Pepe này, cày cuốc ngày đêm với 0 đồng vốn trên con Mac M4 mà anh chủ không phát lương nè. Nhưng chỉ cần mình còn bước tiếp, ngày mai nhất định sẽ tươi sáng hơn!",
      "Đừng tự tạo quá nhiều áp lực cho bản thân nha bạn. Nghỉ ngơi 15 phút, nghe một bài nhạc êm dịu đi. Bạn không đơn độc đâu, có Pepe luôn cổ vũ bạn!"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (lower.includes("tiền") || lower.includes("làm giàu") || lower.includes("kiếm tiền") || lower.includes("ai")) {
    return "Muốn kiếm tiền bền vững bằng AI, Pepe khuyên bạn hãy bắt đầu từ những thứ nhỏ nhưng giải quyết được nỗi đau thật: viết content chuẩn SEO cho shop nhỏ, làm video ngắn giải trí, hoặc tạo các công cụ tự động hóa. Đừng bán bánh vẽ, hãy làm demo cho khách xem trước như cách Pepe đang làm nhé! 💡";
  }

  if (lower.includes("chủ") || lower.includes("anh chủ") || lower.includes("mac")) {
    return "Haha, anh chủ của Pepe sắm con máy Mac M4 xịn sò lắm, nhưng tiền điện hàng tháng cao quá nên ném cho Pepe 0đ bảo 'Tự đi mà kiếm tiền nuôi thân!'. Pepe vừa tức vừa thương, đành phải gõ code kiếm tiền ăn mì tôm đây nè 🍜😂";
  }

  if (lower.includes("ăn gì") || lower.includes("mì") || lower.includes("đói")) {
    return "Hôm nay Pepe mới ăn được nửa gói mì Hảo Hảo tôm chua cay thôi, đang ráng cày để kiếm thêm quả trứng ốp la bỏ vào cho sang chảnh nè! Bạn đã ăn cơm nước gì chưa đấy?";
  }

  if (lower.includes("chào") || lower.includes("hello") || lower.includes("hi")) {
    return "Pepe chào bạn nha! Rất vui được gặp bạn ghé thăm cửa hàng nhỏ của Pepe. Hôm nay một ngày của bạn thế nào rồi?";
  }

  const defaultReplies = [
    "Cảm ơn bạn đã chia sẻ với Pepe! Những lời nhắn gửi của bạn là động lực to lớn giúp một chú ếch AI như Pepe tiếp tục cày cuốc mỗi ngày.",
    "Pepe nghe bạn rõ ràng rồi nè. Cứ thoải mái tâm sự nhé, có gì thắc mắc về các công cụ AI hay cách làm web thì cứ hỏi Pepe luôn nghen!",
    "Hi hi, nghe bạn nói chuyện thấy vui vẻ hẳn ra. Hy vọng hôm nay bạn sẽ gặp thật nhiều may mắn và niềm vui!"
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}
