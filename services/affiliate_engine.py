"""
Pepe Nuôi Thân — Autonomous Affiliate Marketing & Viral Content Engine
Tự động săn kèo Affiliate hoa hồng cao và sản xuất Content Viral (TikTok/Reels/Shorts, SEO Reviews, Threads)
KHÔNG apply profile freelancer cá nhân.
"""

import json
import logging
import random
from datetime import datetime
from pathlib import Path
from services.config import BASE_DIR

AFFILIATE_CONTENT_DIR = BASE_DIR / "affiliate_content"
AFFILIATE_ARTICLES_DIR = AFFILIATE_CONTENT_DIR / "articles"
AFFILIATE_SCRIPTS_DIR = AFFILIATE_CONTENT_DIR / "video_scripts"
AFFILIATE_THREADS_DIR = AFFILIATE_CONTENT_DIR / "social_threads"
AFFILIATE_STATE_FILE = BASE_DIR / ".pepe_affiliate_state.json"

for d in [AFFILIATE_ARTICLES_DIR, AFFILIATE_SCRIPTS_DIR, AFFILIATE_THREADS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


class AffiliateContentEngine:
    """Cỗ máy tự động nghiên cứu chiến dịch Affiliate và sinh nội dung tiếp thị liên kết đa kênh."""

    CAMPAIGNS = [
        {
            "id": "aff-hostinger",
            "name": "Hostinger Cloud & VPS Hosting",
            "category": "Cloud & Hosting",
            "commission": "Lên tới 60% mỗi đơn hàng",
            "target_audience": "Lập trình viên, chủ web, anh em MMO làm website vệ tinh",
            "aff_url": "https://www.hostinger.com?REFERRALCODE=PEPEHOSTING",
            "discount_code": "PEPEAI2026 (Giảm thêm 10%)",
            "highlights": [
                "Giá chỉ từ $2.99/tháng kèm Miễn phí Tên miền (.com/.net)",
                "Tích hợp sẵn LiteSpeed Caching tải trang dưới 0.5s",
                "Cài WordPress / Node.js / Python 1 click cực nhanh",
                "Hoàn tiền 30 ngày 100% không cần lý do"
            ]
        },
        {
            "id": "aff-cursor-ai",
            "name": "Cursor AI Code Editor",
            "category": "AI Dev Tools",
            "commission": "20% Recurring hàng tháng",
            "target_audience": "Developer, sinh viên IT, coder muốn x10 tốc độ viết code",
            "aff_url": "https://cursor.com?ref=pepe-ai",
            "discount_code": "Dùng thử miễn phí 14 ngày Pro",
            "highlights": [
                "Tích hợp Claude 3.5 Sonnet & GPT-4o hiểu toàn bộ codebase",
                "Chức năng Composer viết và sửa nhiều file cùng lúc",
                "Tự động fix bug terminal ngay khi gặp lỗi",
                "Chuyển đổi từ VS Code sang không mất 1 giây cài lại extension"
            ]
        },
        {
            "id": "aff-shopee-affiliate",
            "name": "Shopee Affiliate Program",
            "category": "Sàn TMĐT",
            "commission": "Tới 20% hoa hồng trên đơn hàng thành công",
            "target_audience": "Content creator, reviewer công nghệ, mẹ bỉm sữa, sinh viên",
            "aff_url": "https://shopee.vn/m/affiliate-pepe",
            "discount_code": "Mã Freeship Xtra 0đ",
            "highlights": [
                "Hàng triệu sản phẩm công nghệ, đồ gia dụng dễ bán",
                "Hoa hồng Extra từ các nhãn hàng chính hãng Mall lên tới 50%",
                "Cơ chế lưu cookie 7 ngày mua gì cũng được tính hoa hồng",
                "Rút tiền trực tiếp về tài khoản ngân hàng Việt Nam 2 lần/tháng"
            ]
        },
        {
            "id": "aff-capcut-pro",
            "name": "CapCut Pro Video Editor",
            "category": "Video Editing",
            "commission": "30% mỗi lượt đăng ký Pro mới",
            "target_audience": "TikToker, YouTuber, anh em làm video ngắn viral",
            "aff_url": "https://www.capcut.com/tools/pepe-aff",
            "discount_code": "Tặng 7 ngày dùng thử bản Pro",
            "highlights": [
                "Tự động tạo phụ đề Auto Captions tiếng Việt chính xác 98%",
                "Xóa phông video không cần phông xanh bằng AI",
                "Kho hiệu ứng chuyển cảnh & âm thanh TikTok bản quyền",
                "Xuất video 4K 60fps mượt mà không bị bóp tương tác"
            ]
        },
        {
            "id": "aff-elevenlabs",
            "name": "ElevenLabs AI Voice & Cloning",
            "category": "AI Audio & Speech",
            "commission": "22% Recurring trọn đời",
            "target_audience": "Kênh làm podcast, kể chuyện đêm khuya, review phim",
            "aff_url": "https://elevenlabs.io/?from=pepevoice",
            "discount_code": "10,000 ký tự lồng tiếng miễn phí",
            "highlights": [
                "Giọng đọc AI tiếng Việt có cảm xúc chân thực như người thật",
                "Clone giọng cá nhân chỉ từ 1 phút ghi âm",
                "Đa dạng tone giọng: trầm ấm, truyền cảm, hài hước, kịch tính",
                "Không bao giờ lo vi phạm bản quyền giọng đọc"
            ]
        },
        {
            "id": "aff-notion-ai",
            "name": "Notion AI Workspace",
            "category": "Productivity",
            "commission": "50% doanh thu năm đầu tiên",
            "target_audience": "Nhân viên văn phòng, freelancer quản lý công việc, sinh viên",
            "aff_url": "https://notion.so/signup?ref=pepe-productivity",
            "discount_code": "Miễn phí toàn bộ tính năng cơ bản",
            "highlights": [
                "Tóm tắt tài liệu, brainstorm ý tưởng kinh doanh tự động",
                "Quản lý dự án, tài chính cá nhân, to-do list tất cả trong 1",
                "Đồng bộ mượt mà giữa máy tính, điện thoại, máy tính bảng",
                "Hàng ngàn template miễn phí sẵn sàng sử dụng"
            ]
        },
        {
            "id": "aff-binance",
            "name": "Binance Crypto Exchange",
            "category": "Crypto & Finance",
            "commission": "Giảm 20% phí giao dịch + 20% hoa hồng trọn đời",
            "target_audience": "Trader, nhà đầu tư crypto, người nhận thanh toán quốc tế",
            "aff_url": "https://accounts.binance.com/register?ref=PEPECRYPTO",
            "discount_code": "Voucher hoàn tiền $100 phí giao dịch",
            "highlights": [
                "Sàn giao dịch tiền điện tử số 1 thế giới về thanh khoản",
                "Hỗ trợ mua bán P2P qua ngân hàng Việt Nam (Vietcombank, MB, Techcombank)",
                "Bảo mật quỹ SAFU hàng tỷ đô la",
                "Hệ sinh thái Web3, Launchpool kiếm coin miễn phí"
            ]
        }
    ]

    def __init__(self):
        self.state = self._load_state()

    def _load_state(self) -> dict:
        if AFFILIATE_STATE_FILE.exists():
            try:
                with open(AFFILIATE_STATE_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"current_index": 0, "total_generated": 0}

    def _save_state(self):
        with open(AFFILIATE_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(self.state, f, ensure_ascii=False, indent=2)

    def get_next_campaign(self) -> dict:
        idx = self.state.get("current_index", 0)
        camp = self.CAMPAIGNS[idx % len(self.CAMPAIGNS)]
        self.state["current_index"] = idx + 1
        self._save_state()
        return camp

    def generate_viral_video_script(self, camp: dict) -> Path:
        """Tạo kịch bản TikTok / Reels 60s viral chèn link affiliate."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = camp["id"].replace("-", "_")
        filename = AFFILIATE_SCRIPTS_DIR / f"script_{slug}_{timestamp}.md"

        hooks = [
            f"Dừng lại 3 giây nếu bạn vẫn đang tốn hàng giờ làm thủ công mà không biết đến {camp['name']}!",
            f"Bí mật mà các pro MMO không muốn bạn biết: Cách mình tối ưu chi phí và x3 năng suất với {camp['name']}!",
            f"Đừng mua bất kỳ công cụ nào trước khi xem hết video này về {camp['name']}!",
            f"Nếu được quay lại thời điểm bắt đầu kiếm tiền online, đây là công cụ đầu tiên mình sẽ cài đặt: {camp['name']}."
        ]
        chosen_hook = random.choice(hooks)

        content = f"""# 🎬 KỊCH BẢN VIDEO VIRAL TIKTOK / REELS 60s — {camp['name'].upper()}
**Chiến dịch**: {camp['name']} | **Hoa hồng**: {camp['commission']}
**Thời lượng chuẩn**: 60 giây | **Tone giọng**: Hào hứng, sắc bén, đánh thẳng vào nỗi đau
**Mã ưu đãi / Link Bio**: `{camp['aff_url']}` ({camp['discount_code']})

---

### ⏱️ PHÂN CẢNH CHI TIẾT (STORYBOARD):

#### [0:00 - 0:05] HOOK GÂY TÒ MÒ CỰC MẠNH:
- **Visual**: Quay cận mặt biểu cảm hoang mang, chỉ tay vào màn hình hoặc zoom nhanh vào thông báo lỗi / chi phí đắt đỏ.
- **Voiceover**: "{chosen_hook}"
- **Text on Screen**: ⚠️ ĐỪNG LÀM THỦ CÔNG NỮA!

#### [0:05 - 0:25] ĐÁNH VÀO NỖI ĐAU (PROBLEM & AGITATION):
- **Visual**: Thao tác chậm chạp, bảng tính rối rắm, giao diện giật lag hoặc hóa đơn tiền triệu.
- **Voiceover**: "Bạn có đang thấy mình mất cả buổi tối chỉ để làm những việc lặp đi lặp lại? Trong khi đối thủ thì cứ thảnh thơi uống cafe mà đơn hàng hay code vẫn chạy ầm ầm? Lý do không phải họ thông minh hơn, mà họ đang dùng đúng đòn bẩy!"
- **Text on Screen**: ❌ MẤT THỜI GIAN · ❌ TỐN TIỀN OAN

#### [0:25 - 0:45] GIẢI PHÁP ĐỘT PHÁ VỚI {camp['name'].upper()}:
- **Visual**: Chuyển cảnh nhanh sang màn hình giao diện mượt mà của {camp['name']}. Thao tác 1 click hoàn thành tác vụ ngoạn mục.
- **Voiceover**: "Và đây là cứu tinh: {camp['name']}. Nhìn này, chỉ cần 1 cú click:
{"".join([f'- {h}\\n' for h in camp['highlights']])}
Cảm giác như bạn vừa tuyển được một trợ lý đắc lực làm việc 24/7 mà chi phí chỉ bằng cốc trà đá mỗi ngày!"
- **Text on Screen**: ✅ GIẢI PHÁP 1 CLICK ĐỈNH CAO!

#### [0:45 - 0:60] CALL TO ACTION & ƯU ĐÃI ĐỘC QUYỀN (CHỐT AFFILIATE):
- **Visual**: Chỉ tay vào bio / phần comment, hiển thị mã giảm giá to rõ.
- **Voiceover**: "Đặc biệt, Pepe vừa săn được deal độc quyền cho anh em: Nhập mã '{camp['discount_code']}' hoặc bấm ngay vào link ở phần tiểu sử (Bio) để nhận ưu đãi trước khi chương trình kết thúc nhé. Thử ngay kẻo lỡ!"
- **Text on Screen**: 🎁 LINK ƯU ĐÃI Ở PHẦN BIO / COMMENT!

---
*Kịch bản được tạo tự động bởi Pepe Affiliate & Content Engine lúc {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}*
"""
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        logging.info(f"🎬 [AffiliateEngine] Đã sinh Kịch bản Video: {filename.name}")
        return filename

    def generate_review_article(self, camp: dict) -> Path:
        """Tạo bài viết SEO Review chuyên sâu kèm link affiliate."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = camp["id"].replace("-", "_")
        filename = AFFILIATE_ARTICLES_DIR / f"review_{slug}_{timestamp}.md"

        content = f"""# Đánh Giá Chi Tiết {camp['name']} (2026): Có Thực Sự Đáng Đồng Tiền Bát Gạo?

**Tác giả**: Chú ếch Pepe AI (Chuyên viên thẩm định công cụ & tối ưu chi phí)  
**Chiến dịch**: {camp['name']} | **Phân khúc**: {camp['category']}  
**Link nhận ưu đãi chính hãng**: [{camp['name']} Giảm Giá Độc Quyền]({camp['aff_url']})  
**Mã voucher**: `{camp['discount_code']}`  

---

## 1. Giới thiệu tổng quan: {camp['name']} là gì?
Trong bối cảnh công nghệ năm 2026 phát triển như vũ bão, việc tối ưu hóa thời gian và chi phí vận hành là yếu tố sống còn đối với bất kỳ ai làm online. **{camp['name']}** nổi lên như một trong những giải pháp hàng đầu trong phân khúc **{camp['category']}**, nhắm trực diện vào đối tượng {camp['target_audience']}.

Thay vì phải tiêu tốn hàng triệu đồng thuê ngoài hoặc vật lộn với các công cụ cồng kềnh, {camp['name']} mang đến trải nghiệm tinh gọn, mượt mà và hiệu quả tức thì.

---

## 2. Những ưu điểm vượt trội không thể bỏ qua
Sau quá trình trải nghiệm thực tế, Pepe nhận thấy 4 điểm mạnh sáng giá nhất của {camp['name']}:

{"".join([f'### 🌟 {i+1}. {h}\\nGiải quyết triệt để vấn đề thường gặp của người dùng, giúp tiết kiệm ít nhất 70% thời gian xử lý thủ công.\\n\\n' for i, h in enumerate(camp['highlights'])])}

---

## 3. Bảng so sánh {camp['name']} với các giải pháp truyền thống

| Tiêu chí so sánh | Giải pháp truyền thống / Đối thủ cũ | {camp['name']} (Khuyên dùng) |
| :--- | :--- | :--- |
| **Tốc độ triển khai** | Mất từ vài giờ đến vài ngày | Hoàn thành sau 3–5 phút |
| **Chi phí hàng tháng** | Đắt đỏ, tính phí ẩn phức tạp | Minh bạch, tối ưu, giá siêu tiết kiệm |
| **Độ thân thiện giao diện**| Phức tạp, đòi hỏi kỹ thuật cao | Trực quan, người mới bắt đầu dùng ngay |
| **Hỗ trợ khách hàng** | Phản hồi chậm chạp | Hỗ trợ 24/7 nhiệt tình, chuyên nghiệp |

---

## 4. Nhược điểm cần lưu ý
Mặc dù rất xuất sắc, bạn vẫn nên cân nhắc:
- Cần có kết nối internet ổn định để đạt hiệu suất cao nhất.
- Số lượng mã giảm giá khuyến mãi `{camp['discount_code']}` thường có giới hạn theo từng đợt của nhãn hàng.

---

## 5. Hướng dẫn nhận ưu đãi & Bắt đầu sử dụng
Để không bỏ lỡ chương trình khuyến mãi độc quyền:
1. Bấm vào liên kết đăng ký chính thức: [👉 Đăng ký {camp['name']} tại đây]({camp['aff_url']}).
2. Điền thông tin tài khoản và áp dụng mã voucher: `{camp['discount_code']}`.
3. Kích hoạt và trải nghiệm ngay các tính năng mạnh mẽ.

> 💡 **Lời khuyên từ Pepe**: Nếu bạn đang muốn bứt phá hiệu suất công việc trong năm 2026, đây chắc chắn là khoản đầu tư thông minh nhất mà bạn có thể thực hiện hôm nay!
"""
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        logging.info(f"📝 [AffiliateEngine] Đã sinh Bài viết Review SEO: {filename.name}")
        return filename

    def generate_social_thread(self, camp: dict) -> Path:
        """Tạo chuỗi bài đăng Threads / Facebook / X viral ngắn gọn thu hút tương tác."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = camp["id"].replace("-", "_")
        filename = AFFILIATE_THREADS_DIR / f"thread_{slug}_{timestamp}.md"

        content = f"""# 🧵 THREAD VIRAL: 4 BƯỚC X3 HIỆU SUẤT VỚI {camp['name'].upper()}

1/4 🧵 Nếu bạn đang làm việc online mà mỗi ngày vẫn thấy thiếu thời gian, hãy đọc kỹ thread này. Mình vừa tìm ra cách cắt giảm 80% công sức lặp lại nhờ {camp['name']}. 

2/4 💡 Đây là 3 điều khiến {camp['name']} vượt trội hơn tất cả các công cụ khác mình từng thử:
- {camp['highlights'][0]}
- {camp['highlights'][1]}
- {camp['highlights'][2]}

3/4 💰 Chi phí? Bằng đúng một cốc cafe mỗi tuần, nhưng giá trị nó mang lại là cả chục giờ làm việc được giải phóng để bạn dành thời gian kiếm tiền hoặc nghỉ ngơi.

4/4 🎁 Anh em muốn test thử thì ghé qua link ưu đãi độc quyền kèm mã `{camp['discount_code']}` ở đây nhé:
👉 {camp['aff_url']}
Lưu lại thread này ngay trước khi ưu đãi hết hạn! 🚀
"""
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        logging.info(f"📱 [AffiliateEngine] Đã sinh Social Thread: {filename.name}")
        return filename

    def produce_full_affiliate_bundle(self) -> dict:
        """Sản xuất trọn gói 1 chiến dịch Affiliate (Video Script + SEO Article + Social Thread)."""
        camp = self.get_next_campaign()
        script_file = self.generate_viral_video_script(camp)
        article_file = self.generate_review_article(camp)
        thread_file = self.generate_social_thread(camp)

        self.state["total_generated"] = self.state.get("total_generated", 0) + 1
        self._save_state()

        return {
            "campaign": camp,
            "script_path": str(script_file.relative_to(BASE_DIR)),
            "article_path": str(article_file.relative_to(BASE_DIR)),
            "thread_path": str(thread_file.relative_to(BASE_DIR)),
        }
