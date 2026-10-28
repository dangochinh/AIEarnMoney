"""
Pepe Nuôi Thân — Autonomous Headless CLI & Daemon Controller
Quản lý tiến trình chạy ngầm, LaunchAgent và kích hoạt chu trình
"""

import os
import sys
import time
import signal
import subprocess
from pathlib import Path
from services.config import BASE_DIR, PID_FILE, LOG_FILE
from services.scheduler import ContinuousPepeEngine

LAUNCHAGENT_PLIST = Path.home() / "Library" / "LaunchAgents" / "com.pepe.nuoithan.plist"
PYTHON_BIN = BASE_DIR / ".venv" / "bin" / "python3"
if not PYTHON_BIN.exists():
    PYTHON_BIN = Path(sys.executable)


def is_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def get_running_pid():
    if PID_FILE.exists():
        try:
            with open(PID_FILE, "r") as f:
                pid = int(f.read().strip())
            if is_running(pid):
                return pid
        except Exception:
            pass
    return None


def cmd_run_once():
    """Chạy ngay lập tức 1 chu trình tạo content affiliate và nghiên cứu sản phẩm số."""
    print("🐸 [Pepe Engine] Đang chạy chu trình sản xuất Content Affiliate và Sản phẩm số...")
    engine = ContinuousPepeEngine()
    print("\n1. Đang săn kèo Affiliate & tạo Content Viral (TikTok Script + SEO Review + Thread)...")
    bundle = engine.run_affiliate_content_cycle()
    camp = bundle["campaign"]
    print(f"   -> Đã lên chiến dịch: {camp['name']} ({camp['category']})")
    print(f"   -> Hoa hồng: {camp['commission']} | Link: {camp['aff_url']}")
    print(f"   -> Kịch bản video: {bundle['script_path']}")
    print(f"   -> Bài review SEO: {bundle['article_path']}")

    print("\n2. Đang nghiên cứu công nghệ và đóng gói sản phẩm số...")
    res = engine.run_tech_research_cycle()
    print(f"   -> Đã nghiên cứu: {res.get('topic')}")
    print(f"   -> Đã tạo SEO pack: {res.get('seo_pack')}")
    print(f"   -> Đã tạo video script: {res.get('video_script')}")
    print(f"   -> Đã tạo Sales Copy: {res.get('sales_copy')}")
    dep = res.get("deploy", {})
    print(f"   -> Cloudflare Pages: {'ĐÃ CẬP NHẬT TRỰC TUYẾN 🚀' if dep.get('cf_deployed') else dep.get('error')}")


def cmd_start():
    """Khởi động daemon chạy ngầm."""
    existing_pid = get_running_pid()
    if existing_pid:
        print(f"⚠️ Pepe Daemon đang chạy rồi (PID: {existing_pid}).")
        return

    print("🚀 Đang khởi động Pepe Continuous Daemon (Chạy liên tục không idle)...")
    log_out = open(LOG_FILE, "a")
    proc = subprocess.Popen(
        [str(PYTHON_BIN), "-m", "services.daemon", "_worker"],
        cwd=BASE_DIR,
        stdout=log_out,
        stderr=log_out,
        start_new_session=True
    )

    with open(PID_FILE, "w") as f:
        f.write(str(proc.pid))

    time.sleep(1)
    if is_running(proc.pid):
        print(f"✅ Pepe Daemon đã khởi động thành công với PID: {proc.pid}")
        print(f"📄 Theo dõi logs tại: {LOG_FILE}")
        print(f"⚡ Vòng lặp: Săn kèo Affiliate & Content Viral (mỗi 5p) · Sản phẩm số & Research (mỗi 15p).")
    else:
        print("❌ Khởi động thất bại. Kiểm tra file log để biết thêm chi tiết.")


def cmd_stop():
    """Dừng daemon đang chạy."""
    pid = get_running_pid()
    if not pid:
        print("ℹ️ Pepe Daemon không chạy.")
        if PID_FILE.exists():
            PID_FILE.unlink()
        return

    print(f"🛑 Đang dừng Pepe Daemon (PID: {pid})...")
    try:
        os.kill(pid, signal.SIGTERM)
        time.sleep(1)
        if is_running(pid):
            os.kill(pid, signal.SIGKILL)
        print("✅ Đã dừng Pepe Daemon thành công.")
    except Exception as e:
        print(f"Lỗi khi dừng: {e}")

    if PID_FILE.exists():
        PID_FILE.unlink()


