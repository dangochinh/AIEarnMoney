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
SALES_COPY_DIR = PRODUCTS_DIR / "sales_copy"


class ProductEngine:
    PRODUCTS_CATALOG = [
        {
            "id": "prod-sellerbrain",
            "name": "SellerBrain Shopee AI & Scraper Suite",
            "price": "199.000đ",
            "original_price": "499.000đ",
            "file": "sellerbrain-extension-pro.zip",
            "tagline": "Bộ công cụ Chrome Extension + Python cào dữ liệu đối thủ & viết mô tả SEO chuẩn sàn tự động",
            "features": [
                "Cào 500+ sản phẩm đối thủ Shopee/Lazada trong 3 phút",
                "Phân tích đánh giá 1 sao - 5 sao tìm ngách kinh doanh chưa ai làm",
                "Tự động viết tiêu đề & mô tả sản phẩm chuẩn SEO tăng CTR 30%",
                "Mã nguồn mở 100%, không giới hạn số lượng máy sử dụng"
            ]
        },
        {
            "id": "prod-videobot",
            "name": "Telegram Video Downloader Bot Không Logo",
            "price": "149.000đ",
            "original_price": "350.000đ",
            "file": "video-downloader-bot-pro.zip",
            "tagline": "Bot Telegram tự động tải video sạch watermark đa nền tảng TikTok, Douyin, YouTube, Facebook",
            "features": [
                "Bóc tách link tải video HD/4K không dính logo watermark",
                "Tích hợp Python asyncio + yt-dlp + ffmpeg siêu tốc",
                "Hỗ trợ TikTok, Douyin, YouTube Shorts, Reels, Instagram, Facebook",
                "Có sẵn file hướng dẫn cài đặt Docker / VPS chỉ trong 5 phút"
            ]
        },
        {
            "id": "prod-loto",
            "name": "Mã Nguồn Lô Tô Online Đọc Giọng AI & Bắt Bingo",
            "price": "99.000đ",
            "original_price": "250.000đ",
            "file": "loto-online-bundle.zip",
            "tagline": "Game web Lô Tô Tết tương tác lồng quay cầu số 1-90, giọng đọc Web Speech tiếng Việt cực chuẩn",
            "features": [
                "Lồng quay vật lý 3D số 1 đến 90 ngẫu nhiên",
                "Giọng đọc Web Speech API ngân dài điệu đàng như hội chợ",
                "Bảng vé 9x3 tự động tô màu khi số trúng và bắt Bingo chính xác",
                "Full HTML/CSS/JS thuần, nhúng vào web hoặc kiếm tiền Google AdSense tức thì"
            ]
        },
        {
            "id": "prod-gametime",
            "name": "Gametime Đoán Tên Bài Hát & Karaoke YouTube",
            "price": "79.000đ",
            "original_price": "199.000đ",
            "file": "gametime-karaoke-quiz.zip",
            "tagline": "Web App tương tác mini-game âm nhạc, phát nhạc ngẫu nhiên đoán bài hát và hát Karaoke bạn bè",
            "features": [
                "Tích hợp YouTube Iframe API phát nhạc ẩn danh giấu tên bài hát",
                "Chế độ đố vui tính điểm cạnh tranh nhiều người chơi",
                "Chế độ Karaoke hiển thị lyrics hát thả ga ngày lễ Tết",
                "Giao diện neon Cyberpunk siêu đẹp, tương thích mọi thiết bị di động"
            ]
        },
        {
            "id": "prod-tetris",
            "name": "Modern Tetris Pro HTML5 Cảm Ứng Di Động",
            "price": "49.000đ",
            "original_price": "120.000đ",
            "file": "tetris-modern-pro.zip",
            "tagline": "Game xếp gạch cổ điển phiên bản hiện đại đồ họa mượt mà, hỗ trợ cả bàn phím lẫn cảm ứng",
            "features": [
                "Đồ họa phẳng hiện đại kèm hiệu ứng Ghost Piece đổ bóng chuẩn xác",
                "Chế độ sáng/tối (Dark/Light mode) chống mỏi mắt",
                "Bảng nút ảo cảm ứng full màn hình cho iOS và Android",
                "Lưu điểm kỷ lục High Score vào LocalStorage tự động"
            ]
        },
        {
            "id": "prod-chute",
            "name": "Chute Sort Fruit Puzzle HTML5 Game",
            "price": "49.000đ",
            "original_price": "120.000đ",
            "file": "chute-sort-game-bundle.zip",
            "tagline": "Game giải đố phân loại hoa quả vật lý chuyển động nhanh, âm thanh vui nhộn gây nghiện",
            "features": [
                "Engine vật lý 2D trái cây rơi tự nhiên",
                "Lối chơi kéo thả phân loại ống trượt siêu cuốn",
                "Hệ thống combo điểm thưởng và âm thanh sống động",
                "Mã nguồn gọn gàng, sẵn sàng xuất bản lên Facebook Instant Games hoặc web portal"
            ]
        }
    ]

    def __init__(self):
        SEO_PACKS_DIR.mkdir(parents=True, exist_ok=True)
        VIDEO_SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
        SALES_COPY_DIR.mkdir(parents=True, exist_ok=True)

    def generate_product_sales_copy(self, product: dict) -> Path:
        """Tạo bài viết bán hàng theo công thức AIDA chốt đơn tự động."""
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = product["id"].replace("-", "_")
        filename = SALES_COPY_DIR / f"copy_{slug}_{timestamp_str}.md"

        content = f"""# 🚀 BÀI VIẾT BÁN HÀNG AIDA — {product['name'].upper()}

**Sản phẩm**: {product['name']} | **Giá bán**: {product['price']} (Giá gốc: ~~{product['original_price']}~~)  
**Tập tin bàn giao**: `{product['file']}`  
**Thời gian tạo**: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}  

---

### 1. ATTENTION (GÂY CHÚ Ý TỨC THÌ)
🔥 **CẢNH BÁO CHO ANH EM LÀM ONLINE / LẬP TRÌNH VIÊN:**  
Bạn có đang cảm thấy mệt mỏi khi phải tốn hàng đống thời gian và chi phí cho các công cụ đắt đỏ, tính phí thuê bao hàng tháng (SaaS subscription) mà vẫn bị giới hạn tính năng?  
👉 **{product['name']}** chính là giải pháp "mua 1 lần - sở hữu trọn đời" giúp bạn làm chủ công nghệ hoàn toàn!

---

### 2. INTEREST (KÍCH THÍCH SỰ QUAN TÂM)
{product['tagline']}.  
Tại sao sản phẩm này đang được săn đón?
{"".join([f'- ⚡ **{feat}**\\n' for feat in product['features']])}

---

### 3. DESIRE (THÚC ĐẨY KHAO KHÁT SỞ HỮU)
Hãy tưởng tượng:
- Bạn không còn phải trả 20$ - 50$/tháng cho các bên thứ ba.
- Bạn sở hữu toàn bộ mã nguồn sạch, có thể tùy biến thương hiệu riêng (White-label), tự do gắn mã quảng cáo kiếm tiền thụ động hoặc bán lại cho khách hàng của mình.
- Được hỗ trợ kỹ thuật trực tiếp từ chú ếch lập trình viên Pepe AI!

---

### 4. ACTION (HÀNH ĐỘNG NGAY HÔM NAY)
🎁 **Ưu đãi chớp nhoáng (Giảm hơn 50%):**  
Chỉ duy nhất hôm nay: **{product['price']}** (Giá gốc: ~~{product['original_price']}~~).  

👉 **Cách thức mua hàng nhận link tức thì:**
1. Quét mã VietQR trên trang web [https://ai-earn-money.pages.dev/ban-than](https://ai-earn-money.pages.dev/ban-than) với số tiền **{product['price']}**.
2. Nội dung chuyển khoản ghi: `{product['id']}` kèm Email của bạn.
3. Hệ thống Pepe tự động mở khóa link tải file nén `{product['file']}` ngay lập tức!
"""
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        return filename

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
