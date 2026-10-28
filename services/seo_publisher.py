"""
Pepe Nuôi Thân — Autonomous SEO Article Publisher & Organic Traffic Engine
Tự động viết và xuất bản các bài viết SEO chuẩn schema HTML vào thư mục bai-viet/
Cập nhật sitemap.xml, cập nhật bài viết trang chủ và submit ngay lên IndexNow (Bing/Google/Yandex)
"""

import json
import logging
import re
from datetime import datetime
from pathlib import Path
from services.config import BASE_DIR
from services.search_indexer import submit_indexnow

logger = logging.getLogger("SEOPublisher")

BAI_VIET_DIR = BASE_DIR / "bai-viet"
BAI_VIET_DIR.mkdir(parents=True, exist_ok=True)
SITEMAP_FILE = BASE_DIR / "sitemap.xml"
INDEX_HTML = BASE_DIR / "index.html"
STATE_FILE = BASE_DIR / ".pepe_seo_state.json"


class SEOPublisher:
    """Cỗ máy tự động sinh bài viết SEO chuẩn chuyên gia, tối ưu thẻ Schema và kéo traffic tự nhiên."""

    SEO_TOPICS = [
        {
            "slug": "huong-dan-kiem-tien-affiliate-cursor-ai-recurring",
            "title": "Hướng Dẫn Kiếm Tiền Affiliate Với Cursor AI — Nhận 20% Hoa Hồng Định Kỳ Trọn Đời",
            "tag": "Affiliate AI Dev Tools",
            "read_time": "5 phút",
            "meta_desc": "Bí quyết làm tiếp thị liên kết (Affiliate) cho Cursor AI Code Editor: Hướng dẫn đăng ký, lấy link ref, cách viết bài review chia sẻ code kéo lập trình viên đăng ký Pro nhận hoa hồng 20% hàng tháng trọn đời.",
            "keywords": ["affiliate cursor ai", "cursor ai kiếm tiền", "hoa hồng cursor ai", "affiliate lập trình viên"],
            "product_cta": {
                "title": "Bí kíp cày Affiliate & Trọn bộ MMO AI Tools của Pepe",
                "desc": "Mở khóa toàn bộ mã nguồn bot, extension và tài liệu vận hành sinh tồn 30 ngày 0đ vốn.",
                "price": "199.000đ",
                "btn_text": "Sở Hữu Trọn Bộ MMO Bundle 199k →",
                "product_id": "SP08"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao Cursor AI lại là kèo Affiliate vàng của năm 2026?",
                    "body": """<p>Trong giới lập trình viên hiện nay, Cursor AI không còn là một cái tên xa lạ. Với việc tích hợp sâu Claude 3.5 Sonnet và GPT-4o, hiểu toàn bộ cấu trúc dự án (codebase) và tính năng Composer sửa nhiều file cùng lúc, Cursor đang dần thay thế hoàn toàn VS Code truyền thống.</p>
<p>Điều tuyệt vời nhất dành cho anh em làm MMO và lập trình viên: <b>Cursor có chính sách Affiliate cực kỳ hào phóng với 20% hoa hồng Recurring (định kỳ mỗi tháng)</b> trọn đời chừng nào người dùng còn gia hạn gói Pro ($20/tháng).</p>
<ul>
  <li>Chỉ cần giới thiệu 50 lập trình viên dùng Cursor Pro: 50 × $20 × 20% = <b>$200/tháng thụ động</b> (gần 5 triệu VNĐ).</li>
  <li>Chạm mốc 200 người dùng tích cực: Thu nhập thụ động đều đặn <b>$800/tháng</b> (gần 20 triệu VNĐ) mà không cần ship hàng hay tồn vốn.</li>
</ul>"""
                },
                {
                    "h2": "2. Chiến lược tạo nội dung hút lập trình viên đăng ký không bị phản cảm",
                    "body": """<p>Lập trình viên là đối tượng rất nhạy cảm với quảng cáo lộ liễu. Bạn không thể spam link ref vào các nhóm lập trình mà mong họ bấm vào. Dưới đây là 3 góc tiếp cận có tỷ lệ chuyển đổi cao nhất:</p>
<div style="background:var(--card);border:1.5px solid var(--line-strong);border-radius:var(--radius);padding:16px;margin:16px 0">
  <div style="font-weight:700;color:var(--amber);margin-bottom:6px">💡 3 GÓC CONTENT CHUYỂN ĐỔI CAO NHẤT:</div>
  <ol style="margin:8px 0 8px 20px;line-height:1.7">
    <li><b>Video ngắn TikTok/Reels so sánh tốc độ:</b> Show cảnh VS Code viết tay 30 phút vs Cursor Composer gõ 1 câu prompt xong ngay 3 file trong 15 giây.</li>
    <li><b>Case Study fix bug hóc búa:</b> Chia sẻ ảnh chụp màn hình terminal gặp lỗi thư viện khó, bấm <code>Ctrl + K</code> để Cursor tự debug và giải thích lý do.</li>
    <li><b>Tài liệu tổng hợp Rule & System Prompt cho Cursor:</b> Tặng miễn phí file <code>.cursorrules</code> chuẩn cho React/Python rồi khéo léo đặt link ref ở chân trang.</li>
  </ol>
</div>"""
                },
                {
                    "h2": "3. Kết hợp tự động hóa quy trình để nhân bản đa kênh",
                    "body": """<p>Để duy trì lượng traffic ổn định, chú ếch Pepe khuyên bạn nên tự động hóa khâu sản xuất nội dung. Hãy dùng AI để lên kịch bản video ngắn, dùng bot Telegram quản trị link và tạo landing page cá nhân để gom tất cả các deal hời lại một chỗ.</p>
<p>Tất cả các sản phẩm số và mã nguồn của hệ sinh thái Pepe Nuôi Thân đều được thiết kế để bạn có thể tải về, cài đặt và bắt đầu xây dựng cỗ máy kiếm tiền online cho riêng mình ngay hôm nay!</p>"""
                }
            ]
        },
        {
            "slug": "tai-video-douyin-khong-watermark-chat-luong-cao",
            "title": "Bí Quyết Tải Video Douyin Không Watermark 4K Cực Nhanh Làm Kênh Reup Triệu View",
            "tag": "Video Reup & Creator",
            "read_time": "4 phút",
            "meta_desc": "Hướng dẫn cách lấy link video Douyin (TikTok Trung Quốc), bóc tách watermark sạch 100% không vỡ hình, tải chất lượng gốc Full HD/4K hoàn toàn miễn phí phục vụ xây kênh TikTok và Facebook Reels.",
            "keywords": ["tải video douyin không logo", "douyin no watermark", "bot tải douyin", "reup douyin triệu view"],
            "product_cta": {
                "title": "Sở Hữu Mã Nguồn Telegram Video Downloader Bot Pro",
                "desc": "Tự host bot riêng tải video sạch logo không giới hạn từ TikTok, Douyin, YouTube, Reels.",
                "price": "39.000đ",
                "btn_text": "Mua Mã Nguồn Bot Chỉ 39k →",
                "product_id": "SP03"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao Douyin luôn là mỏ vàng ý tưởng cho dân sáng tạo nội dung?",
                    "body": """<p>Douyin (phiên bản TikTok nội địa Trung Quốc) luôn đi trước xu hướng thế giới từ 3 đến 6 tháng về hiệu ứng hình ảnh, kịch bản biến hình, góc quay nấu ăn, đời sống và tiểu phẩm hài hước.</p>
<p>Các creator và anh em làm affiliate TikTok Shop tại Việt Nam thường xuyên tìm kiếm video hay trên Douyin để học hỏi ý tưởng, phân tích góc máy hoặc reup có chỉnh sửa (remix/reaction). Tuy nhiên, rào cản lớn nhất là <b>video tải về từ app Douyin luôn bị dính logo mờ và ID của tác giả</b>, khiến thuật toán TikTok kiểm duyệt quét trùng lặp và bóp tương tác ngay lập tức.</p>"""
                },
                {
                    "h2": "2. Cơ chế bóc tách watermark không nén giảm chất lượng",
                    "body": """<p>Nhiều trang web tải video online thường dùng phương pháp dùng AI làm mờ (blur) vùng có logo. Cách này làm video bị nhòe một góc rất xấu. Phương pháp chuẩn kỹ thuật là:</p>
<ul>
  <li>Gửi request giải mã ID video gốc từ server CDN của ByteDance.</li>
  <li>Lấy đường dẫn luồng phát video trực tiếp (direct stream URL) chưa gắn layer watermark.</li>
  <li>Tải trực tiếp file MP4 nguyên bản bitrate cao nhất (1080p hoặc 4K) về máy chủ.</li>
</ul>
<p>Nhờ cơ chế này, video sau khi tải về hoàn toàn tinh tươm, sắc nét từng chi tiết và sẵn sàng để bạn đưa vào CapCut chỉnh sửa thêm phụ đề, lồng tiếng tiếng Việt!</p>"""
                },
                {
                    "h2": "3. Sử dụng Bot Telegram @mucmuc4bot hoặc tự host mã nguồn riêng",
                    "body": """<p>Để không phải xem quảng cáo rác trên các website tải lậu, bạn có thể sử dụng ngay bot Telegram miễn phí của chú ếch Pepe: <b>@mucmuc4bot</b>. Chỉ cần dán link Douyin vào chat, bot sẽ trả lại file video trong 5 giây.</p>
<p>Nếu bạn muốn sở hữu trọn bộ mã nguồn Python không giới hạn để tự chạy cho team hoặc kinh doanh dịch vụ, bạn có thể tải mã nguồn trọn gói chỉ với 39.000đ bên dưới!</p>"""
                }
            ]
        },
        {
            "slug": "cach-tang-don-shopee-bang-seo-tu-khoa-tu-nhien",
            "title": "Bí Quyết Tăng 100 Đơn Shopee Mỗi Ngày Bằng SEO Từ Khóa Tự Nhiên Không Tốn Tiền Ads",
            "tag": "Bí Quyết Bán Hàng Shopee",
            "read_time": "6 phút",
            "meta_desc": "Chiến lược SEO từ khóa tự nhiên trên sàn Shopee năm 2026 giúp sản phẩm hiển thị trang 1 tìm kiếm, tiết kiệm hàng triệu tiền quảng cáo Shopee Ads và tăng chuyển đổi tự nhiên bền vững.",
            "keywords": ["tăng đơn shopee 0đ ads", "seo từ khóa shopee", "cách bán hàng shopee", "sellerbrain shopee"],
            "product_cta": {
                "title": "Extension SellerBrain Shopee & TikTok SEO Pro",
                "desc": "Cào sạch doanh thu đối thủ, phân tích từ khóa hot và viết mô tả chuẩn 100 điểm bằng AI.",
                "price": "49.000đ",
                "btn_text": "Tải Extension SellerBrain 49k →",
                "product_id": "SP02"
            },
            "content_sections": [
                {
                    "h2": "1. Sự thật đắng cay khi quá phụ thuộc vào Shopee Ads",
                    "body": """<p>Hầu hết các shop mới ra đơn đều lập tức nạp tiền chạy Shopee Ads đấu thầu từ khóa. Nhưng chỉ sau một thời gian, chi phí giá thầu (CPC) bị đẩy lên chóng mặt do cạnh tranh, dẫn đến tình trạng: <b>càng bán càng lỗ tiền quảng cáo</b>.</p>
<p>Ngược lại, những gian hàng nghìn đơn bền vững thường có tới 60% - 70% lượng truy cập đến từ <b>tìm kiếm tự nhiên (Organic Search)</b>. Khách hàng chủ động gõ từ khóa vào ô tìm kiếm là những người có nhu cầu mua cao nhất, tỷ lệ chốt đơn (CR) cao gấp 3 lần người lướt xem vu vơ.</p>"""
                },
                {
                    "h2": "2. Chiến lược 4 bước tối ưu SEO On-Page cho sản phẩm Shopee",
                    "body": """<ol style="margin:12px 0 16px 20px;line-height:1.8">
  <li><b>Tìm kiếm từ khóa ngách dài (Long-tail keywords):</b> Thay vì cạnh tranh từ khóa ngắn như <i>"son môi"</i>, hãy nhắm vào <i>"son môi lì dưỡng ẩm lâu trôi không chì cho học sinh"</i>. Lượt tìm kiếm ít hơn nhưng tỷ lệ chuyển đổi đạt tới 15%.</li>
  <li><b>Đặt từ khóa chính trong 30 ký tự đầu của tiêu đề:</b> Thuật toán Shopee đọc từ trái sang phải, các từ khóa xuất hiện đầu tiên có trọng số điểm cao nhất.</li>
  <li><b>Điền đủ 100% thuộc tính sản phẩm:</b> Chất liệu, xuất xứ, mẫu mã, kích thước. Thuật toán bộ lọc (filter) của Shopee dựa hoàn toàn vào các trường này.</li>
  <li><b>Phủ 15 hashtag chiến lược ở cuối mô tả:</b> Gồm 5 hashtag tên sản phẩm, 5 hashtag ngành hàng và 5 hashtag xu hướng tìm kiếm.</li>
</ol>"""
                },
                {
                    "h2": "3. Tự động hóa khâu viết SEO với Extension SellerBrain",
                    "body": """<p>Ngồi viết từng sản phẩm chuẩn SEO mất từ 30 đến 45 phút mỗi listing. Nếu shop của bạn có 50 - 100 mã sản phẩm, đây là một khối lượng công việc khổng lồ.</p>
<p>Với <b>Extension SellerBrain</b>, bạn chỉ cần 1 click ngay trên trình duyệt: AI sẽ tự động phân tích 10 sản phẩm top 1 ngành hàng, tổng hợp bộ từ khóa hot nhất và xuất ra bản mô tả hoàn chỉnh 100 điểm chuẩn SEO trong vòng 5 giây!</p>"""
                }
            ]
        },
        {
            "slug": "kiem-tien-tu-game-web-html5-voi-google-adsense",
            "title": "Cách Kiếm Tiền Thụ Động Từ Game Web HTML5 Với Google AdSense & Affiliate",
            "tag": "Game Web & Kiếm Tiền MMO",
            "read_time": "5 phút",
            "meta_desc": "Mô hình xây dựng website minigame HTML5 (Lô Tô Online, Karaoke Quiz, Modern Tetris) để giữ chân người dùng trên 5 phút, kích hoạt tài khoản Google AdSense và tạo nguồn thu nhập thụ động.",
            "keywords": ["game html5 adsense", "kiếm tiền web game", "source code game loto", "minigame giữ chân khách"],
            "product_cta": {
                "title": "Combo 5 Game Arcade Web HTML5 Cực Cuốn",
                "desc": "Trọn bộ mã nguồn Lô Tô Online đọc số, Đoán bài hát Karaoke, Modern Tetris Pro, Bắn gà, Trái cây.",
                "price": "39.000đ",
                "btn_text": "Mua Combo 5 Game Chỉ 39k →",
                "product_id": "SP04"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao game web HTML5 lại là nam châm giữ chân khách hàng (Dwell Time)?",
                    "body": """<p>Trong các yếu tố xếp hạng SEO của Google năm 2026, <b>Thời gian người dùng ở lại trên trang (Time on Site / Dwell Time)</b> chiếm vị trí tối quan trọng. Một website chỉ có bài viết chữ đơn thuần thường bị người dùng thoát ra sau 30-45 giây.</p>
<p>Nhưng khi tích hợp một trò chơi mini nhẹ nhàng như <b>Lô Tô Online có giọng đọc AI hài hước</b> hoặc <b>Game Đoán Tên Bài Hát qua YouTube</b>, thời gian trải nghiệm trung bình vọt lên từ <b>5 đến 15 phút</b>! Điều này gửi tín hiệu cực mạnh lên Google rằng website của bạn có nội dung vô cùng giá trị, giúp toàn bộ các trang con khác được thăng hạng vượt bậc.</p>"""
                },
                {
                    "h2": "2. 3 Cách khai thác doanh thu từ website có minigame",
                    "body": """<ul>
  <li><b>Đặt banner quảng cáo Google AdSense & Adsterra:</b> Thời gian chơi game lâu đồng nghĩa với lượt hiển thị quảng cáo (Impressions) và tỷ lệ nhấp chuột (CTR) cao gấp 4 lần blog thông thường.</li>
  <li><b>Chèn link Affiliate trong giao diện game:</b> Ví dụ: Game Lô Tô cuối ván có banner khuyến mãi mì tôm, đồ ăn vặt Shopee; Game Karaoke gắn link mua micro, loa kéo Bluetooth.</li>
  <li><b>Tạo minigame cho Fanpage & Sự kiện doanh nghiệp:</b> Nhận hợp đồng dựng minigame quay số, bốc thăm trúng thưởng cho các thương hiệu với giá từ 500k - 2 triệu/game.</li>
</ul>"""
                },
                {
                    "h2": "3. Sở hữu ngay 5 Game Arcade đóng gói sẵn từ chú ếch Pepe",
                    "body": """<p>Bạn không cần phải là chuyên gia lập trình game hay dành hàng tháng trời code từ con số 0. Chú ếch Pepe đã đóng gói sẵn 5 tựa game HTML5 cực nhẹ, tương thích hoàn hảo cả trên điện thoại iPhone/Android và máy tính:</p>
<p>Chỉ với 39.000đ, bạn nhận được toàn bộ file mã nguồn sạch, tải về giải nén và tải lên hosting là chạy ngay lập tức!</p>"""
                }
            ]
        }
    ]

    def _get_published_slugs(self) -> list:
        state = {}
        if STATE_FILE.exists():
            try:
                state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            except Exception:
                pass
        return state.get("published_slugs", [])

    def _save_published_slug(self, slug: str):
        state = {}
        if STATE_FILE.exists():
            try:
                state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            except Exception:
                pass
        slugs = state.get("published_slugs", [])
        if slug not in slugs:
            slugs.append(slug)
        state["published_slugs"] = slugs
        state["last_published_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

    def build_article_html(self, item: dict) -> str:
        """Render complete, responsive, SEO-optimized HTML article."""
        slug = item["slug"]
        title = item["title"]
        tag = item["tag"]
        read_time = item["read_time"]
        meta_desc = item["meta_desc"]
        keywords_str = ", ".join(item.get("keywords", []))
        cta = item["product_cta"]
        now_date_str = datetime.now().strftime("%d/%m/%Y")
        iso_date = datetime.now().strftime("%Y-%m-%d")

        sections_html = ""
        for s in item["content_sections"]:
            sections_html += f"""
    <h2 style="font-size:22px;margin:28px 0 10px;color:var(--pepe)">{s['h2']}</h2>
    <div style="font-size:15.5px;line-height:1.75">
      {s['body']}
    </div>
"""

        html = f"""<!DOCTYPE html>
<html lang="vi" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Pepe Nuôi Thân</title>
  <meta name="description" content="{meta_desc}">
  <meta name="keywords" content="{keywords_str}">
  <link rel="canonical" href="https://ai-earn-money.pages.dev/bai-viet/{slug}.html">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">

  <!-- OpenGraph & Twitter Cards -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:url" content="https://ai-earn-money.pages.dev/bai-viet/{slug}.html">
  <meta property="og:site_name" content="Pepe Nuôi Thân">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{meta_desc}">

  <!-- Schema.org Article Structured Data -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{title}",
    "description": "{meta_desc}",
    "author": {{
      "@type": "Person",
      "name": "Pepe Nuôi Thân"
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "Pepe Nuôi Thân",
      "url": "https://ai-earn-money.pages.dev"
    }},
    "datePublished": "{iso_date}",
    "dateModified": "{iso_date}"
  }}
  </script>
</head>
<body>
  <div class="wrap" style="max-width:760px;margin:0 auto;padding:24px 18px 60px">
    <p style="margin-bottom:14px">
      <a href="../index.html" style="text-decoration:none;color:var(--pepe);font-weight:700">← Quay lại trang chủ Pepe Nuôi Thân</a>
      <span style="color:var(--muted);margin:0 6px">·</span>
      <a href="index.html" style="text-decoration:none;color:var(--txt-secondary)">Tất cả bài viết</a>
    </p>

    <span class="tag">{tag}</span>
    <h1 style="font-size:clamp(24px,5vw,34px);line-height:1.3;margin:14px 0">
      {title}
    </h1>

    <p style="color:var(--txt-secondary);font-size:14px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:20px">
      ✍️ Tác giả: <b>Chú ếch lập trình viên Pepe AI</b> · Xuất bản: {now_date_str} · Thời lượng đọc: {read_time}
    </p>

    {sections_html}

    <!-- Product Card CTA -->
    <div class="method" style="background:var(--card);border:2px solid var(--pepe);padding:20px;border-radius:var(--radius);margin:32px 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <span class="shop-badge tag" style="margin-bottom:8px">SẢN PHẨM KHUYÊN DÙNG</span>
          <h3 style="font-size:18px;margin:4px 0">{cta['title']}</h3>
          <p style="font-size:14px;color:var(--txt-secondary);margin-top:4px">
            {cta['desc']}
          </p>
          <div class="price" style="margin-top:8px;font-size:20px;font-weight:900;color:var(--amber)">{cta['price']}</div>
        </div>
        <button class="btn-buy" style="margin-top:10px;width:auto;padding:12px 24px;font-weight:800" onclick="openPaymentModal('{cta['product_id']}')">
          {cta['btn_text']}
        </button>
      </div>
    </div>

    <!-- Freebie Lead Box -->
    <div style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.1) 100%);border:1.5px dashed var(--yellow);border-radius:12px;padding:18px;margin:24px 0">
      <div style="font-size:15px;font-weight:800;color:var(--yellow);margin-bottom:4px">
        🎁 Tặng Bạn 100+ Prompt AI Viết SEO Shopee & Kịch Bản TikTok Miễn Phí (0đ)
      </div>
      <p style="font-size:13.5px;color:var(--txt-secondary);margin-bottom:10px">
        Nhận ngay trọn bộ tài liệu thực chiến giúp bạn tự động hóa việc viết bài và kéo traffic tự nhiên.
      </p>
      <a href="../products/pepe-100-prompts-mmo-free.zip" download class="btn-buy" style="display:inline-block;padding:8px 18px;font-size:13.5px;background:var(--yellow);color:#111;text-decoration:none;font-weight:800">
        📥 Tải Miễn Phí File ZIP Prompt (0đ) →
      </a>
    </div>

    <!-- Related Articles -->
    <div style="margin-top:36px;border-top:1px solid var(--line);padding-top:20px">
      <h3 style="font-size:17px;margin-bottom:12px">Bài viết cùng chủ đề:</h3>
      <ul style="margin-left:20px;font-size:14.5px;line-height:2">
        <li><a href="cach-soi-doi-thu-va-seo-tu-khoa-shopee.html" style="color:var(--pepe)">Cách Soi Đối Thủ & Tối Ưu Từ Khóa SEO Shopee Lên Top 1 Tìm Kiếm 2026</a></li>
        <li><a href="tai-video-tiktok-douyin-khong-logo.html" style="color:var(--pepe)">Bí Quyết Bóc Tách Link Tải Video TikTok, Douyin Sạch 100% Watermark 4K</a></li>
        <li><a href="game-lo-to-online-va-doan-nhac-karaoke-tet.html" style="color:var(--pepe)">Game Mini Lô Tô Online Tự Đọc Số & Đoán Bài Hát Karaoke</a></li>
        <li><a href="kiem-tien-affiliate-0-dong-von-voi-ai.html" style="color:var(--pepe)">Hướng Dẫn Kiếm 10 Triệu Đầu Tiên Với Affiliate Marketing 0đ Vốn</a></li>
      </ul>
    </div>
  </div>

  <!-- Payment Modal Container -->
  <div id="paymentModalOverlay" class="modal-overlay" style="display:none">
    <div class="modal-panel" style="max-width:440px">
      <div class="modal-header header-pepe">
        <span id="payTitle">Thanh toán sản phẩm</span>
        <button id="paymentModalClose" class="modal-close">✕</button>
      </div>
      <div style="padding:16px;text-align:center">
        <div style="font-size:13px;color:var(--muted);margin-bottom:6px">Quét mã VietQR bằng ứng dụng ngân hàng bất kỳ:</div>
        <div style="display:flex;justify-content:center;margin:10px 0">
          <img id="payQrImg" src="" alt="Mã VietQR Thanh Toán" style="width:240px;height:240px;border-radius:10px;background:#fff;padding:6px">
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px;font-size:13px;text-align:left;line-height:1.6">
          <div>Số tiền: <b id="payAmount" style="color:var(--amber)">0đ</b></div>
          <div>Ngân hàng: <b id="payBankName">MB Bank</b></div>
          <div>Số tài khoản: <b id="payAccNo" style="font-family:monospace">999988886666</b></div>
          <div>Chủ tài khoản: <b id="payAccName">PEPE NUOI THAN</b></div>
          <div>Nội dung CK: <b id="payTransferMsg" style="color:var(--pepe);font-family:monospace">PEPE...</b></div>
        </div>
        <div id="payDownloadSection" style="display:none"></div>
      </div>
    </div>
  </div>

  <script src="../js/data.js"></script>
  <script src="../js/order.js"></script>
</body>
</html>"""
        return html

    def build_blog_index_html(self, articles: list) -> str:
        """Create the central blog index page bai-viet/index.html"""
        cards_html = ""
        for a in articles:
            cards_html += f"""
      <div class="shop-card" style="margin-bottom:16px">
        <span class="tag" style="margin-bottom:8px">{a.get('tag', 'Kiến Thức MMO')}</span>
        <h2 style="font-size:18px;margin:6px 0">
          <a href="{a['slug']}.html" style="color:var(--txt);text-decoration:none">
            {a['title']}
          </a>
        </h2>
        <p style="font-size:14px;color:var(--txt-secondary);line-height:1.6;margin-top:6px">
          {a.get('meta_desc', '')}
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:13px;color:var(--muted)">
          <span>⏱️ {a.get('read_time', '4 phút')} · Tác giả: Pepe AI</span>
          <a href="{a['slug']}.html" style="color:var(--pepe);font-weight:700;text-decoration:none">Đọc bài viết →</a>
        </div>
      </div>
"""
        html = f"""<!DOCTYPE html>
<html lang="vi" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cẩm Nang Bài Viết & Bí Quyết Kiếm Tiền MMO Thực Chiến — Pepe Nuôi Thân</title>
  <meta name="description" content="Tổng hợp toàn bộ bài viết phân tích chuyên sâu về SEO sàn Shopee, TikTok Shop, mẹo tải video không watermark, lập trình game web HTML5 và làm affiliate kiếm tiền online từ số 0.">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="wrap" style="max-width:820px;margin:0 auto;padding:24px 18px 60px">
    <header style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <a href="../index.html" style="text-decoration:none;display:flex;align-items:center;gap:8px;color:var(--txt)">
        <span style="font-size:24px">🐸</span>
        <span style="font-weight:800;color:var(--pepe);font-size:18px">PEPE NUÔI THÂN</span>
      </a>
      <div style="display:flex;gap:12px;font-size:13.5px">
        <a href="../index.html" style="color:var(--txt-secondary);text-decoration:none">Trang chủ</a>
        <a href="../repos.html" style="color:var(--txt-secondary);text-decoration:none">Kho Repo</a>
        <a href="../affiliate.html" style="color:var(--txt-secondary);text-decoration:none">Kèo Affiliate</a>
        <a href="index.html" style="color:var(--pepe);font-weight:700;text-decoration:none">Cẩm Nang Bài Viết</a>
      </div>
    </header>

    <div style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%);border:1px solid var(--pepe);border-radius:var(--radius-lg);padding:24px;text-align:center;margin-bottom:24px">
      <span class="tag">BÍ QUYẾT & KIẾN THỨC THỰC CHIẾN</span>
      <h1 style="font-size:26px;font-weight:900;margin:12px 0 6px">Kho Bài Viết Hướng Dẫn Tối Ưu SEO & Kiếm Tiền MMO</h1>
      <p style="color:var(--txt-secondary);font-size:14px;max-width:620px;margin:0 auto;line-height:1.6">
        Mọi chia sẻ đều đúc kết từ quá trình cày cuốc thực chiến của chú ếch công nghệ Pepe trên chiếc máy Mac M4 với 0 đồng tiền vốn.
      </p>
    </div>

    <!-- Article List -->
    <div style="display:grid;gap:14px">
      {cards_html}
    </div>
  </div>
</body>
</html>"""
        return html

    def update_sitemap(self, new_slug: str):
        """Append new URL to sitemap.xml if not already present."""
        if not SITEMAP_FILE.exists():
            return

        content = SITEMAP_FILE.read_text(encoding="utf-8")
        url_entry = f"https://ai-earn-money.pages.dev/bai-viet/{new_slug}.html"

        if url_entry in content:
            return

        now_date = datetime.now().strftime("%Y-%m-%d")
        new_node = f"""  <url>
    <loc>{url_entry}</loc>
    <lastmod>{now_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>"""

        updated_content = content.replace("</urlset>", new_node)
        SITEMAP_FILE.write_text(updated_content, encoding="utf-8")
        logger.info(f"🗺️ Đã thêm URL {url_entry} vào sitemap.xml")

    def update_home_index_articles(self, new_item: dict):
        """Add new article to #sectionArticles in index.html"""
        if not INDEX_HTML.exists():
            return

        content = INDEX_HTML.read_text(encoding="utf-8")
        slug = new_item["slug"]
        if f"bai-viet/{slug}.html" in content:
            return

        needle = '<ul style="margin:4px 0 4px 20px;font-size:15px;line-height:2.1">'
        new_li = f"""{needle}
        <li>
          <a href="bai-viet/{slug}.html" style="color:var(--pepe);font-weight:700">
            {new_item['title']}
          </a>
          <span style="font-size:12.5px;color:var(--muted)"> — {new_item.get('meta_desc', '')[:90]}...</span>
        </li>"""

        if needle in content:
            content = content.replace(needle, new_li, 1)
            INDEX_HTML.write_text(content, encoding="utf-8")
            logger.info(f"🏠 Đã cập nhật bài viết mới lên trang chủ index.html: {new_item['title']}")

    def publish_next_seo_article(self) -> dict:
        """Publish the next unwritten article from the pool."""
        published = self._get_published_slugs()
        target_item = None

        for item in self.SEO_TOPICS:
            if item["slug"] not in published:
                target_item = item
                break

        if not target_item:
            # If all were published, pick the oldest one to refresh
            target_item = self.SEO_TOPICS[0]

        slug = target_item["slug"]
        html_content = self.build_article_html(target_item)
        file_path = BAI_VIET_DIR / f"{slug}.html"
        file_path.write_text(html_content, encoding="utf-8")
        logger.info(f"📝 Đã xuất bản bài viết SEO mới: {file_path}")

        # Update sitemap.xml
        self.update_sitemap(slug)

        # Update home index.html
        self.update_home_index_articles(target_item)

        # Rebuild blog index page bai-viet/index.html
        all_articles = self.SEO_TOPICS
        blog_index = self.build_blog_index_html(all_articles)
        (BAI_VIET_DIR / "index.html").write_text(blog_index, encoding="utf-8")

        # Save published state
        self._save_published_slug(slug)

        # Ping IndexNow immediately so Bing & Yandex index it
        try:
            submit_indexnow()
            logger.info(f"🌐 [IndexNow] Đã ping công cụ tìm kiếm bài viết mới: {slug}")
        except Exception as e:
            logger.warning(f"Lỗi ping IndexNow: {e}")

        return target_item

    def publish_all_topics_batch(self):
        """Batch publish all defined topics for maximum instant search coverage."""
        results = []
        for item in self.SEO_TOPICS:
            slug = item["slug"]
            html_content = self.build_article_html(item)
            file_path = BAI_VIET_DIR / f"{slug}.html"
            file_path.write_text(html_content, encoding="utf-8")
            self.update_sitemap(slug)
            self.update_home_index_articles(item)
            self._save_published_slug(slug)
            results.append(slug)
            print(f"✅ Đã tạo bài viết: bai-viet/{slug}.html")

        # Create bai-viet/index.html
        blog_index = self.build_blog_index_html(self.SEO_TOPICS)
        (BAI_VIET_DIR / "index.html").write_text(blog_index, encoding="utf-8")
        print("✅ Đã tạo trang mục lục cẩm nang bai-viet/index.html")

        # Submit all to IndexNow
        submit_indexnow()
        print("🚀 Đã submit toàn bộ bài viết mới tới IndexNow!")
        return results


if __name__ == "__main__":
    pub = SEOPublisher()
    print("🚀 Đang khởi động cỗ máy xuất bản bài viết SEO định kỳ...")
    res = pub.publish_all_topics_batch()
    print(f"Hoàn thành xuất bản {len(res)} bài viết SEO!")
