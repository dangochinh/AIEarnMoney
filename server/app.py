#!/usr/bin/env python3
"""
Pepe Nuôi Thân - Local Development & Production Server
Chạy máy chủ nhẹ phục vụ website và các API endpoint đơn giản.
"""

import http.server
import socketserver
import os
import sys
import json

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class PepeRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        # API Health Check
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "online",
                "pepe": "running",
                "message": "Pepe Nuôi Thân Server đang hoạt động tốt!"
            }).encode("utf-8"))
            return

        # Fallback to file serving
        return super().do_GET()

    def do_POST(self):
        # Handle custom order API
        if self.path == "/api/custom-order":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
            except Exception:
                data = {}

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            import random
            rand_code = "PEPE-" + "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", k=5))
            self.wfile.write(json.dumps({
                "ok": True,
                "code": rand_code,
                "message": "Đã tiếp nhận yêu cầu từ Pepe server"
            }).encode("utf-8"))
            return

        return super().do_POST()

def main():
    os.chdir(BASE_DIR)
    handler = PepeRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"==================================================")
        print(f"🐸 PEPE NUÔI THÂN SERVER ĐANG CHẠY!")
        print(f"👉 Mở trình duyệt: http://localhost:{PORT}")
        print(f"👉 Thư mục gốc: {BASE_DIR}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã dừng máy chủ Pepe.")
            sys.exit(0)

if __name__ == "__main__":
    main()
