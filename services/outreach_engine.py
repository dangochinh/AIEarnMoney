"""
Pepe Nuôi Thân — Automated Customer Outreach & Traffic Engine
Tự động sản xuất các bộ nội dung tiếp thị, rải link kéo khách và chốt đơn đa kênh.
"""

import json
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MARKETING_HUB_DIR = BASE_DIR / "marketing_hub"
MARKETING_HUB_DIR.mkdir(parents=True, exist_ok=True)


class OutreachEngine:
    """Cỗ máy tự động soạn các gói content kéo khách nổ đơn theo từng tệp đối tượng."""

    def generate_daily_outreach_pack(self) -> dict:
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M")

        pack = {
            "generated_at": now_str,
            "channels": [
                {
                    "target": "Chủ Shop Shopee / TikTok Shop (Nhóm Facebook & Zalo)",
                    "product": "Extension SellerBrain SEO (49.000đ) + Gói Quà 100+ Prompt (0đ)",
                    "hook": "🔥 [TẶNG ANH EM] Cách soi 500 sản phẩm top 1 ngành hàng Shopee trong 3 phút không tốn tiền mua tool!",
                    "content": (
                        f"🔥 [TẶNG ANH EM 0Đ] 100+ Prompt AI Viết Mô Tả Shopee Đạt Điểm SEO 100 Tuyệt Đối & Soi Doanh Thu Đối Thủ!\n\n"
                        f"Bán hàng sàn năm 2026, anh em nào còn ngồi gõ mô tả thủ công hay copy mò mẫm thì cực kỳ thiệt thòi:\n"
                        f"❌ Đối thủ dùng AI cào từ khóa hot, hiển thị ngập trang 1.\n"
                        f"❌ Listing của mình thì thiếu từ khóa ngách, khách tìm không ra.\n\n"
                        f"🐸 Chú ếch công nghệ Pepe vừa đóng gói trọn bộ tài liệu thực chiến:\n"
                        f"✅ 30 Prompt AI viết tiêu đề & mô tả chuẩn thuật toán Shopee.\n"
                        f"✅ 30 Kịch bản video ngắn TikTok/Reels kéo view tự nhiên.\n"
                        f"🎁 Tải MIỄN PHÍ 100% tại đây: https://ai-earn-money.pages.dev/#products\n\n"
                        f"💡 Đặc biệt: Ai lười copy prompt thì có sẵn Extension Chrome SellerBrain cào tự động chỉ 49k (cài 1 click dùng trọn đời): https://ai-earn-money.pages.dev/bai-viet/cach-soi-doi-thu-va-seo-tu-khoa-shopee.html\n\n"
                        f"#shopee #shopeeanalytics #sellerbrain #seoshopee #pepenuoithan"
                    )
                },
                {
                    "target": "Dân Reup Video, Affiliate TikTok, Creator (Group MMO & Tool)",
                    "product": "Telegram Video Downloader Bot (@mucmuc4bot) + Source Code (39.000đ)",
                    "hook": "🎬 Chia sẻ bot Telegram tải video Douyin/TikTok/Reels không logo miễn phí 100%!",
                    "content": (
                        f"🎬 CHIA SẺ BOT TELEGRAM TẢI VIDEO DOUYIN / TIKTOK / FB SẠCH LOGO CỰC NHANH (KHÔNG QUẢNG CÁO RÁC)!\n\n"
                        f"Anh em làm kênh video ngắn hay reup chắc ức chế nhất cảnh vào mấy web tải video đầy pop-up virus với bắt đợi 30s.\n\n"
                        f"🤖 Mình chia sẻ con bot Telegram chạy thẳng: @mucmuc4bot\n"
                        f"👉 Link bot: https://t.me/mucmuc4bot\n\n"
                        f"⚡ Cách dùng: Gửi link video bất kỳ -> Bot tự tải và trả file MP4 chất lượng gốc HD/4K không dính logo trong 5 giây!\n"
                        f"🎁 Gõ /free_pack để nhận thêm 100+ Prompt AI làm kịch bản video triệu view.\n"
                        f"📦 Bác nào muốn ôm trọn bộ mã nguồn bot này về tự chạy riêng thì ghé web: https://ai-earn-money.pages.dev/bai-viet/tai-video-tiktok-douyin-khong-logo.html (chỉ 39k trọn gói)!\n\n"
                        f"#reupvideo #douyin #tiktokdownloader #mucmuc4bot #kiemtienonline"
                    )
                },
                {
                    "target": "Cộng Đồng Lập Trình Viên, Webmaster, Game Indie (Voz, Facebook Dev, Reddit)",
                    "product": "Combo 5 Game Arcade HTML5 (39.000đ) & Bí Kíp Bán Thân Pepe (50.000đ)",
                    "hook": "🎲 Chia sẻ 5 Game Web HTML5 cực cuốn (Lô Tô Online có đọc số, Đoán nhạc Karaoke, Tetris Pro) mã nguồn mở!",
                    "content": (
                        f"🎲 [SHARE SOURCE] Combo 5 Game Web HTML5 giữ chân người dùng cực tốt cho anh em làm website vệ tinh / minigame!\n\n"
                        f"Mình vừa build xong 5 con game nhẹ tênh, responsive mobile mượt mà:\n"
                        f"1. Game Lô Tô Online: Tự động bốc số, Web Speech đọc số hài hước, dò vé 9x3 trực tiếp.\n"
                        f"2. Game Đoán Tên Bài Hát & Karaoke: Tích hợp API YouTube nghe điệp khúc đoán tên.\n"
                        f"3. Modern Tetris Pro: Xếp gạch HTML5 có cảm ứng chạm di động.\n"
                        f"4. Gà Vàng Vũ Trụ 1999 & Chute Sort Trái Cây.\n\n"
                        f"🎮 Chơi thử trực tiếp không cần cài đặt tại: https://ai-earn-money.pages.dev/game.html\n"
                        f"📦 Tải mã nguồn trọn bộ 5 game chỉ 39.000đ: https://ai-earn-money.pages.dev/bai-viet/game-lo-to-online-va-doan-nhac-karaoke-tet.html\n\n"
                        f"#html5games #gameloto #indiedev #sourcecode #gameweb"
                    )
                }
            ]
        }

        # Lưu ra file markdown trong marketing_hub
        out_file = MARKETING_HUB_DIR / "OUTREACH_READY_PACKS.md"
        lines = [
            f"# 🚀 BỘ NỘI DUNG RẢI LINK KÉO KHÁCH TỰ ĐỘNG — CẬP NHẬT: {now_str}",
            "> Dùng để copy 1-click đăng lên các nhóm Facebook, Zalo, diễn đàn hoặc Telegram.\n"
        ]

        for i, c in enumerate(pack["channels"], 1):
            lines.append(f"## 📌 GÓI {i}: {c['target']}")
            lines.append(f"- **Sản phẩm chốt:** {c['product']}")
            lines.append(f"- **Tiêu đề Hook:** {c['hook']}")
            lines.append("```text")
            lines.append(c["content"])
            lines.append("```\n")

        out_file.write_text("\n".join(lines), encoding="utf-8")
        return pack


if __name__ == "__main__":
    eng = OutreachEngine()
    pack = eng.generate_daily_outreach_pack()
    print("✅ Đã sinh bộ nội dung Outreach kéo khách tại marketing_hub/OUTREACH_READY_PACKS.md")
