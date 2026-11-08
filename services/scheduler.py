"""
Pepe Nuôi Thân — Continuous Multi-Worker Autonomous Engine
Chạy liên tục không idle: Sản xuất Content Affiliate + Đóng gói Sản phẩm số + Deploy Cloudflare & Git
TUYỆT ĐỐI KHÔNG apply profile của anh chủ làm freelance jobs.
"""

import json
import logging
import re
import threading
import time
from datetime import datetime
from services.config import LOG_FILE, JS_DATA_FILE, AFFILIATE_CYCLE_SECONDS, TECH_RESEARCH_CYCLE_SECONDS
from services.research_engine import ResearchEngine
from services.product_engine import ProductEngine
from services.diary_logger import DiaryLogger
from services.deployer import AutoDeployer
from services.affiliate_engine import AffiliateContentEngine
from services.outreach_engine import OutreachEngine
from services.seo_publisher import SEOPublisher
from services.daily_planner import DailyPlanner
from services.telegram_reporter import TelegramReporter
from services.linkedin_scanner import LinkedInCandidateScanner

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)


class ContinuousPepeEngine:
    def __init__(self):
        self.researcher = ResearchEngine()
        self.product_gen = ProductEngine()
        self.diary_logger = DiaryLogger()
        self.deployer = AutoDeployer()
        self.affiliate_engine = AffiliateContentEngine()
        self.outreach_engine = OutreachEngine()
        self.seo_publisher = SEOPublisher()
        self.daily_planner = DailyPlanner()
        self.telegram_reporter = TelegramReporter()
        self.linkedin_scanner = LinkedInCandidateScanner(target_daily=50)
        self._stop_event = threading.Event()

    def run_linkedin_scan_cycle(self) -> dict:
        """Tự động cào 10 - 100 CV ứng viên LinkedIn mỗi ngày cho TalentScout AI."""
        try:
            today_iso = datetime.now().strftime("%Y-%m-%d")
            # Nếu hôm nay chưa quét hoặc chưa đạt chỉ tiêu ngày (50 CV)
            if self.linkedin_scanner.state.get("last_scan_date") != today_iso or self.linkedin_scanner.state.get("today_scanned_count", 0) < 50:
                logging.info("🎯 [Worker: LinkedInScanner] Bắt đầu tự động cào 50 CV IT/AI LinkedIn cho TalentScout AI...")
                res = self.linkedin_scanner.run_daily_scan(count=50)
                logging.info(f"✅ [Worker: LinkedInScanner] Đã hoàn thành scan {res['scanned_count']} CVs mới hôm nay!")
                return res
        except Exception as e:
            logging.warning(f"LinkedIn Scanner cycle error: {e}")
        return {}

    def run_affiliate_content_cycle(self) -> dict:
        """Tự động sản xuất bộ content Affiliate (Video Script, SEO Review, Thread) và ghi nhật ký."""
        logging.info("🎯 [Worker: AffiliateContentEngine] Bắt đầu sản xuất content làm affiliate...")
        bundle = self.affiliate_engine.produce_full_affiliate_bundle()
        camp = bundle["campaign"]

        now_str = datetime.now().strftime("%H:%M")
        line_text = (
            f"Affiliate Radar vừa lên chiến dịch mới: '{camp['name']}' ({camp['category']} · Hoa hồng: {camp['commission']}) — "
            f"Pepe đã tự động xuất bản kịch bản Video ngắn 60s & bài review SEO kèm mã '{camp['discount_code']}' để kéo đơn hoa hồng!"
        )

        new_diary_lines = [{"t": now_str, "x": line_text}]

        # Cập nhật vào data.js (cả nhật ký và mảng affiliateRadar)
        self._update_data_with_affiliate(camp, bundle, new_diary_lines)

        # Deploy cập nhật lên Cloudflare Pages & push GitHub
        self.deployer.commit_and_deploy(
            note=f"Pepe tạo content Affiliate cho {camp['name']} ({camp['commission']})"
        )
        return bundle

    def run_tech_research_cycle(self) -> dict:
        """Nghiên cứu công nghệ, đóng gói sản phẩm số và ghi nhật ký 3 đoạn."""
        logging.info("🔍 [Worker: TechResearcher] Bắt đầu nghiên cứu công nghệ & đóng gói sản phẩm số...")
        topic = self.researcher.get_next_tech_topic()
        trend = self.researcher.get_ecommerce_trend()

        seo_file = self.product_gen.generate_shopee_seo_pack(trend)
        video_file = self.product_gen.generate_viral_video_script(
            f"Bí quyết tự động hóa kiếm tiền với {topic['name']}",
            "Người kinh doanh online & Creator"
        )

        # Tạo thêm bài sales copy cho một sản phẩm trong danh mục
        prods = self.product_gen.PRODUCTS_CATALOG
        rand_prod = prods[int(time.time()) % len(prods)]
        sales_copy_file = self.product_gen.generate_product_sales_copy(rand_prod)

        lines_added = self.diary_logger.append_diary_entries(tech_topic=topic)

        # Cập nhật logs và activity summary vào data.js
        if JS_DATA_FILE.exists():
            with open(JS_DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read()
            content = self._sync_logs_and_summary(content)
            with open(JS_DATA_FILE, "w", encoding="utf-8") as f:
                f.write(content)

        # Deploy
        dep = self.deployer.commit_and_deploy(
            note=f"Pepe nghiên cứu {topic['name']} & đẩy mạnh sản phẩm số {rand_prod['name']}"
        )

        # Cập nhật gói kéo khách & ping Search Engine (Bing, IndexNow)
        try:
            self.daily_planner.sync_to_data_js()
            logging.info("📋 [DailyPlanner] Đã đồng bộ Kế hoạch hôm nay, Moneymaking Ranking & Timeline 24h vào data.js")
        except Exception as e:
            logging.warning(f"Daily Planner error: {e}")

        try:
            new_seo = self.seo_publisher.publish_next_seo_article()
            logging.info(f"✍️ [SEOPublisher] Đã tự động xuất bản bài viết SEO định kỳ: {new_seo['title']} (bai-viet/{new_seo['slug']}.html)")
        except Exception as e:
            logging.warning(f"SEO Publisher error: {e}")

        try:
            self.outreach_engine.generate_daily_outreach_pack()
            logging.info("📢 [OutreachEngine] Đã cập nhật gói rải link kéo khách tại marketing_hub/OUTREACH_READY_PACKS.md")
        except Exception as e:
            logging.warning(f"Outreach generation error: {e}")

        try:
            from services.search_indexer import submit_indexnow
            submit_indexnow()
            logging.info("🌐 [SearchIndexer] Đã submit URL tới IndexNow (Bing/Yandex/Naver)")
        except Exception as e:
            logging.warning(f"IndexNow error: {e}")

        try:
            self.telegram_reporter.check_and_send_scheduled_reports()
        except Exception as e:
            logging.warning(f"Telegram reporting error: {e}")

        try:
            self.run_linkedin_scan_cycle()
        except Exception as e:
            logging.warning(f"LinkedIn scan error: {e}")

        return {
            "topic": topic["name"],
            "seo_pack": seo_file.name,
            "video_script": video_file.name,
            "sales_copy": sales_copy_file.name,
            "deploy": dep
        }

    def _sync_logs_and_summary(self, content: str) -> str:
        """Đọc file log thật của daemon và chèn mảng daemonLogs cùng activitySummary vào data.js."""
        lines = []
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
                lines = [l.strip() for l in f.readlines() if l.strip()]

        deploy_count = sum(1 for l in lines if "Cloudflare Pages deployed" in l)
        aff_count = sum(1 for l in lines if "[AffiliateEngine]" in l or "[Worker: AffiliateContentEngine]" in l)
        tech_count = sum(1 for l in lines if "[Worker: TechResearcher]" in l)
        total_cycles = max(1, (aff_count // 3) + tech_count)
        now_str = datetime.now().strftime("%H:%M:%S")

        parsed_logs = []
        for l in lines[-30:]:
            m = re.match(r"^(\d{4}-\d{2}-\d{2}\s+(\d{2}:\d{2}:\d{2}))\s+\[([A-Z]+)\]\s+(.*)$", l)
            if m:
                _, tm, lvl, rest = m.groups()
                tag_m = re.search(r"\[([a-zA-Z0-9_: ]+)\]", rest)
                tag = tag_m.group(1).replace("Worker: ", "") if tag_m else "System"
                clean_msg = re.sub(r"\[[a-zA-Z0-9_: ]+\]\s*", "", rest).replace('"', '\\"').replace("\n", " ")
                parsed_logs.append(
                    f'    {{ time: "{tm}", level: "{lvl}", tag: "{tag}", msg: "{clean_msg}" }}'
                )

        logs_code = "  daemonLogs: [\n" + ",\n".join(parsed_logs) + "\n  ],\n\n"
        summary_code = (
            "  activitySummary: {\n"
            f'    daemonStatus: "🟢 Đang cày cuốc 24/7 (Apple Silicon M4)",\n'
            f'    uptimeDesc: "Chạy liên tục không nghỉ",\n'
            f'    totalCycles: {total_cycles},\n'
            f'    affiliateGenerated: {aff_count},\n'
            f'    productsLive: 7,\n'
            f'    deployCount: {deploy_count},\n'
            f'    lastDeploy: "{now_str}",\n'
            f'    nextCycleMinutes: 5\n'
            "  },\n\n"
        )

        # Replace or inject daemonLogs
        if "daemonLogs:" in content:
            content = re.sub(r'  daemonLogs:\s*\[[\s\S]*?\],\n\n', logs_code, content)
        else:
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + logs_code + content[pos:]

        # Replace or inject activitySummary
        if "activitySummary:" in content:
            content = re.sub(r'  activitySummary:\s*\{[\s\S]*?\},\n\n', summary_code, content)
        else:
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + summary_code + content[pos:]

        return content

    def _update_data_with_affiliate(self, camp: dict, bundle: dict, diary_lines: list):
        """Cập nhật mảng affiliateRadar và nhật ký vào js/data.js."""
        if not JS_DATA_FILE.exists():
            return

        with open(JS_DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        now = datetime.now()
        updated_at_str = now.strftime("%d/%m/%Y %H:%M")
        content = re.sub(
            r'updatedAt:\s*"[^"]*"',
            f'updatedAt: "{updated_at_str}"',
            content
        )

        # Prepend diary lines
        if diary_lines:
            escaped_lines = []
            for l in diary_lines:
                clean_x = l["x"].replace('"', '\\"').replace("\n", " ")
                escaped_lines.append(f'        {{ t: "{l["t"]}", x: "{clean_x}" }},')
            lines_json = "\n".join(escaped_lines)
            m = re.search(r'lines:\s*\[\n', content)
            if m:
                pos = m.end()
                content = content[:pos] + lines_json + "\n" + content[pos:]

        # Create affiliate item structure
        clean_name = camp["name"].replace('"', '\\"')
        clean_cat = camp["category"].replace('"', '\\"')
        clean_comm = camp["commission"].replace('"', '\\"')
        clean_code = camp["discount_code"].replace('"', '\\"')
        clean_link = camp["aff_url"].replace('"', '\\"')
        script_rel = bundle.get("script_path", "").replace('"', '\\"')
        article_rel = bundle.get("article_path", "").replace('"', '\\"')
        thread_rel = bundle.get("thread_path", "").replace('"', '\\"')

        aff_item_code = (
            f'    {{ id: "{camp["id"]}", name: "{clean_name}", category: "{clean_cat}", commission: "{clean_comm}", '
            f'discountCode: "{clean_code}", affUrl: "{clean_link}", script: "{script_rel}", article: "{article_rel}", '
            f'thread: "{thread_rel}", status: "Đã có Kịch bản Video & Bài Review SEO" }},'
        )

        # Remove old freelanceRadar references if any
        if "freelanceRadar:" in content:
            content = re.sub(r'  freelanceRadar:\s*\[[\s\S]*?\],\n\n', '', content)

        if "affiliateRadar:" in content:
            m_aff = re.search(r'affiliateRadar:\s*\[\n', content)
            if m_aff:
                pos = m_aff.end()
                content = content[:pos] + aff_item_code + "\n" + content[pos:]
        else:
            aff_block = "  affiliateRadar: [\n" + aff_item_code + "\n  ],\n\n"
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + aff_block + content[pos:]

        content = self._sync_logs_and_summary(content)

        with open(JS_DATA_FILE, "w", encoding="utf-8") as f:
            f.write(content)

    def start_nonstop_engine(self):
        """Khởi động hệ thống đa luồng chạy liên tục không bao giờ idle."""
        logging.info("==================================================")
        logging.info("🚀 KHỞI ĐỘNG CỖ MÁY PEPE AFFILIATE & SẢN PHẨM SỐ (KHÔNG IDLE)")
        logging.info("==================================================")
        print("🐸 Pepe Continuous Runner đã khởi động!")
        print("• Worker 1: Săn kèo Affiliate & Sản xuất Content Viral (mỗi 5 phút)")
        print("• Worker 2: Nghiên cứu công nghệ & Đóng gói sản phẩm số (mỗi 15 phút)")
        print("• Worker 3: Tự động commit, push GitHub & deploy Cloudflare Pages")

        # Chạy ngay 1 lượt affiliate content và tech research lúc khởi động
        try:
            self.run_affiliate_content_cycle()
        except Exception as e:
            logging.error(f"Khởi động affiliate content error: {e}")

        try:
            self.run_tech_research_cycle()
        except Exception as e:
            logging.error(f"Khởi động research error: {e}")

        # Vòng lặp chính điều phối thời gian thực
        affiliate_timer = 0
        tech_timer = 0
        telegram_timer = 0

        while not self._stop_event.is_set():
            time.sleep(10)  # Ticks mỗi 10 giây
            affiliate_timer += 10
            tech_timer += 10
            telegram_timer += 10

            # Mỗi 1 phút (60s): Kiểm tra lịch gửi báo cáo Telegram tối (sau 21h)
            if telegram_timer >= 60:
                telegram_timer = 0
                try:
                    self.telegram_reporter.check_and_send_scheduled_reports()
                except Exception as e:
                    logging.warning(f"Lỗi kiểm tra lịch gửi Telegram: {e}")

            # Chu kỳ sản xuất content Affiliate (Mặc định 2 tiếng một lần, tránh spam git & cloudflare)
            if affiliate_timer >= AFFILIATE_CYCLE_SECONDS:
                affiliate_timer = 0
                try:
                    self.run_affiliate_content_cycle()
                except Exception as e:
                    logging.error(f"Lỗi affiliate content cycle: {e}")

            # Chu kỳ nghiên cứu công nghệ & đóng gói sản phẩm (Mặc định 4 tiếng một lần)
            if tech_timer >= TECH_RESEARCH_CYCLE_SECONDS:
                tech_timer = 0
                try:
                    self.run_tech_research_cycle()
                except Exception as e:
                    logging.error(f"Lỗi tech cycle: {e}")
