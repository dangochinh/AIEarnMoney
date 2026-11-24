#!/usr/bin/env python3
"""
Pepe Nuôi Thân — Sync Candidates Utility CLI
Nhập và đồng bộ danh sách ứng viên thật từ LinkedIn Extension vào Master Database của Chợ CV.
Tự động lọc trùng lặp qua URL profile, chuẩn hóa trường dữ liệu và kích hoạt xuất bản Chợ CV.
"""

import sys
import json
import csv
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "products" / "talentscout-extension" / "data"
MASTER_JSON = DATA_DIR / "talentscout_candidates_master.json"
MASTER_CSV = DATA_DIR / "talentscout_candidates_master.csv"
PUBLIC_CSV = BASE_DIR / "products" / "talentscout_candidates_master.csv"


def clean_url(url: str) -> str:
    if not url:
        return ""
    return url.split("?")[0].strip().rstrip("/").lower()


def sync_candidates(incoming_list: list) -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load existing master
    master = []
    if MASTER_JSON.exists():
        try:
            with open(MASTER_JSON, "r", encoding="utf-8") as f:
                master = json.load(f)
        except Exception as e:
            print(f"Warning: could not read {MASTER_JSON}: {e}")

    seen_urls = {clean_url(c.get("profileUrl", "")) for c in master}
    today_str = datetime.now().strftime("%d/%m/%Y")
    now_code = datetime.now().strftime("%y%m%d")

    added = 0
    duplicates = 0

    for idx, inc in enumerate(incoming_list):
        url = inc.get("profileUrl", "")
        c_url = clean_url(url)
        if not c_url or c_url in seen_urls:
            duplicates += 1
            continue

        seen_urls.add(c_url)
        added += 1

        is_open = inc.get("isOpenToWork", False)
        cand_id = inc.get("id") or f"TS_REAL_{now_code}_{str(idx + 1).zfill(3)}"
        name = inc.get("name", "Ứng viên LinkedIn")
        headline = inc.get("headline", "Kỹ sư công nghệ")
        company = inc.get("company", "Chưa cập nhật")
        location = inc.get("location", "Việt Nam")
        level = inc.get("level", "Mid-Level")
        skills = inc.get("skills", ["Chung"])
        skills_fmt = inc.get("skillsFormatted") or ", ".join(skills)
        email = inc.get("email") or ("Liên hệ qua InMail LinkedIn" if is_open else "Chưa công khai")
        status = inc.get("status") or ("Sẵn sàng phỏng vấn" if is_open else "Mới cào từ LinkedIn thật")

        outreach = inc.get("aiOutreachMessage") or (
            f"Chào {name},\n\n"
            f"Mình ấn tượng với hồ sơ của bạn ở vị trí {headline} tại {company}.\n\n"
            f"Hiện bên mình đang có cơ hội mở cho vị trí phù hợp với Tech Stack của bạn.\n\n"
            f"Nếu bạn đang sẵn sàng đón nhận cơ hội mới, bạn phản hồi tin nhắn này để mình gửi JD chi tiết nhé!\n\n"
            f"(Gửi qua TalentScout AI)"
        )

        candidate = {
            "id": cand_id,
            "name": name,
            "headline": headline,
            "company": company,
            "location": location,
            "level": level,
            "isOpenToWork": is_open,
            "openToWorkStatus": "🔥 CÓ (#OPENTOWORK)" if is_open else "Chưa bật",
            "email": email,
            "skills": skills,
            "skillsFormatted": skills_fmt,
            "profileUrl": url,
            "scoutedAt": inc.get("scoutedAt", today_str),
            "status": status,
            "aiOutreachMessage": outreach
        }

        # Chèn lên đầu danh sách để hiển thị mới nhất
        master.insert(0, candidate)

    if added > 0:
        # Save master JSON
        with open(MASTER_JSON, "w", encoding="utf-8") as f:
            json.dump(master, f, ensure_ascii=False, indent=2)

        # Save master CSVs
        headers = [
            "id", "name", "headline", "level", "openToWorkStatus",
            "email", "company", "location", "skillsFormatted",
            "profileUrl", "scoutedAt", "status"
        ]

        def write_csv(p):
            with open(p, "w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
                writer.writeheader()
                for c in master:
                    writer.writerow(c)

        write_csv(MASTER_CSV)
        write_csv(PUBLIC_CSV)

        # Run cv_exporter to update js/cv_data.js and cv_marketplace_data.json
        import subprocess
        exporter = BASE_DIR / "services" / "cv_exporter.py"
        if exporter.exists():
            subprocess.run([sys.executable, str(exporter)], check=False)

    return {
        "success": True,
        "added": added,
        "duplicates": duplicates,
        "total": len(master),
        "message": f"Đã đồng bộ {added} ứng viên thật vào Chợ CV! (Trùng lặp: {duplicates}, Tổng database: {len(master)})"
    }


def main():
    if len(sys.argv) < 2:
        print("Sử dụng: python3 services/sync_candidates.py <path_to_candidates.json>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    if not file_path.exists():
        print(f"Lỗi: Không tìm thấy file {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "candidates" in data:
        data = data["candidates"]

    if not isinstance(data, list):
        print("Lỗi: Dữ liệu JSON phải là mảng các ứng viên!")
        sys.exit(1)

    res = sync_candidates(data)
    print("=" * 60)
    print(res["message"])
    print("=" * 60)


if __name__ == "__main__":
    main()
