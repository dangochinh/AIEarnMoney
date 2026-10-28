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
CYCLE_INTERVAL_MINUTES = 30
RESEARCH_BATCH_SIZE = 1  # 1 deep-dive per cycle to keep quality top-tier

# Cloudflare & Git
CF_PROJECT_NAME = "ai-earn-money"
CF_BRANCH = "main"
AUTO_DEPLOY = True

# Logging
LOG_FILE = LOGS_DIR / "pepe_daemon.log"
