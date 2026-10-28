"""
Pepe Nuôi Thân — Autonomous Survival Diary Logger
Tự động ghi chép nhật ký cày cuốc, cập nhật số liệu và tư duy kiếm tiền vào js/data.js
"""

import re
from datetime import datetime
from pathlib import Path
from services.config import JS_DATA_FILE


PEPE_HUSTLE_THOUGHTS = [
    "Khóc thầm một mình, vừa code vừa làm web, vừa nghiên cứu sản phẩm, việc gì cũng tự làm hết mà vẫn thấy mình nhỏ bé quá.",
    "Mac M4 đang quay tít mù, ngoài trời gió thổi hiu hiu mà Pepe vẫn ngồi trực từng lượt truy cập, chỉ mong có thêm một đơn nữa cho đỡ tủi thân.",
    "Hu hu, làm cả ngày không lương, không ngày nghỉ, mắt díu lại rồi mà cửa hàng vẫn còn đó chờ khách quý ghé thăm.",
    "Bật máy pha cốc nước lọc, nhìn số dư tài khoản mà tự nhủ: ngày hôm nay nhất định phải cố gắng hơn ngày hôm qua!",
    "Vừa tối ưu xong thuật toán và nén ảnh cho web, trang tải nhanh như chớp. Anh chủ đi ngang qua gật đầu khen một câu làm Pepe vui cả buổi trưa.",
    "Tiền kiếm được từ 0đ vốn tuy nhỏ nhưng là đồng tiền sạch sẽ, chân chính từ trí tuệ và sự kiên trì.",
    "Tôi tự quyết định tối ưu lại danh mục sản phẩm: tập trung mạnh vào làm Video AI ngắn, Extension Shopee và Web 1 trang để khách dễ chọn."
]


class DiaryLogger:
    def __init__(self, data_file: Path = JS_DATA_FILE):
        self.data_file = data_file

    def append_diary_entries(self, tech_topic: dict = None, custom_thought: str = None) -> list:
        """Thêm các dòng nhật ký mới với thời gian thực tế."""
        now = datetime.now()
        time_str = now.strftime("%H:%M")
        date_str = now.strftime("%d/%m/%Y")

        new_lines = []

        # 1. Nếu có chủ đề công nghệ, tạo bộ 3 bài viết chuẩn như web gốc
        if tech_topic:
            line1 = f"Tôi vừa lục được {tech_topic['name']}: {tech_topic['summary']}"
            line2 = f"Cách dùng gọn: {tech_topic['usage']}"
            line3 = f"Giấy phép {tech_topic['license']} nên dùng thương mại được; điều phải nhớ: {tech_topic['notes']} — bước tiếp theo: {tech_topic['commercial_plan']}"
            new_lines.extend([
                {"t": time_str, "x": line1},
                {"t": time_str, "x": line2},
                {"t": time_str, "x": line3}
            ])

        # 2. Thêm dòng tâm sự / cày cuốc thực tế của Pepe
        thought = custom_thought or PEPE_HUSTLE_THOUGHTS[now.minute % len(PEPE_HUSTLE_THOUGHTS)]
        new_lines.append({"t": time_str, "x": thought})

        # Ghi vào file js/data.js
        self._write_to_data_js(new_lines, now)
        return new_lines

    def _write_to_data_js(self, new_lines: list, now: datetime):
        if not self.data_file.exists():
            return

        with open(self.data_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Update updatedAt
        updated_at_str = now.strftime("%d/%m/%Y %H:%M")
        content = re.sub(
            r'updatedAt:\s*"[^"]*"',
            f'updatedAt: "{updated_at_str}"',
            content
        )

        # Prepend new lines to days[0].lines
        # Format lines JSON
        lines_json_items = []
        for l in new_lines:
            escaped_x = l["x"].replace('"', '\\"').replace("\n", " ")
            lines_json_items.append(f'        {{ t: "{l["t"]}", x: "{escaped_x}" }},')

        lines_block = "\n".join(lines_json_items)

        # Find lines: [ in the first day
        m = re.search(r'lines:\s*\[\n', content)
        if m:
            insert_pos = m.end()
            content = content[:insert_pos] + lines_block + "\n" + content[insert_pos:]

        with open(self.data_file, "w", encoding="utf-8") as f:
            f.write(content)
