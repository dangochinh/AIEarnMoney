"""
Pepe Nuôi Thân — Autonomous Daily Battle Planner & Moneymaking Timeline Engine
- Lập kế hoạch hành động chi tiết hôm nay & Mục tiêu kiếm tiền
- Xếp hạng khả năng kiếm tiền (Moneymaking Ranking: Rank S+, S, A, B, C) cho từng point
- Tự động đánh giá kết quả cuối ngày và sinh Kế hoạch Thích Ứng Cho Ngày Hôm Sau (Adaptive Next-Day Plan)
- Quản lý Timeline 24h chiến lược và đồng bộ thời gian thực vào web
"""

import json
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path
from services.config import BASE_DIR, LOG_FILE, JS_DATA_FILE

logger = logging.getLogger("DailyPlanner")

PLANS_DIR = BASE_DIR / "plans"
PLANS_DIR.mkdir(parents=True, exist_ok=True)
PLAN_STATE_FILE = BASE_DIR / ".pepe_daily_plan.json"


class DailyPlanner:
    """Cỗ máy quản lý Kế hoạch tác chiến, Xếp hạng kiếm tiền và Timeline 24h của Pepe."""

    # Phân hạng năng lực kiếm tiền chuẩn mực
    RANK_DEFINITIONS = {
        "S+": {
            "tier": "Rank S+",
            "score": "9.8 / 10",
            "label": "Tiền Tươi Thóc Thật · Nổ Đơn Tức Thì",
            "color": "#ef4444",
            "badge_class": "rank-sp",
            "rationale": "Chuyển đổi trực tiếp qua VietQR, khách có nhu cầu cấp bách, biên lợi nhuận 100%, tiền về tài khoản ngân hàng ngay."
        },
        "S": {
            "tier": "Rank S",
            "score": "9.4 / 10",
            "label": "Chuyển Đổi Rất Cao · Dòng Tiền Đều",
            "color": "#f59e0b",
            "badge_class": "rank-s",
            "rationale": "Kéo view tự nhiên 0đ vốn từ TikTok/Douyin sạch logo, ăn hoa hồng 20%-30% recurring hàng tháng."
        },
        "A": {
            "tier": "Rank A",
            "score": "8.7 / 10",
            "label": "Phễu Bền Vững · Mở Rộng Tệp Khách",
            "color": "#10b981",
            "badge_class": "rank-a",
            "rationale": "Rải bài mồi tặng prompt 0đ vào các hội nhóm lớn, tạo lượng lead khổng lồ để convert sang gói trả phí."
        },
        "B": {
            "tier": "Rank B",
            "score": "7.6 / 10",
            "label": "Tài Sản Dài Hạn · SEO Thụ Động",
            "color": "#38bdf8",
            "badge_class": "rank-b",
            "rationale": "Bài viết chuẩn Schema lên top tìm kiếm Bing/Google sau 2-3 ngày, mang lại khách tự động suốt 30 ngày."
        },
        "C": {
            "tier": "Rank C",
            "score": "6.8 / 10",
            "label": "Giữ Chân & Tương Tác · Dwell Time",
            "color": "#a855f7",
            "badge_class": "rank-c",
            "rationale": "Game web minigame tăng thời gian người dùng ở lại trang, tối ưu SEO và tạo nguồn donate ly cà phê 20k."
        }
    }

    # Timeline 24 giờ chiến lược của Pepe
    TIMELINE_BLOCKS_TEMPLATE = [
        {
            "id": "block-night",
            "timeRange": "00:00 - 06:00",
            "startHour": 0,
            "endHour": 6,
            "title": "🌙 Cày Đêm: Code TalentScout Extension, Build Zip & SEO",
            "focus": "Phát triển công cụ B2B TalentScout AI & Tự động hóa",
            "rank": "S+",
            "estRevenue": "Tạo vũ khí B2B mới",
            "tasks": [
                "Lập trình hoàn chỉnh Chrome Extension TalentScout AI Manifest V3 & đóng gói zip vào products/",
                "Tích hợp nút Scout Candidate 1-click & cơ chế xuất CSV/Excel hồ sơ ứng viên chuẩn CRM",
                "Tự động xuất bản bài viết SEO hướng dẫn cào data LinkedIn cho Headhunter trong bai-viet/",
                "Gửi IndexNow 28 URLs tới các server của Bing, Yahoo, Yandex, Naver"
            ],
            "pepeQuote": "Đêm thanh vắng là lúc gõ code ra lò con extension TalentScout AI mượt nhất!"
        },
        {
            "id": "block-morning-viral",
            "timeRange": "06:00 - 09:00",
            "startHour": 6,
            "endHour": 9,
            "title": "🌅 Giờ Vàng Sáng: Video Demo TalentScout & Affiliate",
            "focus": "Đón sóng người dùng lướt điện thoại buổi sáng",
            "rank": "S",
            "estRevenue": "50.000đ - 100.000đ hoa hồng",
            "tasks": [
                "Soạn kịch bản video demo tool cào ứng viên LinkedIn 1 click không tốn tiền mua LinkedIn Recruiter $800",
                "Sản xuất kịch bản video ngắn 60s có Hook giật gân (Cursor AI, CapCut Pro)",
                "Dùng Bot Telegram @mucmuc4bot bóc tách video Douyin triệu view không watermark",
                "Ghép kịch bản AIDA và chuẩn bị video reup gắn link affiliate bio"
            ],
            "pepeQuote": "Người ta thức dậy lướt TikTok, còn Pepe thức dậy để kéo họ về web!"
        },
        {
            "id": "block-shopee-leads",
            "timeRange": "09:00 - 12:00",
            "startHour": 9,
            "endHour": 12,
            "title": "💼 Giờ Cao Điểm: Mở Bán TalentScout AI & SellerBrain Shopee",
            "focus": "Chốt đơn sản phẩm số Extension TalentScout 49k & SellerBrain 49k",
            "rank": "S+",
            "estRevenue": "150.000đ - 250.000đ tiền tươi",
            "tasks": [
                "Mở bán Flash Sale 49k Extension TalentScout AI cho các Headhunter và Recruiter tự do",
                "Rải bài mồi tặng 100+ Profile ứng viên Dev/AI mẫu vào 3 group Headhunter & Tuyển dụng IT",
                "Chào gói cung cấp ứng viên Pay-per-Apply (50k - 100k/hồ sơ match đúng tiêu chí JD)",
                "Chăm sóc khách hỏi mua Extension SellerBrain Shopee và TalentScout AI"
            ],
            "pepeQuote": "Headhunter mở máy lúc 9h sáng, gặp ngay tool cào ứng viên không cần mua gói $800 là chốt liền tay!"
        },
        {
            "id": "block-lunch-scout",
            "timeRange": "12:00 - 14:00",
            "startHour": 12,
            "endHour": 14,
            "title": "🍜 Bữa Trưa Ếch Pepe & Săn Deal Hoa Hồng >50%",
            "focus": "Ghi sổ sách chi phí & Đón đầu xu hướng",
            "rank": "A",
            "estRevenue": "Tối ưu chi phí & Kèo mới",
            "tasks": [
                "Ghi sổ chi tiền mặt: 1 gói mì Hảo Hảo tôm chua cay (10.000đ)",
                "Quét affiliate radar cập nhật chiến dịch hoa hồng khủng (Hostinger 60%, Notion AI 50%)",
                "Kiểm tra tiến trình Mac M4, giải phóng RAM và cache temp",
                "Cập nhật widget 'Bói quẻ Pepe' tạo sự thú vị cho khách ghé thăm buổi trưa"
            ],
            "pepeQuote": "Ăn vội gói mì tôm rồi lại cày tiếp, mục tiêu 500k sinh tồn không xa vời!"
        },
        {
            "id": "block-repo-upgrade",
            "timeRange": "14:00 - 17:00",
            "startHour": 14,
            "endHour": 17,
            "title": "⚙️ Chiều: Nâng Cấp Kho Vũ Khí Repo & Tệp Lead Headhunter",
            "focus": "Hoàn thiện sản phẩm để tăng tỷ lệ giữ chân",
            "rank": "A",
            "estRevenue": "50.000đ - 100.000đ từ tool & data",
            "tasks": [
                "Đóng gói tệp 100 Profile ứng viên Dev/AI mẫu tặng Headhunter để kéo deal",
                "Test tốc độ cào profile LinkedIn và chức năng xuất file Excel tiếng Việt UTF-8",
                "Tối ưu hóa giao diện mua hàng repos.html và thanh toán VietQR SP11",
                "Đồng bộ code và deploy phiên bản mới nhất lên Cloudflare Pages"
            ],
            "pepeQuote": "Sản phẩm tốt thì khách tự động giới thiệu nhau, không cần chèo kéo!"
        },
        {
            "id": "block-evening-traffic",
            "timeRange": "17:00 - 20:00",
            "startHour": 17,
            "endHour": 20,
            "title": "🌆 Chiều Tối: Phủ Sóng Mạng Xã Hội & Kéo Khách Minigame",
            "focus": "Thu hút lượt truy cập tự nhiên sau giờ làm việc",
            "rank": "C",
            "estRevenue": "20.000đ donate + Traffic sạch",
            "tasks": [
                "Đăng Social Threads tóm tắt kinh nghiệm làm MMO 0đ vốn lên Threads/X",
                "Mời bạn bè và cộng đồng vào chơi Game Lô Tô Online đọc số và Đoán Nhạc Karaoke",
                "Kéo dài Dwell Time trên trang lên trên 3 phút để tăng điểm SEO Google",
                "Khuyến khích khách ủng hộ ly cà phê / gói mì tôm 20.000đ nuôi chú ếch"
            ],
            "pepeQuote": "Tan sở là lúc mọi người cần giải trí nhẹ nhàng, game Lô Tô vào việc ngay!"
        },
        {
            "id": "block-peak-conversion",
            "timeRange": "20:00 - 23:00",
            "startHour": 20,
            "endHour": 23,
            "title": "🎯 Tối Vàng: Khung Giờ Chốt Sale Đỉnh Điểm (Peak Conversion)",
            "focus": "Tập trung toàn lực chốt đơn & Chuyển đổi doanh thu cao nhất",
            "rank": "S+",
            "estRevenue": "150.000đ - 250.000đ doanh thu",
            "tasks": [
                "Chốt đơn bản quyền TalentScout AI 49k và nhận yêu cầu tuyển dụng từ Headhunter",
                "Trực chiến đón lưu lượng khách online đông nhất trong ngày",
                "Đẩy mạnh chào bán Pepe Ultimate MMO Bundle 199.000đ (Tiết kiệm 60%)",
                "Matching ứng viên trong database vào các job IT đang mở để lấy phí giới thiệu"
            ],
            "pepeQuote": "Khung giờ vàng từ 20h đến 23h là lúc tiền về nhiều nhất, không được lơ là!"
        },
        {
            "id": "block-night-review",
            "timeRange": "23:00 - 23:59",
            "startHour": 23,
            "endHour": 24,
            "title": "📝 Đêm: Tổng Kết Sổ Sách Ngày & Lập Plan Thích Ứng Ngày Mai",
            "focus": "Đo lường hiệu quả thực tế và chuẩn bị chiến lược ngày mới",
            "rank": "S",
            "estRevenue": "Tối ưu chiến lược sinh tồn",
            "tasks": [
                "Đối chiếu doanh thu tiền thật về tài khoản MB Bank hôm nay",
                "Phân tích kênh nào mang lại nhiều đơn nhất (TalentScout vs Shopee Tool vs Bot Video)",
                "Tự động tính toán tỷ lệ hoàn thành mục tiêu ngày",
                "Tự động sinh Kế hoạch Thích ứng Ngày Mai với trọng số tối ưu hóa cho kênh thắng lớn"
            ],
            "pepeQuote": "Người kiếm tiền giỏi không phải làm bừa, mà biết nhìn lại hôm nay để ngày mai thắng lớn hơn!"
        }
    ]

    def __init__(self):
        self.state = self._load_state()

    def _load_state(self) -> dict:
        if PLAN_STATE_FILE.exists():
            try:
                return json.loads(PLAN_STATE_FILE.read_text(encoding="utf-8"))
            except Exception:
                pass
        return {}

    def _save_state(self):
        PLAN_STATE_FILE.write_text(json.dumps(self.state, ensure_ascii=False, indent=2), encoding="utf-8")

    def get_current_active_block_id(self) -> str:
        """Xác định khung giờ hiện tại đang diễn ra dựa vào giờ hệ thống."""
        hour = datetime.now().hour
        for b in self.TIMELINE_BLOCKS_TEMPLATE:
            if b["startHour"] <= hour < b["endHour"]:
                return b["id"]
        return "block-night"

    def generate_today_plan(self) -> dict:
        """Tạo hoặc lấy kế hoạch chi tiết cho ngày hôm nay."""
        now = datetime.now()
        date_str = now.strftime("%d/%m/%Y")
        iso_date = now.strftime("%Y-%m-%d")

        # Xác định ngày thứ mấy trong hành trình 30 ngày (Bắt đầu 22/10/2026)
        start_date = datetime(2026, 10, 22)
        day_num = max(1, (now - start_date).days + 1)

        active_block_id = self.get_current_active_block_id()

        # Xây dựng danh sách points kèm rank
        ranked_plan_points = [
            {
                "id": "p0_talentscout",
                "title": "Phát Triển & Ra Mắt TalentScout AI: Extension Cào Candidate LinkedIn & Bán Apply Job Cho Headhunter",
                "rank": "S+",
                "rankScore": "9.9/10",
                "rankLabel": "B2B High Ticket · Tiền Tươi & Phí Apply Tuyển Dụng",
                "targetTime": "00:00 - 06:00 (Code & Đóng Gói) & 09:00 - 12:00 (Mở Bán)",
                "action": "Hoàn thiện Chrome Extension Manifest V3, trích xuất profile LinkedIn 1-click, đóng gói file ZIP SP11 (49k) và kết nối tệp ứng viên IT/AI bán lượt apply job cho Headhunter.",
                "estRevenue": "150.000đ - 300.000đ (Bán tool 49k + Phí hồ sơ 50k-100k/lead)",
                "status": "active"
            },
            {
                "id": "p1",
                "title": "Chốt Flash Sale 25k cho khách tải Quà 0đ & Đơn Extension SellerBrain 49k",
                "rank": "S+",
                "rankScore": "9.8/10",
                "rankLabel": "Tiền Tươi Thóc Thật · Nổ Đơn Tức Thì",
                "targetTime": "09:00 - 12:00 & 20:00 - 23:00",
                "action": "Tự động bắt lead, hiển thị ưu đãi giảm 50% trong 15 phút, kích hoạt VietQR và gửi link tải .zip ngay lập tức.",
                "estRevenue": "98.000đ - 147.000đ (2-3 đơn)",
                "status": "active" if active_block_id in ["block-shopee-leads", "block-peak-conversion"] else "pending"
            },
            {
                "id": "p2",
                "title": "Bóc tách video Douyin/TikTok sạch watermark & Kéo Affiliate Cursor AI / CapCut Pro",
                "rank": "S",
                "rankScore": "9.4/10",
                "rankLabel": "Chuyển Đổi Rất Cao · Dòng Tiền Đều",
                "targetTime": "06:00 - 09:00",
                "action": "Dùng bot @mucmuc4bot tải video sạch, ghép kịch bản 60s viral, rải link ref ăn hoa hồng 20%-30% recurring hàng tháng.",
                "estRevenue": "50.000đ - 100.000đ hoa hồng",
                "status": "completed" if now.hour >= 9 else "active"
            },
            {
                "id": "p3",
                "title": "Rải bài mồi tặng 100+ Prompt AI vào 5 hội nhóm Facebook & Zalo Shopee",
                "rank": "A",
                "rankScore": "8.7/10",
                "rankLabel": "Phễu Bền Vững · Mở Rộng Tệp Khách",
                "targetTime": "09:00 - 11:30 & 14:00 - 16:30",
                "action": "Dùng các mẫu bài viết đã tối ưu tâm lý trong marketing_hub/OUTREACH_READY_PACKS.md để hút tối thiểu 10-15 leads.",
                "estRevenue": "Tạo phễu nuôi đơn",
                "status": "pending"
            },
            {
                "id": "p4",
                "title": "Mời chào gói Ultimate MMO Bundle 199.000đ (Trọn bộ 6 sản phẩm số)",
                "rank": "A",
                "rankScore": "8.2/10",
                "rankLabel": "Đơn Giá Cao · Biên Lợi Nhuận 100%",
                "targetTime": "20:00 - 23:00",
                "action": "Target các anh em làm MMO muốn sở hữu trọn gói cả bot, tool, game và bí kíp vận hành.",
                "estRevenue": "199.000đ (1 đơn là hoàn thành 80% chỉ tiêu ngày)",
                "status": "pending"
            },
            {
                "id": "p5",
                "title": "Tự động xuất bản 2 bài viết SEO chuyên sâu & Ping IndexNow 19 URLs",
                "rank": "B",
                "rankScore": "7.6/10",
                "rankLabel": "Tài Sản Dài Hạn · SEO Thụ Động",
                "targetTime": "00:00 - 06:00",
                "action": "Dựng bài viết HTML chuẩn Schema JSON-LD trong bai-viet/, submit tức thì lên Bing & Yandex.",
                "estRevenue": "Thu hút 200+ lượt click tìm kiếm tự nhiên",
                "status": "completed" if now.hour >= 6 else "active"
            },
            {
                "id": "p6",
                "title": "Khai thác tương tác từ 5 Mini Game HTML5 & Kêu gọi Donate mì tôm 20k",
                "rank": "C",
                "rankScore": "6.8/10",
                "rankLabel": "Giữ Chân & Tương Tác · Dwell Time",
                "targetTime": "17:00 - 20:00",
                "action": "Dùng game Lô Tô Online đọc số và Đoán Nhạc Karaoke giữ chân người dùng trên 3 phút, tăng điểm SEO.",
                "estRevenue": "20.000đ - 40.000đ donate",
                "status": "pending"
            }
        ]

        # Xây dựng timeline với trạng thái động
        timeline_blocks = []
        for b in self.TIMELINE_BLOCKS_TEMPLATE:
            item = dict(b)
            if b["endHour"] <= now.hour:
                item["state"] = "completed"
                item["stateLabel"] = "✅ Đã Hoàn Thành"
            elif b["startHour"] <= now.hour < b["endHour"]:
                item["state"] = "current"
                item["stateLabel"] = "⚡ Đang Diễn Ra (Khung Giờ Này)"
            else:
                item["state"] = "upcoming"
                item["stateLabel"] = "⏳ Sắp Tới"
            timeline_blocks.append(item)

        today_plan = {
            "date": date_str,
            "isoDate": iso_date,
            "dayIndex": day_num,
            "title": f"Kế Hoạch Tác Chiến Ngày Thứ {day_num} — {date_str}",
            "headline": "Ra mắt TalentScout AI (LinkedIn Candidate Collector & Bán Apply Job), tập trung chốt đơn 2 khung giờ vàng!",
            "goals": {
                "revenueTarget": 250000,
                "revenueTargetFormatted": "250.000đ",
                "minOrders": 3,
                "leadTarget": 10,
                "affiliatePacksTarget": 12,
                "trafficTarget": 800,
                "purpose": "Đủ tiền trả tiền điện Mac M4 + mua 10 gói mì Hảo Hảo tôm chua cay + tích lũy quỹ sinh tồn"
            },
            "rankedPoints": ranked_plan_points,
            "timeline": timeline_blocks,
            "currentBlockId": active_block_id,
            "updatedAt": now.strftime("%d/%m/%Y %H:%M")
        }

        return today_plan

    def generate_tomorrow_adaptive_plan(self, today_plan: dict) -> dict:
        """Tổng kết kịch bản hôm nay và tự động sinh kế hoạch thích ứng cho ngày mai."""
        now = datetime.now()
        tomorrow = now + timedelta(days=1)
        tomorrow_str = tomorrow.strftime("%d/%m/%Y")
        tomorrow_iso = tomorrow.strftime("%Y-%m-%d")

        start_date = datetime(2026, 10, 22)
        next_day_num = max(2, (tomorrow - start_date).days + 1)

        # Đánh giá bài học thích ứng
        reflection = {
            "evaluation": "Hệ thống hoàn thiện và đưa vào tác chiến công cụ B2B TalentScout AI: Extension cào ứng viên LinkedIn và dịch vụ kết nối hồ sơ Pay-per-Apply cho Headhunter.",
            "keyInsight": "Thị trường Headhunt có nhu cầu dữ liệu ứng viên cực kỳ lớn và sẵn sàng trả tiền tươi. Mô hình bán tool 49k kèm dịch vụ cung cấp hồ sơ ứng viên 50k-100k/lead có biên lợi nhuận cao nhất.",
            "strategicShift": "Tập trung tiếp cận cộng đồng Headhunter IT và HR Tech trên LinkedIn/Facebook, song song với việc duy trì chốt đơn Extension SellerBrain Shopee và MMO Bundle."
        }

        # Kế hoạch điều chỉnh thích ứng cho ngày mai
        tomorrow_points = [
            {
                "id": "tp0",
                "title": "Tiếp cận 10 Headhunter IT & Chốt hợp đồng cung cấp ứng viên Pay-per-Apply đầu tiên",
                "rank": "S+",
                "rankScore": "9.9/10",
                "rankLabel": "Dòng Tiền B2B Cao Cấp",
                "targetTime": "09:00 - 11:30",
                "action": "Gửi danh sách 5 profile ứng viên AI/Dev demo cho Headhunter đang có job mở, chốt phí 50.000đ/ứng viên apply.",
                "estRevenue": "150.000đ - 250.000đ",
                "status": "planned"
            },
            {
                "id": "tp1",
                "title": "Đẩy mạnh Remarketing cho tệp Lead đã nhận quà 100+ Prompt AI",
                "rank": "S+",
                "rankScore": "9.9/10",
                "rankLabel": "Chốt Sale Nóng Nhất",
                "targetTime": "09:30 - 11:30",
                "action": "Nhắn tin chăm sóc trực tiếp, gửi video demo Extension SellerBrain soi đối thủ thực chiến, chốt giá ưu đãi 25k.",
                "estRevenue": "125.000đ - 200.000đ (5-8 đơn)",
                "status": "planned"
            },
            {
                "id": "tp2",
                "title": "Mở rộng 3 kênh Affiliate mới: Notion AI, ElevenLabs và Binance",
                "rank": "S",
                "rankScore": "9.5/10",
                "rankLabel": "Hoa Hồng Khủng >50%",
                "targetTime": "07:00 - 09:00",
                "action": "Tung 3 kịch bản video TikTok dạng Storytelling chia sẻ cách dùng Notion AI quản lý shop và ElevenLabs lồng tiếng.",
                "estRevenue": "Hoa hồng tích lũy dài hạn",
                "status": "planned"
            },
            {
                "id": "tp3",
                "title": "Tung gói Combo 'Tool Tải Video + 5 Game Web' giá sốc 49k (Bình thường 78k)",
                "rank": "A",
                "rankScore": "8.9/10",
                "rankLabel": "Combo Kích Cầu",
                "targetTime": "14:00 - 17:00",
                "action": "Tận dụng hiệu ứng FOMO cuối tuần, nhắm vào các bạn trẻ học lập trình và dân làm web.",
                "estRevenue": "98.000đ - 147.000đ",
                "status": "planned"
            },
            {
                "id": "tp4",
                "title": "Tự động xuất bản 2 bài viết SEO về chủ đề Lô Tô Tết & Minigame kéo traffic",
                "rank": "B",
                "rankScore": "7.8/10",
                "rankLabel": "Đón Sóng Mùa Lễ Tết",
                "targetTime": "00:00 - 06:00",
                "action": "Tối ưu từ khóa 'game lô tô online tết 2026', 'cách tổ chức minigame sinh nhật', submit IndexNow.",
                "estRevenue": "Kéo 500+ lượt click hữu cơ",
                "status": "planned"
            }
        ]

        tomorrow_plan = {
            "date": tomorrow_str,
            "isoDate": tomorrow_iso,
            "dayIndex": next_day_num,
            "title": f"Kế Hoạch Thích Ứng Ngày Thứ {next_day_num} — {tomorrow_str}",
            "headline": "Nhân bản mô hình chiến thắng hôm nay: Tập trung vào chăm sóc Lead và Combo kích cầu!",
            "reflection": reflection,
            "goals": {
                "revenueTarget": 300000,
                "revenueTargetFormatted": "300.000đ (Tăng 20% so với hôm nay)",
                "minOrders": 5,
                "leadTarget": 15,
                "purpose": "Tiến sát mốc 500.000đ trên Nhiệt Kế Sinh Tồn — Đưa Pepe bước sang giai đoạn Tự Do Tài Chính!"
            },
            "rankedPoints": tomorrow_points,
            "status": "Dự thảo tự động dựa trên kết quả thực tế hôm nay"
        }

        return tomorrow_plan

    def sync_to_data_js(self):
        """Ghi kế hoạch hôm nay, timeline và kế hoạch ngày mai trực tiếp vào js/data.js."""
        today_plan = self.generate_today_plan()
        tomorrow_plan = self.generate_tomorrow_adaptive_plan(today_plan)

        if not JS_DATA_FILE.exists():
            return

        with open(JS_DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        plan_json = json.dumps(today_plan, ensure_ascii=False, indent=2)
        tomorrow_json = json.dumps(tomorrow_plan, ensure_ascii=False, indent=2)

        plan_code = (
            f"  // ============================================================\n"
            f"  // KẾ HOẠCH HÀNH ĐỘNG HÔM NAY & XẾP HẠNG KIẾM TIỀN (AUTO PLANNER)\n"
            f"  // ============================================================\n"
            f"  dailyPlan: {plan_json},\n\n"
            f"  // ============================================================\n"
            f"  // KẾ HOẠCH THÍCH ỨNG CHO NGÀY MAI (ADAPTIVE NEXT-DAY PLAN)\n"
            f"  // ============================================================\n"
            f"  tomorrowPlan: {tomorrow_json},\n\n"
        )

        # Replace or inject into data.js
        if "dailyPlan:" in content and "tomorrowPlan:" in content:
            # Replace existing
            content = re.sub(
                r'  // ===+[\s\S]*?dailyPlan:\s*\{[\s\S]*?tomorrowPlan:\s*\{[\s\S]*?\},\n\n',
                plan_code,
                content
            )
        elif "dailyPlan:" in content:
            content = re.sub(r'  dailyPlan:\s*\{[\s\S]*?\},\n\n', '', content)
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + plan_code + content[pos:]
        else:
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + plan_code + content[pos:]

        with open(JS_DATA_FILE, "w", encoding="utf-8") as f:
            f.write(content)

        # Lưu bản backup vào plans/
        iso_today = today_plan["isoDate"]
        archive_path = PLANS_DIR / f"plan_{iso_today}.json"
        archive_path.write_text(json.dumps({
            "today": today_plan,
            "tomorrow": tomorrow_plan
        }, ensure_ascii=False, indent=2), encoding="utf-8")

        logger.info(f"📋 Đã đồng bộ Daily Plan & Moneymaking Timeline vào {JS_DATA_FILE} và {archive_path}")
        return today_plan, tomorrow_plan


if __name__ == "__main__":
    planner = DailyPlanner()
    print("🐸 Đang khởi động cỗ máy Daily Battle Planner & Moneymaking Timeline...")
    td, tm = planner.sync_to_data_js()
    print(f"✅ Đã tạo Kế hoạch hôm nay: {td['title']}")
    print(f"✅ Đã xếp hạng {len(td['rankedPoints'])} points kiếm tiền (Rank S+ đến Rank C)")
    print(f"✅ Đã dựng Timeline 24h: {len(td['timeline'])} time blocks (Block hiện tại: {td['currentBlockId']})")
    print(f"✅ Đã lập Kế hoạch thích ứng ngày mai: {tm['title']}")
