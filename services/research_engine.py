"""
Pepe Nuôi Thân — Autonomous Market & Tech Research Engine
Tự động tìm kiếm thư viện, công nghệ và thị trường thương mại điện tử
"""

import json
import random
import re
from datetime import datetime
from pathlib import Path
from services.config import SELLERBRAIN_SCRAPER_DIR, STATE_FILE

# Kho chủ đề công nghệ thực chiến có thể đóng gói bán hoặc làm dịch vụ
TECH_RESEARCH_TOPICS = [
    {
        "name": "bwip-js",
        "category": "Mã vạch & QR nâng cao",
        "summary": "thư viện tạo mã vạch và QR code chạy trực tiếp trên trình duyệt hoặc Node.js, hỗ trợ hơn 100 định dạng mã khác nhau (GS1-128, Data Matrix, PDF417, Aztec, QR, Code 128) với chất lượng in ấn vector sắc nét.",
        "usage": "nhúng bwip-js qua CDN, gọi bwipjs.toCanvas('myCanvas', {bcid: 'qrcode', text: 'https://ai-earn-money.pages.dev', scale: 3, height: 10, includetext: true}); hỗ trợ xuất canvas, SVG hoặc base64 ảnh PNG ngay lập tức.",
        "license": "MIT",
        "notes": "muốn in phiếu gửi hàng hoặc tem nhãn thì render ra thẻ SVG để tránh vỡ nét khi phóng to; Data Matrix rất hợp cho tem linh kiện nhỏ xíu.",
        "commercial_plan": "khi nhận làm web bán hàng hoặc tool in đơn Shopee cho khách, tôi sẽ dùng bwip-js để in mã vận đơn và mã QR thanh toán tự động, thu phí combo 49k/bộ template."
    },
    {
        "name": "xlsx (SheetJS)",
        "category": "Xử lý file Excel bảng tính",
        "summary": "thư viện đọc và ghi file Excel (.xlsx, .xls, .csv) hoàn toàn trên trình duyệt, không cần máy chủ Python hay server đắt tiền — khách tải file lên là phân tích số liệu ngay tức thì.",
        "usage": "đọc file bằng const workbook = XLSX.read(await file.arrayBuffer()); lấy sheet đầu tiên bằng XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]); xuất file mới bằng XLSX.writeFile(newWb, 'baocao.xlsx').",
        "license": "Apache 2.0",
        "notes": "bản cộng đồng trên npm đủ dùng cho hầu hết tác vụ đọc ghi bảng tính; tránh nạp file Excel dung lượng trên 50MB trực tiếp kẻo đơ tab trình duyệt của khách.",
        "commercial_plan": "tôi sẽ dựng ngay công cụ 'Soi Báo Cáo Doanh Thu Shopee 1-Click' chạy trực tiếp trên web, khách tải file Excel báo cáo đơn hàng lên là Pepe tính ngay lãi ròng, phí sàn và số tồn kho."
    },
    {
        "name": "fabric.js",
        "category": "Canvas đồ họa kéo thả",
        "summary": "thư viện quản lý đối tượng trên HTML5 Canvas mạnh mẽ nhất — biến canvas thông thường thành trình thiết kế ảnh như Canva mini: kéo thả, xoay ảnh, thêm chữ, đổi màu viền, xuất ảnh độ phân giải cao.",
        "usage": "khởi tạo const canvas = new fabric.Canvas('c'); thêm ảnh sản phẩm fabric.Image.fromURL(url, img => canvas.add(img)); thêm chữ khung giảm giá new fabric.Text('GIẢM 50%', {fill: '#ef4444', fontWeight: 'bold'}); canvas.toDataURL({format: 'png', quality: 1}).",
        "license": "MIT",
        "notes": "cần xử lý CORS hình ảnh bằng crossOrigin = 'anonymous' khi load ảnh sản phẩm từ server ngoài; tối ưu kích thước canvas theo đúng tỉ lệ 1:1 của ảnh đại diện Shopee (1024x1024).",
        "commercial_plan": "kết hợp fabric.js với kho khung viền sẵn để làm 'Máy đóng khung ảnh Shopee hàng loạt', bán gói dịch vụ 39.000đ cho chủ shop lười photoshop."
    },
    {
        "name": "jszip",
        "category": "Nén & đóng gói file số",
        "summary": "thư viện tạo, đọc và giải nén file ZIP ngay trên trình duyệt máy khách — nén hàng trăm file tài liệu, ảnh sản phẩm hoặc mã nguồn thành 1 file .zip duy nhất để khách tải về chỉ bằng một nút bấm.",
        "usage": "const zip = new JSZip(); zip.file('huongdan.txt', 'Nội dung hướng dẫn...'); zip.folder('anh_san_pham').file('sp1.png', imgBlob); const content = await zip.generateAsync({type: 'blob'}); saveAs(content, 'combo.zip').",
        "license": "MIT",
        "notes": "kết hợp cùng thư viện FileSaver.js để kích hoạt hộp thoại lưu file tự nhiên trên mọi trình duyệt; khi nén nhiều ảnh nặng nên chia thành từng chunk để giữ giao diện mượt mà.",
        "commercial_plan": "áp dụng ngay vào trang Pepe Nuôi Thân để tự động đóng gói combo prompt + kịch bản + extension thành file ZIP gửi ngay cho khách khi xác nhận thanh toán."
    },
    {
        "name": "howler.js",
        "category": "Âm thanh & Hiệu ứng Web Audio",
        "summary": "thư viện âm thanh chuyên nghiệp chuẩn Web Audio API — giải quyết triệt để lỗi tự động phát âm thanh trên Safari và Chrome mobile, hỗ trợ phát âm thanh 3D, vòng lặp nhạc nền và âm thanh tương tác siêu mượt.",
        "usage": "const sound = new Howl({src: ['sound.webm', 'sound.mp3'], volume: 0.8, autoplay: false}); sound.play(); bắt sự kiện onend để kích hoạt hiệu ứng tiếp theo.",
        "license": "MIT",
        "notes": "trình duyệt hiện đại bắt buộc phải có tương tác chạm (click) của người dùng trước khi phát âm thanh; nên nén âm thanh sang định dạng .webm và .mp3 để tương thích 100% mọi thiết bị.",
        "commercial_plan": "dùng howler.js nâng cấp trải nghiệm cho 2 game mini Chute Sort và Bắn Gà của Pepe, đồng thời làm demo nghe thử giọng đọc AI cho khách trước khi đặt làm video."
    },
    {
        "name": "tesseract.js",
        "category": "Trí tuệ nhân tạo OCR đọc chữ từ ảnh",
        "summary": "bộ engine OCR nhận diện chữ viết trong ảnh chạy hoàn toàn bằng WebAssembly ngay trên máy khách, hỗ trợ hơn 100 ngôn ngữ bao gồm tiếng Việt có dấu, không cần gửi ảnh lên server bảo mật tuyệt đối.",
        "usage": "const worker = await Tesseract.createWorker('vie'); const ret = await worker.recognize(imageFile); console.log(ret.data.text); await worker.terminate();",
        "license": "Apache 2.0",
        "notes": "cần hiện thanh tiến trình (progress bar) vì việc nạp model tiếng Việt mất khoảng 1.5 giây lần đầu; ảnh đầu vào chụp thẳng, độ tương phản cao thì chữ ra chuẩn 98%.",
        "commercial_plan": "tạo tính năng 'Pepe Đọc Hóa Đơn Tự Động' — khách chụp bill chuyển khoản Vietcombank/MB, Pepe đọc mã giao dịch và số tiền để tự động mở khóa đơn hàng trong 1 giây."
    },
    {
        "name": "pica",
        "category": "Tối ưu & nén ảnh chất lượng cao",
        "summary": "thư viện nén và đổi kích thước ảnh hàng đầu trên trình duyệt sử dụng WebAssembly và Web Workers — không làm đơ giao diện, thuật toán Lanczos3 khử răng cưa giúp ảnh sản phẩm sau khi nén vẫn nét căng.",
        "usage": "const pica = new Pica(); await pica.resize(sourceCanvas, targetCanvas, {quality: 3, alpha: true}); const blob = await pica.toBlob(targetCanvas, 'image/jpeg', 0.85);",
        "license": "MIT",
        "notes": "rất thích hợp để chuẩn bị ảnh tải lên Shopee, TikTok Shop vì sàn luôn ép ảnh về kích thước chuẩn; tốc độ nhanh gấp 4 lần so với canvas thông thường nhờ tính toán đa luồng.",
        "commercial_plan": "tích hợp vào công cụ 'Tối Ưu Ảnh Chuẩn Sàn TMĐT' trên web Pepe, giúp chủ shop giảm 70% dung lượng ảnh mà mắt thường không phân biệt được."
    },
    {
        "name": "qrcode-generator & html5-qrcode",
        "category": "Tạo & Quét mã QR hai chiều",
        "summary": "bộ đôi tạo và quét mã QR trực tiếp qua camera điện thoại không cần cài app — khách giơ camera lên là quét mã đơn hàng hoặc mã VietQR thanh toán chỉ trong 0.2 giây.",
        "usage": "const qrScanner = new Html5QrcodeScanner('reader', {fps: 10, qrbox: 250}); qrScanner.render((decodedText) => alert('Mã đơn: ' + decodedText));",
        "license": "Apache 2.0",
        "notes": "bắt buộc trang web phải chạy trên giao thức HTTPS thì trình duyệt mới cấp quyền truy cập camera; thêm đèn flash trợ sáng nếu thiết bị di động hỗ trợ.",
        "commercial_plan": "tôi trang bị ngay tính năng quét camera để khách có thể kiểm tra mã đơn hàng đã cọc mà không cần nhập từng ký tự."
    }
]

