"""
Pepe Nuôi Thân — Autonomous Cycle Scheduler & Orchestrator
Điều phối toàn bộ chu trình: Research -> Product Gen -> Diary Log -> Deploy
"""

import logging
import time
from datetime import datetime
from services.config import LOG_FILE, CYCLE_INTERVAL_MINUTES
from services.research_engine import ResearchEngine
from services.product_engine import ProductEngine
from services.diary_logger import DiaryLogger
from services.deployer import AutoDeployer

# Configure file logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)


class PepeAutonomousService:
    def __init__(self):
        self.researcher = ResearchEngine()
        self.product_gen = ProductEngine()
        self.diary_logger = DiaryLogger()
        self.deployer = AutoDeployer()

    def run_single_cycle(self) -> dict:
        """Chạy một chu trình sinh tồn tự động hoàn chỉnh."""
        start_time = datetime.now()
        logging.info("==================================================")
        logging.info("🐸 BẮT ĐẦU CHU KỲ CÀY CUỐC TỰ ĐỘNG CỦA PEPE")

        result = {
            "timestamp": start_time.isoformat(),
            "tech_topic": None,
            "seo_pack": None,
            "video_script": None,
            "diary_lines_added": 0,
            "deploy_status": None
        }

        # 1. Nghiên cứu công nghệ & thị trường
        try:
            topic = self.researcher.get_next_tech_topic()
            trend = self.researcher.get_ecommerce_trend()
            result["tech_topic"] = topic["name"]
            logging.info(f"🔍 Đã nghiên cứu công nghệ: {topic['name']} ({topic['category']})")
            logging.info(f"📊 Đã phân tích thị trường ngách: {trend['niche']}")
        except Exception as e:
            logging.error(f"Lỗi khi nghiên cứu: {e}")
            topic = None
            trend = None

        # 2. Tự động sinh sản phẩm số mới
        if trend:
            try:
                seo_file = self.product_gen.generate_shopee_seo_pack(trend)
                result["seo_pack"] = str(seo_file.name)
                logging.info(f"🛍️ Đã đóng gói bộ SEO Shopee mới: {seo_file.name}")
            except Exception as e:
                logging.error(f"Lỗi khi tạo SEO pack: {e}")

        if topic:
            try:
                video_file = self.product_gen.generate_viral_video_script(
                    f"Cách kiếm tiền tự động với {topic['name']} và AI",
                    "Dân văn phòng & Freelancer"
                )
                result["video_script"] = str(video_file.name)
                logging.info(f"🎬 Đã tạo kịch bản video AI 60s: {video_file.name}")
            except Exception as e:
                logging.error(f"Lỗi khi tạo video script: {e}")

        # 3. Tự động ghi chép nhật ký sống sót
        if topic:
            try:
                added = self.diary_logger.append_diary_entries(tech_topic=topic)
                result["diary_lines_added"] = len(added)
                logging.info(f"📝 Đã ghi {len(added)} dòng mới vào sổ nhật ký js/data.js")
            except Exception as e:
                logging.error(f"Lỗi khi ghi nhật ký: {e}")

        # 4. Tự động git commit và deploy lên Cloudflare Pages
        try:
            dep = self.deployer.commit_and_deploy(
                note=f"Pepe nghiên cứu {topic['name'] if topic else 'thị trường'} & đóng gói sản phẩm số"
            )
            result["deploy_status"] = dep
            if dep.get("cf_deployed"):
                logging.info(f"🚀 Deploy thành công lên Cloudflare Pages: {dep.get('url')}")
            else:
                logging.warning(f"Deploy Cloudflare: {dep.get('error') or 'Chưa bật auto deploy'}")
        except Exception as e:
            logging.error(f"Lỗi khi deploy: {e}")

        logging.info("🎉 HOÀN THÀNH CHU KỲ CÀY CUỐC!")
        logging.info("==================================================")
        return result

    def start_loop(self, interval_minutes: int = CYCLE_INTERVAL_MINUTES):
        """Vòng lặp chạy định kỳ liên tục trong background."""
        logging.info(f"Khởi động vòng lặp tự động (Chu kỳ: {interval_minutes} phút/lần)...")
        print(f"🐸 Pepe Autonomous Daemon đã khởi chạy! Chu kỳ: {interval_minutes} phút/lần.")
        print(f"📄 File nhật ký log: {LOG_FILE}")

        while True:
            try:
                self.run_single_cycle()
            except Exception as e:
                logging.error(f"Lỗi ngoại lệ trong chu kỳ: {e}")

            time.sleep(interval_minutes * 60)
