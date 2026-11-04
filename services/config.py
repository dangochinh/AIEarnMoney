"""
Pepe Nuôi Thân — Autonomous Headless Service Configuration
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
LOGS_DIR = BASE_DIR / "logs"
PRODUCTS_DIR = BASE_DIR / "products"
JS_DATA_FILE = BASE_DIR / "js" / "data.js"
PID_FILE = BASE_DIR / ".pepe_daemon.pid"
STATE_FILE = BASE_DIR / ".pepe_service_state.json"

# External Repos to utilize
USER_HOME = Path("/Users/happypc")
PEPEAPP_DIR = USER_HOME / "PePeApp"
SELLERBRAIN_DIR = USER_HOME / "shopee-ai-tool 2"
SELLERBRAIN_SCRAPER_DIR = USER_HOME / "sellerbrain-scraper"
JARVIS_DIR = USER_HOME / "jarvis"

# Service Intervals (in minutes)
CYCLE_INTERVAL_MINUTES = 120
RESEARCH_BATCH_SIZE = 1  # 1 deep-dive per cycle to keep quality top-tier

# Loop Timers in Seconds (Sensible intervals to avoid spamming GitHub & Cloudflare)
AFFILIATE_CYCLE_SECONDS = 7200   # 2 hours (thay vì 5 phút)
TECH_RESEARCH_CYCLE_SECONDS = 14400  # 4 hours (thay vì 15 phút)

# Cloudflare & Git
CF_PROJECT_NAME = "ai-earn-money"
CF_BRANCH = "main"
AUTO_DEPLOY = False  # Đặt False vì Cloudflare Pages đã bật "Automatic deployments" từ GitHub, tránh build trùng lặp 2 lần

# Logging
LOG_FILE = LOGS_DIR / "pepe_daemon.log"

# Telegram Notifications
TELEGRAM_BOT_TOKEN = os.getenv("PEPE_TELEGRAM_BOT_TOKEN", "8394322896:AAGLvVyv779HJpmLUiZ49Zr62JPUJ8d81GU")
TELEGRAM_CHAT_ID = os.getenv("PEPE_TELEGRAM_CHAT_ID", "140392118")
