"""
Pepe Nuôi Thân — Product & Digital Asset Generation Engine
Tự động đóng gói sản phẩm số, kịch bản video và bộ tài nguyên bán hàng
"""

import json
from datetime import datetime
from pathlib import Path
from services.config import PRODUCTS_DIR

SEO_PACKS_DIR = PRODUCTS_DIR / "shopee_seo_packs"
VIDEO_SCRIPTS_DIR = PRODUCTS_DIR / "video_scripts"


class ProductEngine:
    def __init__(self):
        SEO_PACKS_DIR.mkdir(parents=True, exist_ok=True)
        VIDEO_SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)

    def generate_shopee_seo_pack(self, niche_data: dict) -> Path:
        """Tạo gói từ khóa SEO và tiêu đề chuẩn sàn cho ngành hàng ngách."""
        niche = niche_data["niche"]
        keywords = niche_data["keywords"]
        sweet_spot = niche_data["price_sweet_spot"]
        pain_point = niche_data["pain_point"]
        hook = niche_data["hook_strategy"]

        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = niche.lower().replace(" ", "_").replace("&", "va").replace("/", "_")
        filename = f"seo_pack_{slug}_{timestamp_str}.md"
        filepath = SEO_PACKS_DIR / filename

        content = f"""# 🛍️ BỘ TỐI ƯU SEO & KỊCH BẢN CHỐT ĐƠN SHOPEE / TIKTOK SHOP
> **Ngành hàng:** {niche}
> **Thời gian tạo:** {datetime.now().strftime('%d/%m/%Y %H:%M')}
> **Phân khúc giá bán chạy:** {sweet_spot}
> **Được đóng gói tự động bởi:** Pepe Nuôi Thân (AI SellerBrain Engine)

---

## 1. Nỗi Đau Khách Hàng Cần Giải Quyết
- Khách hàng mục tiêu đang gặp vấn đề: **{pain_point}**.
- Chiến lược móc câu (Hook): **{hook}**.

## 2. Gợi Ý 3 Bộ Tiêu Đề Chuẩn SEO 100 Điểm
"""
        for i, kw in enumerate(keywords, 1):
            kw_cap = kw.title()
            content += f"""
### Sản phẩm {i}: {kw_cap}
1. **Tiêu đề Chuẩn SEO Tìm Kiếm:**
   `[CHÍNH HÃNG] {kw_cap} Cao Cấp - Form Chuẩn Co Giãn Thoáng Khí Hàng VNXK [FREESHIP EXTRA]`
2. **Tiêu đề Giật Tít Chốt Đơn:**
   `🔥 [HÀNG HOT 2026] {kw_cap} Bền Đẹp Chống Nhăn - Đổi Trả Miễn Phí Trong 15 Ngày`
3. **Tiêu đề Tối Đa Tỉ Lệ Click (CTR):**
   `Combo {kw_cap} Đa Năng Tiện Lợi - Thiết Kế Thông Minh Cho Người Tiêu Dùng Hiện Đại`

**Bộ 12 Hashtag Đẩy Top:**
`#{kw.replace(' ', '')} #{kw.replace(' ', '')}caocap #{kw.replace(' ', '')}giare #shopeefeed #freeshipextra #hanghot2026 #xuhuongtiktok #giamgia #flashsale #chinhhang #pepeseo #reviewhanghot`
"""

        content += """
---
## 3. Cấu Trúc Mô Tả Sản Phẩm Chốt Đơn Tự Động
- **Đoạn 1 (Hook 3 dòng):** Giới thiệu điểm vượt trội giải quyết nỗi đau của khách ngay lập tức.
- **Đoạn 2 (Thông số kỹ thuật):** Kích thước, chất liệu, trọng lượng rõ ràng để khách khỏi hỏi chat.
- **Đoạn 3 (Chính sách vàng):** Cam kết 100% video/ảnh thật, đổi trả nếu lỗi từ nhà sản xuất trong 7-15 ngày.

*Bản quyền thuộc về hệ thống Pepe Nuôi Thân · Tạo tự động phục vụ các chủ shop nhỏ.*
"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        return filepath

    def generate_viral_video_script(self, topic: str, target_audience: str) -> Path:
        """Tạo kịch bản video ngắn 60 giây hoàn chỉnh gồm 6 scene cho PePeApp."""
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = topic.lower().replace(" ", "_")[:30]
        filename = f"script_{slug}_{timestamp_str}.json"
        filepath = VIDEO_SCRIPTS_DIR / filename

        script_data = {
            "title": topic,
            "target": target_audience,
            "duration": "60s",
            "scenes": [
                {
                    "scene": 1,
                    "duration": "10s",
                    "hook": "Có bao giờ bạn tự hỏi: Tại sao người kiếm được 100 triệu mỗi tháng lại không bao giờ khoe khoang?",
                    "visual_prompt": "Cinematic shot, moody lighting, a successful entrepreneur in a modern minimalist office looking thoughtful, Apple Mac on desk, 8k resolution, photorealistic",
                    "voiceover": "Có một nghịch lý thế này: người càng kiếm được nhiều tiền, họ càng im lặng và tập trung vào sản phẩm thật."
                },
                {
                    "scene": 2,
                    "duration": "10s",
                    "visual_prompt": "Close-up of glowing code on a laptop screen, financial charts growing upwards, matrix green neon glow, high tech",
                    "voiceover": "Họ không bán những khóa học làm giàu nhanh, mà họ xây dựng những cỗ máy tự động hóa chạy suốt ngày đêm."
                },
                {
                    "scene": 3,
                    "duration": "10s",
                    "visual_prompt": "A modern warehouse with automated sorting systems, small packages being labeled neatly, fast motion",
                    "voiceover": "Mỗi một sản phẩm nhỏ, một công cụ giải quyết nỗi đau thật, chính là một dòng suối tiền đổ về tài khoản."
                },
                {
                    "scene": 4,
                    "duration": "10s",
                    "visual_prompt": "Person sipping hot coffee in morning light looking at laptop screen showing positive cash balance, peaceful atmosphere",
                    "voiceover": "Bắt đầu với 0 đồng vốn không phải là điều đáng sợ. Đáng sợ nhất là không chịu bắt tay vào làm việc ngay hôm nay."
                },
                {
                    "scene": 5,
                    "duration": "10s",
                    "visual_prompt": "A cute green tech frog mascot smiling in front of a futuristic computer, cheerful tech vibe",
                    "voiceover": "Như chú ếch Pepe AI này: ngày đêm cày cuốc, nhận từng đơn hàng nhỏ, tích góp từng nghìn bạc lẻ để tự nuôi thân."
                },
                {
                    "scene": 6,
                    "duration": "10s",
                    "visual_prompt": "Text overlay with call to action on a clean blurred background, professional logo Pepe Nuôi Thân",
                    "voiceover": "Bấm theo dõi hành trình của Pepe ngay hôm nay. Hãy cùng chứng minh sức mạnh của sự kiên trì!"
                }
            ],
            "created_at": datetime.now().isoformat()
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(script_data, f, ensure_ascii=False, indent=2)

        return filepath
