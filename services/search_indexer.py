"""
Pepe Nuôi Thân — Search Engine Indexer & Ping Engine
Tự động gửi IndexNow tới Bing/Yandex/Naver và Google Sitemap Ping
Giúp khách hàng tìm thấy bài viết, sản phẩm và công cụ trên Google/Bing nhanh nhất!
"""

import json
import logging
import sys
import urllib.request
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from services.config import BASE_DIR

logger = logging.getLogger("SearchIndexer")

HOST = "ai-earn-money.pages.dev"
BASE_URL = f"https://{HOST}"

def get_all_urls_to_index() -> list:
    """Tự động quét toàn bộ bài viết trong bai-viet/ để submit lên IndexNow"""
    urls = [
        f"{BASE_URL}/",
        f"{BASE_URL}/affiliate.html",
        f"{BASE_URL}/marketing.html",
        f"{BASE_URL}/repos.html",
        f"{BASE_URL}/so-cai.html",
        f"{BASE_URL}/game.html",
        f"{BASE_URL}/quang-cao.html",
        f"{BASE_URL}/doi-tac.html",
        f"{BASE_URL}/cong-dong.html",
        f"{BASE_URL}/bai-viet/index.html",
    ]
    bv_dir = BASE_DIR / "bai-viet"
    if bv_dir.exists():
        for f in bv_dir.glob("*.html"):
            url = f"{BASE_URL}/bai-viet/{f.name}"
            if url not in urls:
                urls.append(url)
    return urls


def get_indexnow_key() -> str:
    key_file = BASE_DIR / "indexnow_key.txt"
    if key_file.exists():
        return key_file.read_text().strip()
    return "c299342a6b8d431c9009e841a2c7856c"


def submit_indexnow() -> dict:
    """Gửi toàn bộ URL tới giao thức IndexNow (Bing, Yandex, Seznam, Naver)"""
    key = get_indexnow_key()
    key_location = f"{BASE_URL}/{key}.txt"
    urls_to_submit = get_all_urls_to_index()

    payload = {
        "host": HOST,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls_to_submit
    }

    results = {}
    endpoints = [
        ("Bing", "https://www.bing.com/indexnow"),
        ("IndexNow API", "https://api.indexnow.org/indexnow"),
    ]

    for name, ep in endpoints:
        try:
            req = urllib.request.Request(
                ep,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json; charset=utf-8"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                results[name] = {"status": resp.status, "msg": "Submitted successfully"}
                print(f"✅ [IndexNow] {name}: HTTP {resp.status} - Đã submit {len(urls_to_submit)} URLs")
        except Exception as e:
            results[name] = {"status": "error", "msg": str(e)}
            print(f"⚠️ [IndexNow] {name} error: {e}")

    return results


def ping_google_sitemap() -> dict:
    """Ping Google Sitemap để bot Google vào cào sitemap.xml"""
    sitemap_url = f"{BASE_URL}/sitemap.xml"
    ping_url = f"https://www.google.com/ping?sitemap={urllib.parse.quote(sitemap_url)}"
    try:
        req = urllib.request.Request(
            ping_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; PepeNuoiThan/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"✅ [Google Ping] HTTP {resp.status} - Đã ping sitemap.xml")
            return {"status": resp.status, "msg": "Pinged Google"}
    except Exception as e:
        print(f"⚠️ [Google Ping] {e}")
        return {"status": "error", "msg": str(e)}


if __name__ == "__main__":
    print("🚀 Bắt đầu gửi URLs lên các công cụ tìm kiếm (Bing, Google, IndexNow)...")
    res_in = submit_indexnow()
    res_g = ping_google_sitemap()
    print("Hoàn tất!")
