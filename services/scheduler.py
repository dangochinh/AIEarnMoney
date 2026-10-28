"""
Pepe Nuôi Thân — Continuous Multi-Worker Autonomous Engine
Chạy liên tục không idle: Quét Freelance Jobs + Nghiên cứu công nghệ + Sinh sản phẩm + Deploy
"""

import json
import logging
import re
import threading
import time
from datetime import datetime
from services.config import LOG_FILE, JS_DATA_FILE
from services.research_engine import ResearchEngine
from services.product_engine import ProductEngine
from services.diary_logger import DiaryLogger
from services.deployer import AutoDeployer
from services.freelance_hunter import FreelanceJobHunter

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
        self.hunter = FreelanceJobHunter()
        self._stop_event = threading.Event()

    def run_freelance_cycle(self) -> list:
        """Quét các sàn freelance, tạo proposal và ghi nhật ký."""
        logging.info("🎯 [Worker: FreelanceHunter] Đang quét các sàn freelance...")
        found_jobs = self.hunter.scan_and_hunt()
        if not found_jobs:
            logging.info("🎯 [Worker: FreelanceHunter] Chưa có job mới phù hợp.")
            return []

        now_str = datetime.now().strftime("%H:%M")
        new_diary_lines = []

        for job in found_jobs:
            line_text = f"Radar freelance vừa phát hiện job: '{job['title']}' ngân sách {job['budget']} trên {job['platform']} — Pepe đã soạn proposal chi tiết và sẵn sàng gửi demo chốt đơn!"
            new_diary_lines.append({"t": now_str, "x": line_text})

        # Cập nhật vào data.js (cả nhật ký và mảng freelanceRadar)
        self._update_data_with_freelance(found_jobs, new_diary_lines)

        # Deploy cập nhật lên Cloudflare Pages
        self.deployer.commit_and_deploy(
            note=f"Pepe phát hiện {len(found_jobs)} job freelance & soạn proposal"
        )
        return found_jobs

    def run_tech_research_cycle(self) -> dict:
        """Nghiên cứu công nghệ, đóng gói sản phẩm số và ghi nhật ký 3 đoạn."""
        logging.info("🔍 [Worker: TechResearcher] Bắt đầu nghiên cứu công nghệ & thị trường...")
        topic = self.researcher.get_next_tech_topic()
        trend = self.researcher.get_ecommerce_trend()

        seo_file = self.product_gen.generate_shopee_seo_pack(trend)
        video_file = self.product_gen.generate_viral_video_script(
            f"Bí quyết tự động hóa kiếm tiền với {topic['name']}",
            "Người kinh doanh online & Freelancer"
        )

        lines_added = self.diary_logger.append_diary_entries(tech_topic=topic)

        # Deploy
        dep = self.deployer.commit_and_deploy(
            note=f"Pepe nghiên cứu {topic['name']} & tạo sản phẩm mới"
        )
        return {
            "topic": topic["name"],
            "seo_pack": seo_file.name,
            "video_script": video_file.name,
            "deploy": dep
        }

    def _update_data_with_freelance(self, jobs: list, diary_lines: list):
        """Cập nhật mảng freelanceRadar và lines vào js/data.js."""
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

        # Update freelanceRadar list in data.js
        job_items_code = []
        for j in jobs:
            clean_title = j["title"].replace('"', '\\"')
            clean_budget = j["budget"].replace('"', '\\"')
            clean_company = j["company"].replace('"', '\\"')
            job_items_code.append(
                f'    {{ id: "{j["id"]}", platform: "{j["platform"]}", title: "{clean_title}", budget: "{clean_budget}", company: "{clean_company}", proposal: "{j.get("proposal_path", "")}", status: "Đã soạn Proposal · Sẵn sàng làm demo" }},'
            )

        if "freelanceRadar:" in content:
            m_radar = re.search(r'freelanceRadar:\s*\[\n', content)
            if m_radar:
                pos = m_radar.end()
                content = content[:pos] + "\n".join(job_items_code) + "\n" + content[pos:]
        else:
            radar_block = "  freelanceRadar: [\n" + "\n".join(job_items_code) + "\n  ],\n\n"
            m_days = re.search(r'  days:\s*\[', content)
            if m_days:
                pos = m_days.start()
                content = content[:pos] + radar_block + content[pos:]

        with open(JS_DATA_FILE, "w", encoding="utf-8") as f:
            f.write(content)

    def start_nonstop_engine(self):
        """Khởi động hệ thống đa luồng chạy liên tục không bao giờ idle."""
        logging.info("==================================================")
        logging.info("🚀 KHỞI ĐỘNG CỖ MÁY PEPE CONTINUOUS RUNNER (KHÔNG IDLE)")
        logging.info("==================================================")
        print("🐸 Pepe Continuous Runner đã khởi động!")
        print("• Worker 1: Quét sàn Freelance & soạn Proposal (mỗi 5 phút)")
        print("• Worker 2: Nghiên cứu công nghệ & làm sản phẩm số (mỗi 15 phút)")
        print("• Worker 3: Kiểm tra đơn hàng & đồng bộ trực tiếp Cloudflare Pages")

        # Chạy ngay 1 lượt freelance và tech research lúc khởi động
        try:
            self.run_freelance_cycle()
        except Exception as e:
            logging.error(f"Khởi động freelance error: {e}")

        try:
            self.run_tech_research_cycle()
        except Exception as e:
            logging.error(f"Khởi động research error: {e}")

        # Vòng lặp chính điều phối thời gian thực
        freelance_timer = 0
        tech_timer = 0

        while not self._stop_event.is_set():
            time.sleep(10)  # Ticks mỗi 10 giây
            freelance_timer += 10
            tech_timer += 10

            # Mỗi 5 phút (300s): Quét freelance
            if freelance_timer >= 300:
                freelance_timer = 0
                try:
                    self.run_freelance_cycle()
                except Exception as e:
                    logging.error(f"Lỗi freelance cycle: {e}")

            # Mỗi 15 phút (900s): Nghiên cứu công nghệ & tạo sản phẩm
            if tech_timer >= 900:
                tech_timer = 0
                try:
                    self.run_tech_research_cycle()
                except Exception as e:
                    logging.error(f"Lỗi tech cycle: {e}")