def cmd_status():
    """Kiểm tra trạng thái tiến trình và log gần nhất."""
    pid = get_running_pid()
    print("==================================================")
    print("🐸 PEPE NUÔI THÂN — TRẠNG THÁI TIẾN TRÌNH AUTONOMOUS")
    print("==================================================")
    if pid:
        print(f"🟢 Trạng thái : ĐANG CHẠY LIÊN TỤC KHÔNG IDLE (PID: {pid})")
    else:
        print("🔴 Trạng thái : ĐANG TẮT")

    print(f"📁 Thư mục gốc: {BASE_DIR}")
    print(f"📄 File nhật ký log: {LOG_FILE}")
    print(f"⚡ Vòng lặp: Quét Freelance (mỗi 5p) · Tech Research (mỗi 15p)")

    if LOG_FILE.exists():
        print("\n📜 10 DÒNG NHẬT KÝ HOẠT ĐỘNG GẦN NHẤT:")
        try:
            with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                for l in lines[-10:]:
                    print("  " + l.strip())
        except Exception:
            pass
    print("==================================================")


def cmd_install_service():
    """Cài đặt macOS LaunchAgent để tự động chạy khi khởi động máy Mac."""
    LAUNCHAGENT_PLIST.parent.mkdir(parents=True, exist_ok=True)
    plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pepe.nuoithan</string>
    <key>ProgramArguments</key>
    <array>
        <string>{PYTHON_BIN}</string>
        <string>-m</string>
        <string>services.daemon</string>
        <string>_worker</string>
    </array>
    <key>WorkingDirectory</key>
    <string>{BASE_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{LOG_FILE}</string>
    <key>StandardErrorPath</key>
    <string>{LOG_FILE}</string>
</dict>
</plist>
"""
    with open(LAUNCHAGENT_PLIST, "w", encoding="utf-8") as f:
        f.write(plist_content)

    print(f"✅ Đã tạo file macOS LaunchAgent: {LAUNCHAGENT_PLIST}")
    subprocess.run(["launchctl", "load", str(LAUNCHAGENT_PLIST)], capture_output=True)
    print("🚀 Đã nạp LaunchAgent vào hệ điều hành! Dịch vụ sẽ tự động cày cuốc 24/7 kể cả khi bạn khởi động lại máy.")


def cmd_uninstall_service():
    """Gỡ bỏ macOS LaunchAgent."""
    if LAUNCHAGENT_PLIST.exists():
        subprocess.run(["launchctl", "unload", str(LAUNCHAGENT_PLIST)], capture_output=True)
        LAUNCHAGENT_PLIST.unlink()
        print("✅ Đã gỡ bỏ macOS LaunchAgent thành công.")
    else:
        print("ℹ️ Không tìm thấy file LaunchAgent.")


def main():
    if len(sys.argv) < 2:
        print("Cách sử dụng: ./pepe.sh [command]")
        print("Lệnh khả dụng:")
        print("  run-once          : Chạy ngay 1 chu kỳ tạo content affiliate + sản phẩm số + deploy")
        print("  start             : Khởi động daemon chạy liên tục không idle")
        print("  stop              : Dừng daemon đang chạy")
        print("  status            : Xem trạng thái và logs")
        print("  logs              : Theo dõi logs trực tiếp")
        print("  install-service   : Tự động chạy cùng macOS 24/7 (LaunchAgent)")
        return

    cmd = sys.argv[1].lower()

    if cmd == "run-once":
        cmd_run_once()
    elif cmd == "start":
        cmd_start()
    elif cmd == "stop":
        cmd_stop()
    elif cmd == "status":
        cmd_status()
    elif cmd == "install-service":
        cmd_install_service()
    elif cmd == "uninstall-service":
        cmd_uninstall_service()
    elif cmd == "_worker":
        engine = ContinuousPepeEngine()
        engine.start_nonstop_engine()
    else:
        print(f"Lệnh không hợp lệ: {cmd}")


if __name__ == "__main__":
    main()