# Danh mục nghiên cứu thị trường ngách Shopee & TikTok Shop
ECOMMERCE_NICHES = [
    {
        "niche": "Thời trang công sở & thể thao nam",
        "keywords": ["áo polo nam form rộng", "quần tây nam co giãn", "áo khoác gió 2 lớp chống nước", "tất nam khử mùi nano bạc"],
        "price_sweet_spot": "99.000đ - 189.000đ",
        "pain_point": "khách sợ mua online bị xù lông, form nhỏ hơn thực tế, giao sai màu",
        "hook_strategy": "nhấn mạnh cam kết kiểm tra hàng trước khi nhận, đổi trả trong 15 ngày, chất vải sợi poly dệt tổ ong thoáng khí"
    },
    {
        "niche": "Gia dụng & tiện ích thông minh",
        "keywords": ["máy xay tỏi ớt sạc điện", "kệ để đồ nhà tắm dán tường", "đèn led cảm ứng thông minh", "dụng cụ bóc vỏ tôm siêu tốc"],
        "price_sweet_spot": "39.000đ - 89.000đ",
        "pain_point": "sợ keo dán tường rơi vỡ đồ, sợ máy mini pin yếu xay không nát",
        "hook_strategy": "quay cận cảnh thử thách treo tạ 5kg thử keo dán, quay máy xay tiêu đá bi trong 3 giây"
    },
    {
        "niche": "Phụ kiện công nghệ & setup góc làm việc",
        "keywords": ["bàn di chuột cỡ lớn chống trượt", "giá đỡ điện thoại để bàn kim loại", "hub type-c 6 trong 1 cho macbook", "ống luồn dây điện thông minh"],
        "price_sweet_spot": "49.000đ - 149.000đ",
        "pain_point": "sợ mua nhầm cáp sạc chậm, bàn di chuột bị cong mép và bốc mùi cao su",
        "hook_strategy": "nhắm vào dân văn phòng và coder muốn setup bàn làm việc gọn gàng tăng 200% năng suất"
    }
]


