#!/usr/bin/env python3
"""
CLI Tool: Daily LinkedIn Candidate Harvester (10 - 100 CV)
Usage:
  python3 scripts/daily_linkedin_harvester.py --count 50
  python3 scripts/daily_linkedin_harvester.py --count 100
"""

import sys
import argparse
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from services.linkedin_scanner import LinkedInCandidateScanner


def main():
    parser = argparse.ArgumentParser(description="TalentScout AI — Daily LinkedIn Candidate Harvester")
    parser.add_argument("--count", type=int, default=50, help="Số lượng hồ sơ muốn scan hôm nay (10 - 100 CV)")
    args = parser.parse_args()

    count = max(10, min(100, args.count))
    print("=" * 80)
    print(f"🐸 [TALENTSCOUT AI] BẮT ĐẦU CÀO {count} CV ỨNG VIÊN LINKEDIN HÔM NAY...")
    print("=" * 80)

    scanner = LinkedInCandidateScanner(target_daily=count)
    result = scanner.run_daily_scan(count=count)

    print(f"✅ Hoàn thành xuất sắc!")
    print(f"• Ngày quét: {result['date']}")
    print(f"• Số CV vừa scan hôm nay: {result['scanned_count']} CV")
    print(f"• Tổng CV đã quét trong ngày: {result['today_scanned_total']} CV")
    print(f"• Tổng Master Database: {result['master_total']} CV")
    print(f"• File CSV hôm nay: {result['csv_file']}")
    print(f"• File JSON hôm nay: {result['json_file']}")
    print(f"• Master CSV CRM : {result['master_csv']}")
    print("=" * 80)


if __name__ == "__main__":
    main()
