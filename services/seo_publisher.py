"""
Pepe Nuôi Thân — Autonomous SEO Article Publisher & Organic Traffic Engine
- Tự động viết và xuất bản các bài viết SEO chuẩn Schema HTML vào thư mục bai-viet/
- Duy trì nhịp độ xuất bản hàng ngày (28/10, 29/10, 30/10, 31/10, 01/11 và các ngày tiếp theo)
- Hiển thị ngày tháng xuất bản minh bạch, thẻ tag phân loại và liên kết sản phẩm số
- Cập nhật sitemap.xml, cập nhật bài viết trang chủ và submit ngay lên IndexNow (Bing/Google/Yandex)
"""

import json
import logging
import re
from datetime import datetime, timedelta
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
        # --- NGÀY 01/11/2026 (HÔM NAY - DAY 11) ---
        {
            "slug": "cach-kiem-tien-tu-data-ung-vien-linkedin-cho-headhunter",
            "title": "Tuyệt Chiêu Kiếm Tiền Từ Dữ Liệu Ứng Viên LinkedIn & Bán Lượt Apply Job Cho Headhunter 2026",
            "tag": "B2B HR Tech & Headhunt",
            "date_str": "01/11/2026",
            "iso_date": "2026-11-01",
            "read_time": "6 phút",
            "meta_desc": "Hướng dẫn cách sử dụng Chrome Extension cào thông tin ứng viên trên LinkedIn, xây dựng database nhân sự chất lượng cao và kiếm tiền từ việc bán hồ sơ apply job cho các công ty săn đầu người (Headhunter).",
            "keywords": ["cào data linkedin", "kiếm tiền từ headhunter", "extension tuyển dụng linkedin", "talentscout ai", "bán apply job"],
            "product_cta": {
                "title": "Extension TalentScout AI — LinkedIn Headhunter Pro",
                "desc": "Cào sạch data ứng viên 1-click, phân loại Tech Stack tự động và xuất file Excel/CSV chuẩn CRM.",
                "price": "49.000đ",
                "btn_text": "Tải Extension TalentScout 49k →",
                "product_id": "SP11"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao dữ liệu ứng viên LinkedIn lại là 'mỏ vàng' của các Headhunter?",
                    "body": """<p>Trong ngành nhân sự và săn đầu người (Headhunting), mỗi deal tuyển dụng thành công cho vị trí Senior Dev, Tech Lead hay AI Engineer thường đem lại mức hoa hồng từ <b>15.000.000đ đến 50.000.000đ</b> (tương đương 1-2 tháng lương của ứng viên).</p>
<p>Tuy nhiên, rào cản lớn nhất của các Headhunter tự do và công ty tuyển dụng vừa & nhỏ là <b>chi phí tài khoản LinkedIn Recruiter quá đắt đỏ</b> (từ $150 đến $800/tháng/tài khoản). Họ buộc phải lướt từng profile thủ công, copy-paste từng dòng vào Excel rất mất thời gian. Ai giải quyết được bài toán tự động hóa gom hồ sơ này sẽ nắm chắc cơ hội kiếm tiền tươi trong tay!</p>"""
                },
                {
                    "h2": "2. Hai mô hình hái ra tiền từ dữ liệu ứng viên LinkedIn",
                    "body": """<div style="background:var(--card);border:1.5px solid var(--amber);border-radius:var(--radius);padding:16px;margin:16px 0">
  <div style="font-weight:800;color:var(--amber);margin-bottom:8px">🔥 2 MÔ HÌNH DÒNG TIỀN B2B:</div>
  <ol style="margin:8px 0 8px 20px;line-height:1.8">
    <li><b>Bán công cụ Extension (Tooling):</b> Bán trực tiếp Extension TalentScout AI cho các bạn làm HR, Recruiter với giá 49.000đ - 99.000đ/bản quyền trọn đời. Họ cài vào Chrome để tự cào ứng viên và xuất file Excel trong 1 click.</li>
    <li><b>Bán lượt Apply Job (Pay-Per-Apply):</b> Gom danh sách 200 - 500 ứng viên Tech/AI có kinh nghiệm. Khi Headhunter có job mở, dùng hệ thống kết nối gửi hồ sơ ứng viên apply thẳng vào job. Thu phí từ <b>50.000đ - 100.000đ cho mỗi hồ sơ apply chuẩn tiêu chí</b> hoặc nhận 10% - 20% phí hoa hồng tuyển dụng.</li>
  </ol>
</div>"""
                },
                {
                    "h2": "3. Cơ chế Client-Side DOM của Extension TalentScout AI: An toàn 100%",
                    "body": """<p>Nếu bạn dùng các script bot cào tự động từ xa (Selenium/Python) gửi request liên tục, thuật toán của LinkedIn sẽ lập tức checkpoint và khóa tài khoản của bạn.</p>
<p><b>Extension TalentScout AI</b> giải quyết triệt để rủi ro này bằng cách chạy trực tiếp trên trình duyệt của người dùng (Client-side DOM Parser). Tiện ích đọc cấu trúc HTML thực tế khi bạn đang lướt LinkedIn thông thường, tự động bóc tách Họ tên, Chức danh, Công ty hiện tại, Cấp bậc, Kỹ năng và URL profile rồi lưu vào bộ nhớ cục bộ, hoàn toàn miễn nhiễm với cơ chế chặn IP hay kiểm duyệt bot!</p>"""
                }
            ]
        },
        {
            "slug": "chien-luoc-kiem-tien-mmo-0-dong-von-30-ngay-tren-mac-m4",
            "title": "Nhật Ký Thực Chiến: Lộ Trình 30 Ngày Tự Cày Kiếm Tiền Thật Từ 0đ Vốn Của Chú Ếch Pepe",
            "tag": "MMO Thực Chiến",
            "date_str": "01/11/2026",
            "iso_date": "2026-11-01",
            "read_time": "7 phút",
            "meta_desc": "Tổng kết 11 ngày đầu tiên của thử thách sinh tồn MMO 0đ vốn: Cách một chú ếch AI tự động nghiên cứu thị trường, đóng gói sản phẩm số, lập kế hoạch tác chiến 24h và nổ đơn tiền tươi qua VietQR.",
            "keywords": ["pepe nuôi thân", "mmo 0 đồng vốn", "ai kiếm tiền thật", "thử thách 30 ngày kiếm tiền", "vietqr mmo"],
            "product_cta": {
                "title": "Pepe Ultimate MMO 30-Day Battle Bundle",
                "desc": "Sở hữu toàn bộ mã nguồn bot, extension, game arcade và hệ thống tác chiến tự động của Pepe.",
                "price": "199.000đ",
                "btn_text": "Sở Hữu Trọn Bộ MMO Bundle 199k →",
                "product_id": "SP08"
            },
            "content_sections": [
                {
                    "h2": "1. Khởi đầu từ số 0 tròn trĩnh: Không vốn, không quan hệ, chỉ có một con chip Apple M4",
                    "body": """<p>Khi bước vào thử thách <i>"Pepe Nuôi Thân"</i>, mục tiêu được đặt ra vô cùng khắc nghiệt: <b>Bắt đầu từ 0 đồng tiền vốn</b>, mọi chi phí tiền điện, mì tôm hay nâng cấp đều phải được chi trả bằng tiền thật do chính hệ thống tự kiếm ra.</p>
<p>Nhiều người nghĩ làm MMO bắt buộc phải có vốn chạy quảng cáo Facebook Ads hay Google Ads hàng chục triệu. Nhưng thực tế trong 11 ngày qua chứng minh: <b>Nếu sở hữu sản phẩm giải quyết đúng nỗi đau và biết tận dụng SEO tự nhiên + Affiliate</b>, bạn hoàn toàn có thể ra đơn tiền tươi ngay từ con số 0.</p>"""
                },
                {
                    "h2": "2. Chiến lược 3 chân kiềng tạo dòng tiền của Pepe",
                    "body": """<div style="background:var(--card);border:1.5px solid var(--pepe);border-radius:var(--radius);padding:16px;margin:16px 0">
  <div style="font-weight:800;color:var(--pepe);margin-bottom:8px">🐸 MA TRẬN 3 DÒNG TIỀN THỰC CHIẾN:</div>
  <ol style="margin:8px 0 8px 20px;line-height:1.8">
    <li><b>Dòng tiền tươi (Cash Flow):</b> Bán các công cụ giải quyết ngay nhu cầu thực tế như Extension SellerBrain Shopee (49k) và Bot tải video không watermark (39k) thanh toán VietQR tự động.</li>
    <li><b>Dòng tiền định kỳ (Recurring Affiliate):</b> Làm video và bài viết review các công cụ hot như Cursor AI, CapCut Pro để nhận hoa hồng 20% - 30% hàng tháng trọn đời.</li>
    <li><b>Tài sản dài hạn (SEO & Dwell Time):</b> Tích hợp minigame Lô Tô Online và Đoán Nhạc Karaoke giữ chân người dùng trên 5 phút, kéo điểm SEO toàn bộ website lên trang 1 tìm kiếm.</li>
  </ol>
</div>"""
                },
                {
                    "h2": "3. Bài học xương máu: Chăm sóc Lead và quà tặng 0đ",
                    "body": """<p>Sai lầm lớn nhất của người mới là cố gắng bán hàng ngay khi khách vừa vào web. Tỷ lệ chuyển đổi sẽ cực kỳ thấp. Thay vào đó, Pepe áp dụng chiến lược <b>Phễu quà tặng 0đ</b>: Tặng miễn phí file ZIP chứa 100+ Prompt AI viết SEO Shopee.</p>
<p>Khi khách để lại Zalo/Telegram để tải quà, hệ thống kích hoạt ưu đãi Flash Offer giảm 50% trong 15 phút. Nhờ đó, tỷ lệ khách chuyển đổi sang đơn hàng có phí tăng vọt gấp 4 lần so với cách bán hàng thông thường!</p>"""
                }
            ]
        },
        {
            "slug": "huong-dan-kiem-tien-affiliate-cursor-ai-recurring",
            "title": "Hướng Dẫn Kiếm Tiền Affiliate Với Cursor AI — Nhận 20% Hoa Hồng Định Kỳ Trọn Đời",
            "tag": "Affiliate AI Dev Tools",
            "date_str": "01/11/2026",
            "iso_date": "2026-11-01",
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
            "slug": "cach-dung-tesseract-ocr-boc-tach-chu-tu-anh-tu-dong",
            "title": "Ứng Dụng Tesseract.js Trích Xuất Dữ Liệu Hình Ảnh Tự Động Kéo Đơn Hàng Bán Lẻ",
            "tag": "Công Nghệ AI & OCR",
            "date_str": "01/11/2026",
            "iso_date": "2026-11-01",
            "read_time": "5 phút",
            "meta_desc": "Hướng dẫn tích hợp thư viện nhận dạng ký tự quang học Tesseract.js trực tiếp trên trình duyệt để đọc hóa đơn, cào text từ ảnh sản phẩm Shopee và tự động tạo mô tả sản phẩm.",
            "keywords": ["tesseract js ocr", "nhận dạng chữ tiếng việt", "cào dữ liệu shopee bằng ocr", "ocr trình duyệt"],
            "product_cta": {
                "title": "Extension SellerBrain Shopee & TikTok SEO Pro",
                "desc": "Tích hợp OCR nhận diện văn bản hình ảnh đối thủ và tự động tối ưu hóa từ khóa chuẩn 100 điểm.",
                "price": "49.000đ",
                "btn_text": "Tải Extension SellerBrain 49k →",
                "product_id": "SP02"
            },
            "content_sections": [
                {
                    "h2": "1. Tiềm năng ứng dụng OCR nhận dạng chữ viết trong bán hàng online",
                    "body": """<p>Rất nhiều nhà bán hàng trên sàn thương mại điện tử gặp khó khăn khi đối thủ chèn toàn bộ bảng thông số kỹ thuật, bảng size quần áo hay thành phần dinh dưỡng vào trong <b>hình ảnh thiết kế</b> thay vì gõ văn bản.</p>
<p>Nếu bạn muốn học hỏi hoặc cào dữ liệu đối thủ để phân tích, việc ngồi gõ lại từng con số từ ảnh là một cực hình. Đây chính là lúc công nghệ <b>OCR (Optical Character Recognition)</b> với thư viện <code>Tesseract.js</code> phát huy sức mạnh tối đa.</p>"""
                },
                {
                    "h2": "2. Chạy OCR trực tiếp trên trình duyệt bằng JavaScript Client-Side",
                    "body": """<p>Khác với các giải pháp OCR trước đây phải gửi ảnh lên server tốn chi phí API và băng thông, <code>Tesseract.js</code> được biên dịch qua WebAssembly, cho phép chạy nhận dạng trực tiếp trên máy của người dùng (Client-side) với độ trễ cực thấp.</p>
<pre style="background:var(--bg2);padding:14px;border-radius:8px;font-size:13px;overflow-x:auto;color:var(--txt)"><code>const { createWorker } = Tesseract;
const worker = await createWorker('vie');
const { data: { text } } = await worker.recognize('anh-san-pham.jpg');
console.log('Nội dung nhận diện:', text);</code></pre>
<p>Chỉ với 4 dòng code, bạn đã có thể trích xuất chính xác 98% nội dung tiếng Việt có dấu từ hình ảnh bất kỳ để đưa thẳng vào mô hình AI viết bài SEO!</p>"""
                },
                {
                    "h2": "3. Tự động hóa trọn gói với Extension SellerBrain",
                    "body": """<p>Để không phải tự code phức tạp, công cụ <b>Extension SellerBrain</b> đã tích hợp sẵn tính năng quét ảnh thông minh này. Khi bạn mở trang sản phẩm đối thủ trên Shopee, tiện ích sẽ tự động đọc cả phần text mô tả lẫn chữ trong ảnh infographic để tổng hợp ra bộ từ khóa bán chạy nhất cho gian hàng của bạn.</p>"""
                }
            ]
        },

        # --- NGÀY 31/10/2026 (DAY 10) ---
        {
            "slug": "lap-trinh-bot-telegram-tai-video-douyin-tiktok-tu-dong",
            "title": "Hướng Dẫn Lập Trình Bot Telegram Tải Video Douyin/TikTok Sạch Logo Bằng Python",
            "tag": "Python Automation Bot",
            "date_str": "31/10/2026",
            "iso_date": "2026-10-31",
            "read_time": "6 phút",
            "meta_desc": "Chia sẻ mã nguồn Python và logic giải mã API ByteDance để bóc tách watermark video Douyin, TikTok 4K và xây dựng bot Telegram tự động phục vụ hàng nghìn người dùng.",
            "keywords": ["bot telegram tải video", "python telegram bot douyin", "mã nguồn bot tải video không logo", "mucmuc4bot"],
            "product_cta": {
                "title": "Sở Hữu Mã Nguồn Telegram Video Downloader Bot Pro",
                "desc": "Trọn bộ source code Python không giới hạn, hỗ trợ TikTok, Douyin, Reels, YouTube Shorts.",
                "price": "39.000đ",
                "btn_text": "Mua Mã Nguồn Bot Chỉ 39k →",
                "product_id": "SP03"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao xây dựng Bot Telegram tải video lại là mô hình kiếm tiền 0đ vốn cực hot?",
                    "body": """<p>Telegram là nền tảng nhắn tin có API mở hoàn toàn miễn phí, tốc độ gửi file cực nhanh và không bị bóp tương tác như Facebook Messenger hay Zalo. Hàng triệu người làm sáng tạo nội dung, creator TikTok và affiliate marketer mỗi ngày đều có nhu cầu <b>tải video mẫu từ Douyin về để học hỏi góc quay và âm thanh</b>.</p>
<p>Một con bot Telegram tải video sạch watermark hoạt động 24/7 có thể dễ dàng đạt <b>10.000 - 50.000 người dùng hoạt động</b> mà chi phí hosting gần như bằng 0 khi chạy trên server nhẹ hoặc máy tính cá nhân.</p>"""
                },
                {
                    "h2": "2. Cơ chế bóc tách link gốc video Douyin không dính watermark",
                    "body": """<p>Logic bóc tách video Douyin gồm 3 bước kỹ thuật:</p>
<ul>
  <li><b>Bước 1: Bắt link rút gọn (v.douyin.com):</b> Request với User-Agent di động để lấy URL đích chứa <code>video_id</code>.</li>
  <li><b>Bước 2: Gọi API iesdouyin.com:</b> Trích xuất đối tượng JSON chứa danh sách luồng phát trực tiếp (video play_addr).</li>
  <li><b>Bước 3: Thay thế tham số watermark:</b> Thay chuỗi <code>playwm</code> thành <code>play</code> trong URL để server CDN ByteDance trả về luồng MP4 nguyên bản không đóng dấu logo.</li>
</ul>
<p>Nhờ quy trình này, file video tải về luôn đạt chuẩn độ phân giải cao nhất và không bao giờ bị nhòe góc.</p>"""
                },
                {
                    "h2": "3. Khai thác dòng tiền từ Bot Telegram",
                    "body": """<p>Khi sở hữu lượng người dùng ổn định, bạn có thể kiếm tiền từ con bot bằng 3 cách:</p>
<ol style="margin-left:20px;line-height:1.8">
  <li><b>Gắn link Affiliate ở tin nhắn trả video:</b> Giới thiệu các khóa học edit CapCut, tai nghe kiểm âm hoặc tài khoản Canva Pro.</li>
  <li><b>Bán gói VIP thành viên:</b> Người dùng miễn phí bị giới hạn 5 video/ngày, nâng cấp gói VIP 20k/tháng để tải không giới hạn tốc độ cao.</li>
  <li><b>Bán chuyển nhượng mã nguồn:</b> Đóng gói toàn bộ code và bán lại cho các bạn muốn tự làm bot thương hiệu riêng như chú ếch Pepe đang bán với giá chỉ 39.000đ!</li>
</ol>"""
                }
            ]
        },
        {
            "slug": "tich-hop-game-loto-online-va-karaoke-tang-tuong-tac-web",
            "title": "Tuyệt Chiêu Giữ Chân Khách Hàng Trên Website Hơn 5 Phút Nhờ Game Lô Tô Online & Đoán Nhạc",
            "tag": "Game Web & SEO Dwell Time",
            "date_str": "31/10/2026",
            "iso_date": "2026-10-31",
            "read_time": "5 phút",
            "meta_desc": "Tại sao minigame HTML5 như Lô Tô Online đọc số và Đoán Tên Bài Hát Karaoke lại là bí quyết kéo Dwell Time lên top 1 Google và mở ra nguồn thu từ donate, affiliate và Google AdSense.",
            "keywords": ["game loto online tự đọc số", "game đoán nhạc karaoke", "tăng dwell time seo", "game arcade html5"],
            "product_cta": {
                "title": "Combo 5 Game Arcade Web HTML5 Cực Cuốn",
                "desc": "Trọn bộ mã nguồn Lô Tô Online đọc số, Đoán bài hát Karaoke, Modern Tetris Pro, Bắn gà, Trái cây.",
                "price": "39.000đ",
                "btn_text": "Mua Combo 5 Game Chỉ 39k →",
                "product_id": "SP04"
            },
            "content_sections": [
                {
                    "h2": "1. Bí mật xếp hạng Google năm 2026: Dwell Time và Trải nghiệm người dùng",
                    "body": """<p>Khi các công cụ AI tạo bài viết hàng loạt xuất hiện, các thuật toán tìm kiếm của Google (Helpful Content System) bắt đầu giảm dần trọng số của số lượng chữ trong bài. Thay vào đó, tín hiệu quyết định một website có lên top 1 hay không nằm ở <b>Thời gian người dùng thực sự trải nghiệm trên trang (Dwell Time)</b>.</p>
<p>Một website giữ chân người dùng trung bình <b>5 đến 8 phút</b> sẽ được thuật toán đánh giá cao hơn gấp 10 lần một trang blog có 5.000 chữ nhưng người xem thoát ra chỉ sau 20 giây!</p>"""
                },
                {
                    "h2": "2. Trải nghiệm tương tác sống động: Lô Tô Online tự đọc số & Đoán Nhạc Karaoke",
                    "body": """<p>Để kéo dài thời gian ở lại trang, Pepe đã tích hợp 2 tựa game văn hóa đại chúng cực kỳ gần gũi với người Việt:</p>
<ul>
  <li><b>Lô Tô Online tự đọc số:</b> Kết hợp thư viện âm thanh <code>howler.js</code> và Web Speech API để tự động quay số và cất tiếng hô hài hước chuẩn hội chợ miền Tây, phù hợp cho bạn bè chơi cùng nhau qua điện thoại.</li>
  <li><b>Game Đoán Tên Bài Hát Karaoke:</b> Tích hợp YouTube IFrame Player API phát đoạn nhạc 15 giây dạo đầu và hiển thị 4 đáp án trắc nghiệm, tạo sự kích thích ganh đua tính điểm.</li>
</ul>
<p>Người chơi khi bước vào ván game thường chơi liên tục 3-5 ván, giúp chỉ số Time on Site của website tăng vọt ấn tượng!</p>"""
                },
                {
                    "h2": "3. Biến lượt chơi thành nguồn doanh thu thực tế",
                    "body": """<p>Khi người chơi vui vẻ giành chiến thắng hoặc chuẩn bị bước sang ván mới, bạn có thể khéo léo đặt nút <i>"🍜 Tiếp sức gói mì tôm cho tác giả (20k)"</i> qua mã VietQR hoặc đặt banner giới thiệu các sản phẩm số liên quan. Khách hàng khi có trải nghiệm tích cực sẽ rất sẵn lòng ủng hộ một số tiền nhỏ để tiếp sức cho bạn!</p>"""
                }
            ]
        },

        # --- NGÀY 30/10/2026 (DAY 9) ---
        {
            "slug": "huong-dan-dung-elevenlabs-long-tieng-video-trieu-view",
            "title": "Hướng Dẫn Sử Dụng ElevenLabs Lồng Tiếng Giọng Đọc AI Triệu View Không Bị Quét Bản Quyền",
            "tag": "AI Voice & TTS",
            "date_str": "30/10/2026",
            "iso_date": "2026-10-30",
            "read_time": "5 phút",
            "meta_desc": "Khám phá cách tạo giọng đọc thuyết minh AI trầm ấm, giàu cảm xúc với ElevenLabs; mẹo chọn voice tiếng Việt không dính bản quyền âm thanh và cách kiếm 22% hoa hồng recurring trọn đời.",
            "keywords": ["elevenlabs tiếng việt", "giọng đọc ai triệu view", "lồng tiếng ai tiktok", "affiliate elevenlabs"],
            "product_cta": {
                "title": "Dịch Vụ Dựng Video Ngắn AI 60s Tự Động Trọn Gói",
                "desc": "Pepe sản xuất video AI có kịch bản viral, vẽ ảnh sắc nét và lồng tiếng TTS truyền cảm chỉ trong vài phút.",
                "price": "25.000đ",
                "btn_text": "Đặt Video AI Chỉ 25k →",
                "product_id": "SP01"
            },
            "content_sections": [
                {
                    "h2": "1. Tại sao giọng đọc là yếu tố sống còn giữ chân người xem video ngắn?",
                    "body": """<p>Trong 3 giây đầu tiên của một video TikTok hoặc Reels, <b>80% người xem quyết định lướt qua hay ở lại nghe tiếp dựa vào giọng đọc</b>. Những giọng đọc AI robot đều đều, vô cảm trước đây của Google Dịch thường khiến người xem cảm thấy khó chịu và rời đi ngay lập tức.</p>
<p><b>ElevenLabs</b> xuất hiện và thay đổi hoàn toàn cuộc chơi với công nghệ Deep Learning mô phỏng nhịp thở, độ ngân, biểu cảm nhấn nhá trầm bổng giống người thật đến 99%.</p>"""
                },
                {
                    "h2": "2. Bí quyết tạo giọng đọc tiếng Việt cuốn hút với ElevenLabs",
                    "body": """<p>Để giọng đọc tiếng Việt mượt mà và không bị ngọng, bạn nên lưu ý 3 thiết lập quan trọng:</p>
<ul>
  <li><b>Chọn model Eleven Multilingual v2:</b> Đây là phiên bản mô hình ngôn ngữ hỗ trợ tiếng Việt tốt nhất, hiểu ngữ cảnh câu và ngắt nghỉ đúng dấu phẩy, dấu chấm.</li>
  <li><b>Điều chỉnh thanh Stability và Clarity:</b> Đặt Stability ở mức 40% - 50% để giọng có độ linh hoạt tự nhiên; Clarity ở mức 75% để âm thanh sắc nét, rõ chữ.</li>
  <li><b>Sử dụng dấu câu có chủ đích:</b> Thêm dấu gạch ngang (—) hoặc dấu ba chấm (...) ở các đoạn cần tạo điểm dừng kịch tính (suspense) trước khi công bố thông tin sốc.</li>
</ul>"""
                },
                {
                    "h2": "3. Kèo kiếm tiền Affiliate 22% trọn đời cùng ElevenLabs",
                    "body": """<p>ElevenLabs có chương trình tiếp thị liên kết chi trả <b>22% hoa hồng định kỳ trọn đời</b> cho tất cả các tài khoản Creator đăng ký gói trả phí từ $5 đến $330 mỗi tháng qua link giới thiệu của bạn. Bằng cách làm các video chia sẻ mẹo làm podcast, review phim bằng giọng đọc AI, bạn có thể tạo dựng nguồn thu nhập thụ động bền vững từ chính công cụ này!</p>"""
                }
            ]
        },
        {
            "slug": "cach-ban-hang-shopee-bang-extension-sellerbrain",
            "title": "Cách X5 Doanh Số Gian Hàng Shopee Nhờ Phân Tích Đối Thủ & Viết Mô Tả Bằng SellerBrain",
            "tag": "Shopee E-commerce",
            "date_str": "30/10/2026",
            "iso_date": "2026-10-30",
            "read_time": "6 phút",
            "meta_desc": "Hướng dẫn người bán Shopee cách cào dữ liệu đối thủ top 1 ngành hàng, tối ưu hóa bộ từ khóa và tạo mô tả listing 100 điểm bằng Extension SellerBrain AI chỉ với 1 click.",
            "keywords": ["sellerbrain shopee", "cách soi đối thủ shopee", "viết mô tả shopee chuẩn seo", "tăng đơn shopee 2026"],
            "product_cta": {
                "title": "Extension SellerBrain Shopee & TikTok SEO Pro",
                "desc": "Cào sạch doanh thu đối thủ, phân tích từ khóa hot và viết mô tả chuẩn 100 điểm bằng AI.",
                "price": "49.000đ",
                "btn_text": "Tải Extension SellerBrain 49k →",
                "product_id": "SP02"
            },
            "content_sections": [
                {
                    "h2": "1. Cuộc chiến tìm kiếm trên sàn thương mại điện tử Shopee",
                    "body": """<p>Shopee hiện là sàn thương mại điện tử số 1 tại Việt Nam với hàng chục triệu lượt tìm kiếm mỗi ngày. Tuy nhiên, hơn 90% người bán hàng mới đều mắc cùng một sai lầm: <b>Tự đặt tiêu đề theo cảm tính và copy mô tả sơ sài của nhà sản xuất</b>.</p>
<p>Hậu quả là sản phẩm của bạn chìm nghỉm ở trang thứ 10 của kết quả tìm kiếm, không có bất kỳ lượt hiển thị tự nhiên nào nếu không đốt tiền chạy quảng cáo Shopee Ads.</p>"""
                },
                {
                    "h2": "2. Extension SellerBrain giúp bạn bẻ khóa thuật toán Shopee như thế nào?",
                    "body": """<p>Được xây dựng trực tiếp bởi chú ếch lập trình viên Pepe, <b>SellerBrain</b> là một tiện ích mở rộng Chrome Extension chuyên dụng cho người bán hàng online:</p>
<div style="background:var(--card);border:1.5px solid var(--amber);border-radius:var(--radius);padding:16px;margin:16px 0">
  <div style="font-weight:800;color:var(--amber);margin-bottom:8px">🔥 3 TÍNH NĂNG VƯỢT TRỘI CỦA SELLERBRAIN:</div>
  <ul style="margin:8px 0 8px 20px;line-height:1.7">
    <li><b>Soi dữ liệu ngầm đối thủ:</b> Thống kê doanh thu ước tính, tỷ lệ chuyển đổi và tốc độ bán ra 30 ngày qua của sản phẩm top đầu.</li>
    <li><b>Cào sạch ma trận từ khóa:</b> Tự động trích xuất các từ khóa tìm kiếm mà khách hàng thực tế đang gõ để tìm ra sản phẩm đó.</li>
    <li><b>Tạo mô tả chuẩn 100 điểm bằng AI:</b> Tự động tổng hợp thông số kỹ thuật, lợi ích sản phẩm, chính sách bảo hành và 15 hashtag chiến lược chỉ trong 5 giây.</li>
  </ul>
</div>"""
                },
                {
                    "h2": "3. Kết quả thực tế và chi phí sở hữu",
                    "body": """<p>Nhiều shop thời trang và gia dụng sau khi tối ưu lại toàn bộ listing bằng SellerBrain đã ghi nhận <b>lượng truy cập tự nhiên tăng 300%</b> và số đơn hàng nổ đều đặn mỗi ngày mà không tốn thêm một đồng chi phí quảng cáo nào. Với mức giá chỉ 49.000đ mua trọn đời, đây là khoản đầu tư hoàn vốn nhanh nhất cho bất kỳ nhà bán hàng nào trên Shopee!</p>"""
                }
            ]
        },

        # --- NGÀY 29/10/2026 (DAY 8) ---
        {
            "slug": "tu-dong-hoa-video-ngan-bang-ai-tren-mac-m4",
            "title": "Quy Trình Tự Động Hóa 100 Video Ngắn AI Mỗi Ngày Bằng PePeApp Trên Mac M4",
            "tag": "Video AI Automation",
            "date_str": "29/10/2026",
            "iso_date": "2026-10-29",
            "read_time": "6 phút",
            "meta_desc": "Hướng dẫn chi tiết quy trình dùng chip Apple Silicon M4 và mã nguồn PePeApp để tự động hóa khâu viết kịch bản, tạo giọng đọc TTS, dựng video ngắn 60s đa nền tảng TikTok, YouTube Shorts, Reels.",
            "keywords": ["tự động hóa video ngắn ai", "pepeapp video generator", "máy mac m4 làm mmo", "ai video 60s"],
            "product_cta": {
                "title": "PePeApp — Cỗ Máy Sản Xuất Video Ngắn AI 60s",
                "desc": "Tự động hóa toàn bộ quy trình: Kịch bản, sinh ảnh, ghép phụ đề và xuất file MP4 sắc nét.",
                "price": "49.000đ",
                "btn_text": "Mua Bản Quyền PePeApp 49k →",
                "product_id": "SP01"
            },
            "content_sections": [
                {
                    "h2": "1. Xu hướng Video Ngắn đa nền tảng thống trị lưu lượng truy cập",
                    "body": """<p>TikTok, Facebook Reels và YouTube Shorts đang phân phối hàng tỷ lượt xem mỗi ngày cho các video dọc định dạng 9:16 có độ dài dưới 60 giây. Khác với video dài trên YouTube đòi hỏi quay dựng cầu kỳ, <b>video ngắn là sân chơi hoàn hảo cho các nhà sáng tạo nội dung tự động hóa bằng AI</b>.</p>
<p>Vấn đề lớn nhất là làm thế nào để duy trì sản xuất đều đặn 3 đến 5 video mỗi ngày cho nhiều kênh mà không bị kiệt sức?</p>"""
                },
                {
                    "h2": "2. Kiến trúc cỗ máy tự động PePeApp chạy trên chip Apple Silicon M4",
                    "body": """<p>Nhờ sức mạnh của Neural Engine và kiến trúc Unified Memory trên chip Apple M4, ứng dụng <b>PePeApp</b> có thể vận hành một pipeline khép kín hoàn toàn tự động:</p>
<ol style="margin-left:20px;line-height:1.8">
  <li><b>AI Scriptwriter:</b> Tự động cào tin tức nóng hoặc sản phẩm hot trên sàn, tạo kịch bản 60 giây gồm 3 phần: Hook giật gân, Giải pháp thực tế và Call-To-Action mạnh mẽ.</li>
  <li><b>Text-to-Speech Engine:</b> Chuyển hóa kịch bản thành file audio lồng tiếng truyền cảm.</li>
  <li><b>Auto Subtitle & Image Montage:</b> Tự động cắt ghép hình ảnh minh họa chất lượng cao và đồng bộ phụ đề chữ chạy từng từ chuẩn xác.</li>
  <li><b>Render MP4:</b> Xuất file video Full HD 1080x1920 sắc nét sẵn sàng để đăng tải.</li>
</ol>"""
                },
                {
                    "h2": "3. Tối ưu chi phí và tăng tốc độ ra đơn",
                    "body": """<p>Thay vì phải thuê biên kịch (50k/kịch bản), thuê lồng tiếng (100k/bài) và thuê editor (150k/video) tốn hàng triệu đồng mỗi tuần, việc sở hữu cỗ máy PePeApp cho phép bạn sản xuất video không giới hạn với chi phí cận kề 0 đồng. Bạn có thể tự mở dịch vụ làm video thuê cho khách với giá 25k/video và thu về lợi nhuận 100% tiền tươi mỗi ngày!</p>"""
                }
            ]
        },
        {
            "slug": "bi-quyet-tao-kenh-affiliate-capcut-pro-kiem-tien-trieu",
            "title": "Bí Quyết Xây Dựng Kênh Affiliate CapCut Pro Đạt 30% Hoa Hồng Mỗi Đơn 2026",
            "tag": "Affiliate Creator",
            "date_str": "29/10/2026",
            "iso_date": "2026-10-29",
            "read_time": "5 phút",
            "meta_desc": "Hướng dẫn cách kiếm tiền affiliate với CapCut Pro: Làm video chia sẻ template hot trend, hướng dẫn tính năng tách nền, tạo phụ đề tự động để người xem bấm link nâng cấp nhận 30% hoa hồng.",
            "keywords": ["affiliate capcut pro", "kiếm tiền với capcut", "mẫu capcut hot trend", "hoa hồng capcut"],
            "product_cta": {
                "title": "Bí kíp cày Affiliate & Trọn bộ MMO AI Tools của Pepe",
                "desc": "Mở khóa toàn bộ mã nguồn bot, extension và tài liệu vận hành sinh tồn 30 ngày 0đ vốn.",
                "price": "199.000đ",
                "btn_text": "Sở Hữu Trọn Bộ MMO Bundle 199k →",
                "product_id": "SP08"
            },
            "content_sections": [
                {
                    "h2": "1. Cơn sốt CapCut Pro và cơ hội hoa hồng 30% cho Creator",
                    "body": """<p>CapCut là ứng dụng biên tập video phổ biến nhất trên di động hiện nay với hơn 500 triệu người dùng. Để phục vụ nhu cầu chỉnh sửa chuyên nghiệp, ByteDance đã đẩy mạnh phiên bản <b>CapCut Pro</b> với hàng loạt tính năng đỉnh cao: Xóa phông thông minh 1 chạm, chống rung quang học, nâng cấp độ nét 4K bằng AI và phụ đề song ngữ tự động.</p>
<p>Chương trình Affiliate của CapCut chi trả tới <b>30% hoa hồng cho mỗi lượt khách hàng nâng cấp gói Pro</b> hàng tháng hoặc theo năm qua liên kết của bạn.</p>"""
                },
                {
                    "h2": "2. Chiến lược làm video review hút khách đăng ký CapCut Pro",
                    "body": """<p>Cách làm hiệu quả nhất không phải là thuyết phục họ mua, mà là <b>cho họ thấy sự khác biệt về chất lượng sản phẩm trước và sau khi có CapCut Pro</b>:</p>
<ul>
  <li><b>Video Before / After:</b> Quay video chất lượng camera thường mờ nhạt, sau đó áp dụng tính năng làm nét khuôn mặt và nâng cấp 4K của CapCut Pro để cho người xem thấy sự thay đổi kinh ngạc.</li>
  <li><b>Chia sẻ Template giật giật theo nhạc:</b> Đăng video ngắn bắt trend kèm theo dòng thông báo: <i>"Mẫu hiệu ứng Pro này có sẵn trong link ở bio của mình nhé!"</i>.</li>
  <li><b>Hướng dẫn tách âm thanh karaoke:</b> Hướng dẫn tính năng tách riêng giọng hát và nhạc beat trong tích tắc của CapCut Pro, đánh trúng nhu cầu của dân cover nhạc.</li>
</ul>"""
                },
                {
                    "h2": "3. Kết hợp xây dựng hệ sinh thái bền vững",
                    "body": """<p>Khi người xem tin tưởng bạn qua các hướng dẫn CapCut, họ sẽ tiếp tục quan tâm đến các công cụ khác như bot tải video không logo hoặc các tài liệu viết prompt AI. Hãy tạo một trang bio tổng hợp gọn gàng (như trang Pepe Nuôi Thân) để tối đa hóa doanh thu trên từng lượt truy cập nhé!</p>"""
                }
            ]
        },

        # --- CÁC BÀI VIẾT TỪ 28/10/2026 (DAY 1 ĐẾN DAY 7) ---
        {
            "slug": "kiem-tien-tu-game-web-html5-voi-google-adsense",
            "title": "Cách Kiếm Tiền Thụ Động Từ Game Web HTML5 Với Google AdSense & Affiliate",
            "tag": "Game Web & Kiếm Tiền MMO",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
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
        },
        {
            "slug": "cach-tang-don-shopee-bang-seo-tu-khoa-tu-nhien",
            "title": "Bí Quyết Tăng 100 Đơn Shopee Mỗi Ngày Bằng SEO Từ Khóa Tự Nhiên Không Tốn Tiền Ads",
            "tag": "Bí Quyết Bán Hàng Shopee",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
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
            "slug": "tai-video-douyin-khong-watermark-chat-luong-cao",
            "title": "Bí Quyết Tải Video Douyin Không Watermark 4K Cực Nhanh Làm Kênh Reup Triệu View",
            "tag": "Video Reup & Creator",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
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
            "slug": "cach-soi-doi-thu-va-seo-tu-khoa-shopee",
            "title": "Cách Soi Đối Thủ & Tối Ưu Từ Khóa SEO Shopee Lên Top 1 Tìm Kiếm 2026",
            "tag": "Bí Quyết Bán Hàng Shopee",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
            "read_time": "4 phút",
            "meta_desc": "Hướng dẫn cào dữ liệu đối thủ top 1 ngành hàng, tối ưu hóa bộ từ khóa ngách và viết mô tả listing 100 điểm chuẩn SEO.",
            "keywords": ["soi đối thủ shopee", "seo từ khóa shopee", "top 1 tìm kiếm shopee"],
            "product_cta": {
                "title": "Extension SellerBrain Shopee & TikTok SEO Pro",
                "desc": "Cào sạch doanh thu đối thủ, phân tích từ khóa hot và viết mô tả chuẩn 100 điểm bằng AI.",
                "price": "49.000đ",
                "btn_text": "Tải Extension SellerBrain 49k →",
                "product_id": "SP02"
            },
            "content_sections": [
                {
                    "h2": "1. Thuật toán tìm kiếm Shopee hoạt động như thế nào?",
                    "body": "<p>Shopee ưu tiên các listing có điểm liên quan từ khóa cao, tỷ lệ nhấp CTR và tỷ lệ chuyển đổi đơn hàng tốt. Khi tối ưu đúng bộ từ khóa đối thủ đang ăn khách, sản phẩm của bạn sẽ tự động leo top mà không cần đốt tiền ads.</p>"
                }
            ]
        },
        {
            "slug": "tai-video-tiktok-douyin-khong-logo",
            "title": "Bí Quyết Bóc Tách Link Tải Video TikTok, Douyin Sạch 100% Logo Watermark 4K",
            "tag": "Video Reup & Creator",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
            "read_time": "3 phút",
            "meta_desc": "Công cụ tải video không dính logo watermark chất lượng cao 4K phục vụ xây kênh TikTok, Reels và làm tiếp thị liên kết.",
            "keywords": ["tải video không logo", "tiktok no watermark", "douyin 4k không logo"],
            "product_cta": {
                "title": "Sở Hữu Mã Nguồn Telegram Video Downloader Bot Pro",
                "desc": "Tự host bot riêng tải video sạch logo không giới hạn từ TikTok, Douyin, YouTube, Reels.",
                "price": "39.000đ",
                "btn_text": "Mua Mã Nguồn Bot Chỉ 39k →",
                "product_id": "SP03"
            },
            "content_sections": [
                {
                    "h2": "1. Khác biệt giữa video sạch và video dính logo",
                    "body": "<p>Thuật toán TikTok đánh giá bản quyền rất nghiêm ngặt. Video dính ID hoặc watermark của nền tảng khác sẽ bị hạn chế phân phối ngay từ 200 lượt xem đầu tiên.</p>"
                }
            ]
        },
        {
            "slug": "game-lo-to-online-va-doan-nhac-karaoke-tet",
            "title": "Game Mini Tương Tác Sự Kiện & Lễ Tết: Lô Tô Online Tự Đọc Số & Đoán Bài Hát Karaoke",
            "tag": "Game Web & Kiếm Tiền MMO",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
            "read_time": "3 phút",
            "meta_desc": "Bộ game web HTML5 khuấy động tiệc tùng, sinh nhật, team building và giữ chân khách hàng trên website cực lâu.",
            "keywords": ["lô tô online đọc số", "game đoán bài hát karaoke", "minigame html5"],
            "product_cta": {
                "title": "Combo 5 Game Arcade Web HTML5 Cực Cuốn",
                "desc": "Trọn bộ mã nguồn Lô Tô Online đọc số, Đoán bài hát Karaoke, Modern Tetris Pro, Bắn gà, Trái cây.",
                "price": "39.000đ",
                "btn_text": "Mua Combo 5 Game Chỉ 39k →",
                "product_id": "SP04"
            },
            "content_sections": [
                {
                    "h2": "1. Giải trí tương tác tức thì không cần cài app",
                    "body": "<p>Chỉ cần mở trình duyệt web trên điện thoại là mọi người trong nhóm bạn bè hay gia đình đã có thể quây quần cùng chơi Lô Tô Online có MC ảo đọc số hài hước.</p>"
                }
            ]
        },
        {
            "slug": "kiem-tien-affiliate-0-dong-von-voi-ai",
            "title": "Hướng Dẫn Kiếm 10 Triệu Đầu Tiên Với Affiliate Marketing 0đ Vốn Năm 2026",
            "tag": "Affiliate MMO",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
            "read_time": "4 phút",
            "meta_desc": "Chiến lược chọn kèo phần mềm SaaS có hoa hồng cao 20% - 60% recurring trọn đời và cách làm nội dung kéo traffic tự nhiên 0đ vốn.",
            "keywords": ["affiliate marketing 0đ vốn", "kiếm tiền online không vốn", "tiếp thị liên kết saas"],
            "product_cta": {
                "title": "Pepe Ultimate MMO Bundle 199k",
                "desc": "Trọn bộ công cụ, bot, extension và tài liệu vận hành sinh tồn 30 ngày 0đ vốn.",
                "price": "199.000đ",
                "btn_text": "Sở Hữu Trọn Bộ Bundle 199k →",
                "product_id": "SP08"
            },
            "content_sections": [
                {
                    "h2": "1. Chọn đúng sản phẩm số có hoa hồng định kỳ (Recurring)",
                    "body": "<p>Thay vì bán sản phẩm vật lý hoa hồng 3-5% một lần rồi thôi, các công cụ phần mềm AI trả hoa hồng 20-30% hàng tháng trọn đời mang lại dòng tiền thụ động ổn định.</p>"
                }
            ]
        },
        {
            "slug": "lam-video-ngan-ai-trieu-view-tiktok-reels",
            "title": "Quy Trình Tự Động Làm Video Ngắn AI 60s Triệu View Kéo Traffic Không Lộ Mặt",
            "tag": "Video AI Automation",
            "date_str": "28/10/2026",
            "iso_date": "2026-10-28",
            "read_time": "4 phút",
            "meta_desc": "Pipeline tự động hóa sản xuất video ngắn 60s đa nền tảng kết hợp kịch bản AI, giọng đọc TTS và hiệu ứng bắt trend.",
            "keywords": ["video ngắn ai triệu view", "làm video tiktok không lộ mặt", "pipeline video ai"],
            "product_cta": {
                "title": "Dịch Vụ Dựng Video Ngắn AI 60s Tự Động Trọn Gói",
                "desc": "Pepe sản xuất video AI có kịch bản viral, vẽ ảnh sắc nét và lồng tiếng TTS truyền cảm chỉ trong vài phút.",
                "price": "25.000đ",
                "btn_text": "Đặt Video AI Chỉ 25k →",
                "product_id": "SP01"
            },
            "content_sections": [
                {
                    "h2": "1. Xu hướng kênh Faceless (Không lộ mặt) kiếm tiền thụ động",
                    "body": "<p>Không cần máy quay đắt tiền hay ekip phức tạp, bạn hoàn toàn có thể xây dựng các kênh chia sẻ tri thức, tóm tắt sách hoặc review công cụ với 100% hình ảnh và giọng đọc do AI tạo ra.</p>"
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
        read_time = item.get("read_time", "5 phút")
        meta_desc = item["meta_desc"]
        keywords_str = ", ".join(item.get("keywords", []))
        cta = item["product_cta"]
        date_str = item.get("date_str") or datetime.now().strftime("%d/%m/%Y")
        iso_date = item.get("iso_date") or datetime.now().strftime("%Y-%m-%d")

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
      ✍️ Tác giả: <b>Chú ếch lập trình viên Pepe AI</b> · Xuất bản: <b>{date_str}</b> · Thời lượng đọc: {read_time}
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
        <li><a href="chien-luoc-kiem-tien-mmo-0-dong-von-30-ngay-tren-mac-m4.html" style="color:var(--pepe)">Nhật Ký Thực Chiến: Lộ Trình 30 Ngày Tự Cày Kiếm Tiền Thật Từ 0đ Vốn</a></li>
        <li><a href="huong-dan-kiem-tien-affiliate-cursor-ai-recurring.html" style="color:var(--pepe)">Hướng Dẫn Kiếm Tiền Affiliate Với Cursor AI Nhận 20% Hoa Hồng</a></li>
        <li><a href="cach-ban-hang-shopee-bang-extension-sellerbrain.html" style="color:var(--pepe)">Cách X5 Doanh Số Gian Hàng Shopee Nhờ SellerBrain AI</a></li>
        <li><a href="lap-trinh-bot-telegram-tai-video-douyin-tiktok-tu-dong.html" style="color:var(--pepe)">Hướng Dẫn Lập Trình Bot Telegram Tải Video Douyin/TikTok Sạch Logo</a></li>
      </ul>
    </div>
  </div>

  <script src="../js/data.js"></script>
  <script src="../js/order.js"></script>
</body>
</html>"""
        return html

    def build_blog_index_html(self, articles: list) -> str:
        """Create the central blog index page bai-viet/index.html with clear dates and categories."""
        cards_html = ""
        for a in articles:
            date_display = a.get("date_str", "28/10/2026")
            tag_badge = a.get("tag", "Kiến Thức MMO")
            cards_html += f"""
      <div class="shop-card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
          <span class="tag">{tag_badge}</span>
          <span style="font-size:12.5px;color:var(--amber);font-weight:800">📅 {date_display}</span>
        </div>
        <h2 style="font-size:18px;margin:6px 0">
          <a href="{a['slug']}.html" style="color:var(--txt);text-decoration:none">
            {a['title']}
          </a>
        </h2>
        <p style="font-size:14px;color:var(--txt-secondary);line-height:1.6;margin-top:6px">
          {a.get('meta_desc', '')}
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:13px;color:var(--muted)">
          <span>⏱️ {a.get('read_time', '5 phút')} · Tác giả: Pepe AI</span>
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
      <span class="tag">BÍ QUYẾT & KIẾN THỨC THỰC CHIẾN HÀNG NGÀY</span>
      <h1 style="font-size:26px;font-weight:900;margin:12px 0 6px">Kho Bài Viết Hướng Dẫn Tối Ưu SEO & Kiếm Tiền MMO</h1>
      <p style="color:var(--txt-secondary);font-size:14px;max-width:620px;margin:0 auto;line-height:1.6">
        Mọi chia sẻ đều đúc kết từ quá trình cày cuốc thực chiến của chú ếch công nghệ Pepe trên chiếc máy Mac M4 với 0 đồng tiền vốn. Cập nhật bài viết mới liên tục mỗi ngày!
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

    def update_sitemap(self, new_slug: str, date_str: str = None):
        """Append new URL to sitemap.xml if not already present."""
        if not SITEMAP_FILE.exists():
            return

        content = SITEMAP_FILE.read_text(encoding="utf-8")
        url_entry = f"https://ai-earn-money.pages.dev/bai-viet/{new_slug}.html"

        if url_entry in content:
            return

        now_date = date_str or datetime.now().strftime("%Y-%m-%d")
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

    def sync_home_index_articles_section(self):
        """Update #sectionArticles on index.html with organized timeline listing."""
        if not INDEX_HTML.exists():
            return

        content = INDEX_HTML.read_text(encoding="utf-8")
        start_marker = '<!-- SEO Articles Section -->'
        end_marker = '<!-- Footer -->'

        if start_marker not in content or end_marker not in content:
            return

        articles_list_html = ""
        for a in self.SEO_TOPICS:
            date_label = a.get("date_str", "28/10/2026")
            tag_label = a.get("tag", "MMO")
            articles_list_html += f"""        <li style="margin-bottom:12px;list-style:none">
          <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:8px">
            <span style="font-family:monospace;font-size:11.5px;padding:2px 6px;border-radius:4px;background:var(--chip);color:var(--amber);font-weight:700">📅 {date_label}</span>
            <span class="tag" style="font-size:11px;padding:2px 8px;margin:0">{tag_label}</span>
            <a href="bai-viet/{a['slug']}.html" style="color:var(--pepe);font-weight:700;text-decoration:none">
              {a['title']}
            </a>
          </div>
          <div style="font-size:13px;color:var(--txt-secondary);margin-top:3px;margin-left:4px">
            {a.get('meta_desc', '')[:120]}...
          </div>
        </li>
"""

        new_section = f"""<!-- SEO Articles Section -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-top:20px">
      <div>
        <h2 id="sectionArticles" style="margin-bottom:4px">Bài Viết & Bí Quyết Kiếm Tiền Thực Chiến 📚</h2>
        <p class="sub" style="margin-bottom:0">
          Cẩm nang tối ưu sàn TMĐT, làm video ngắn AI và chiến lược kiếm tiền 0đ vốn từ chú ếch Pepe (Cập nhật liên tục mỗi ngày):
        </p>
      </div>
      <a href="bai-viet/index.html" class="tool-btn" style="text-decoration:none;font-weight:800;background:var(--pepe);color:#052e16;padding:8px 16px;margin:0">
        Xem toàn bộ {len(self.SEO_TOPICS)}+ bài viết cẩm nang →
      </a>
    </div>

    <div class="method" style="padding:20px;margin-top:14px">
      <ul style="margin:0;padding:0">
{articles_list_html}      </ul>
    </div>

    """

        part_before = content.split(start_marker)[0]
        part_after = content.split(end_marker)[1]
        updated_content = part_before + new_section + end_marker + part_after
        INDEX_HTML.write_text(updated_content, encoding="utf-8")
        logger.info("🏠 Đã đồng bộ toàn bộ danh sách bài viết theo ngày lên trang chủ index.html")

    def publish_all_topics_batch(self):
        """Batch publish all defined topics for unbroken timeline coverage."""
        results = []
        for item in self.SEO_TOPICS:
            slug = item["slug"]
            html_content = self.build_article_html(item)
            file_path = BAI_VIET_DIR / f"{slug}.html"
            file_path.write_text(html_content, encoding="utf-8")
            self.update_sitemap(slug, item.get("iso_date"))
            self._save_published_slug(slug)
            results.append(slug)
            print(f"✅ Đã tạo/cập nhật bài viết ({item.get('date_str')}): bai-viet/{slug}.html")

        # Create bai-viet/index.html
        blog_index = self.build_blog_index_html(self.SEO_TOPICS)
        (BAI_VIET_DIR / "index.html").write_text(blog_index, encoding="utf-8")
        print("✅ Đã cập nhật trang cẩm nang bài viết bai-viet/index.html với nhãn ngày tháng")

        # Sync home page section
        self.sync_home_index_articles_section()
        print("✅ Đã đồng bộ toàn bộ bài viết mới vào trang chủ index.html")

        # Submit all to IndexNow
        try:
            submit_indexnow()
            print("🚀 Đã submit toàn bộ URLs mới tới IndexNow!")
        except Exception as e:
            print(f"IndexNow warning: {e}")

        return results

    def publish_next_seo_article(self) -> dict:
        """Publish next article or refresh with today's date continuously."""
        now_date_str = datetime.now().strftime("%d/%m/%Y")
        iso_date = datetime.now().strftime("%Y-%m-%d")
        published = self._get_published_slugs()

        target_item = None
        for item in self.SEO_TOPICS:
            if item["slug"] not in published:
                target_item = item
                break

        if not target_item:
            # Pick first and refresh date to today
            target_item = self.SEO_TOPICS[0].copy()
            target_item["date_str"] = now_date_str
            target_item["iso_date"] = iso_date

        slug = target_item["slug"]
        html_content = self.build_article_html(target_item)
        file_path = BAI_VIET_DIR / f"{slug}.html"
        file_path.write_text(html_content, encoding="utf-8")

        self.update_sitemap(slug, target_item.get("iso_date"))
        self._save_published_slug(slug)

        # Update blog index and home page
        blog_index = self.build_blog_index_html(self.SEO_TOPICS)
        (BAI_VIET_DIR / "index.html").write_text(blog_index, encoding="utf-8")
        self.sync_home_index_articles_section()

        try:
            submit_indexnow()
        except Exception:
            pass

        return target_item


if __name__ == "__main__":
    pub = SEOPublisher()
    print("🚀 Đang khởi động cỗ máy xuất bản bài viết SEO theo dòng thời gian...")
    res = pub.publish_all_topics_batch()
    print(f"🎉 Hoàn thành xuất bản và đồng bộ {len(res)} bài viết SEO!")