class ResearchEngine:
    def __init__(self):
        self.state_file = STATE_FILE
        self.history = self._load_history()

    def _load_history(self) -> dict:
        if self.state_file.exists():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"researched_topics": [], "last_run": None, "generated_products": 0}

    def _save_history(self):
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)

    def get_next_tech_topic(self) -> dict:
        """Chọn chủ đề công nghệ chưa nghiên cứu hoặc xoay vòng chất lượng cao."""
        already = self.history.get("researched_topics", [])
        candidates = [t for t in TECH_RESEARCH_TOPICS if t["name"] not in already]
        if not candidates:
            # Xoay vòng lại nếu đã nghiên cứu hết
            candidates = TECH_RESEARCH_TOPICS
            self.history["researched_topics"] = []

        chosen = random.choice(candidates)
        self.history["researched_topics"].append(chosen["name"])
        self.history["last_run"] = datetime.now().isoformat()
        self._save_history()
        return chosen

    def get_ecommerce_trend(self) -> dict:
        """Lấy một phân khúc thị trường đang có lượng tìm kiếm lớn."""
        return random.choice(ECOMMERCE_NICHES)

    def analyze_shopee_cache(self) -> list:
        """Đọc dữ liệu từ cache của scraper trong máy nếu có."""
        cache_path = Path(SELLERBRAIN_SCRAPER_DIR) / ".scraper-cache.json"
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    items = sorted(data.items(), key=lambda x: x[1], reverse=True)[:10]
                    return [{"item_id": k, "sold_count": v} for k, v in items]
            except Exception:
                pass
        return []
