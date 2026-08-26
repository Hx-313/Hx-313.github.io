#!/usr/bin/env python3
"""
CSV Product Review Server
=========================
Reads a CSV file, serves a card-style product review page in the browser
(matching the MD preview style), and allows users to exclude products.

Usage:
    python3 csv-editor-server.py <csv_file_path>

Features:
- Card-style layout matching optimize-preview-html.md
- Only supports excluding (deleting) products — no field editing
- Heartbeat every 5 s; server auto-exits after 10 min of inactivity
- Browser window close triggers a /close request for immediate shutdown
- Only listens on 127.0.0.1 (localhost)
"""

import csv
import json
import os
import socket
import sys
import threading
import time
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# ── Configuration ──────────────────────────────────────────────────────────────
HEARTBEAT_TIMEOUT_SECONDS = 600  # 10 minutes
HEARTBEAT_CHECK_INTERVAL = 10   # check every 10 s

# ── Global state ───────────────────────────────────────────────────────────────
csv_file_path = ""
last_heartbeat_time = time.time()
server_instance = None

# Field display name mapping
FIELD_DISPLAY_NAMES = {
    "title": "Title",
    "price": "Price",
    "leadTime": "Lead Time",
    "moq": "MOQ",
    "unitWeight": "Unit Weight",
    "unitSize": "Unit Size",
    "shippingTemplate": "Shipping Template",
    "category": "Category",
    "description": "Description",
    "properties": "Properties",
    "images": "Images",
    "inventory": "Inventory",
    "pis": "PIS",
}

# Fields that need truncation for display
LONG_TEXT_FIELDS = {"description", "properties", "images"}
LONG_TEXT_MAX_LENGTH = 120


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def read_csv_data(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
    if not rows:
        return [], []
    return rows[0], rows[1:]


def write_csv_data(file_path, headers, data_rows):
    with open(file_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(data_rows)


def _escape(text):
    """Escape HTML special characters."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _truncate(text, max_length=LONG_TEXT_MAX_LENGTH):
    """Truncate long text for display."""
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text


def _build_col_index(headers):
    """Build a dict mapping column name to index."""
    return {h: i for i, h in enumerate(headers)}


def _get(row, col_map, col_name, default=""):
    """Safely get a value from a row by column name."""
    idx = col_map.get(col_name)
    if idx is None or idx >= len(row):
        return default
    return row[idx] or default


def build_html(headers, data_rows, port):
    """Generate a card-style review page matching MD preview style."""
    col_map = _build_col_index(headers)

    # Collect before/after field pairs (excluding pis, shown separately)
    before_fields = []
    for h in headers:
        if h.startswith("before."):
            field_name = h[len("before."):]
            if field_name != "pis":
                before_fields.append(field_name)

    # Count optimized products and collect optimized field names
    optimized_count = 0
    optimized_fields_set = set()
    for row in data_rows:
        excluded = _get(row, col_map, "isExcluded", "false").lower() == "true"
        if excluded:
            continue
        has_after = False
        for field_name in before_fields:
            after_val = _get(row, col_map, f"after.{field_name}")
            if after_val:
                has_after = True
                optimized_fields_set.add(field_name)
        if has_after:
            optimized_count += 1

    # Build product cards
    cards_html = ""
    for row_idx, row in enumerate(data_rows):
        product_id = _get(row, col_map, "productId") or _get(row, col_map, "generalProductId")
        excluded = _get(row, col_map, "isExcluded", "false").lower() == "true"
        title = _get(row, col_map, "before.title", "Untitled Product")
        image_url = _get(row, col_map, "absSummImageUrl")
        before_pis = _get(row, col_map, "before.pis")
        after_pis = _get(row, col_map, "after.pis")

        # Check if this product has any after values
        has_after = False
        for field_name in before_fields:
            if _get(row, col_map, f"after.{field_name}"):
                has_after = True
                break

        if not has_after and not excluded:
            continue

        # Card style for excluded products
        card_style = "opacity:0.4;pointer-events:none;" if excluded else ""
        excluded_badge = (
            '<span style="display:inline-block;background:#FF4D4F;color:#fff;'
            'font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;'
            'margin-left:8px;">EXCLUDED</span>'
            if excluded else ""
        )

        # Image
        image_html = ""
        if image_url:
            image_html = (
                f'<img src="{_escape(image_url)}" style="width:80px;height:80px;'
                f'object-fit:cover;border-radius:8px;border:1px solid #EEE;" />'
            )

        # PIS display (preview card style)
        pis_html = ""
        if after_pis:
            improved = ""
            try:
                if before_pis and float(after_pis) > float(before_pis):
                    improved = (
                        '<span style="color:#00875A;font-size:12px;margin-left:6px;">'
                        '↑ Improved</span>'
                    )
            except ValueError:
                pass
            pis_html = (
                f'<div style="margin-top:4px;">'
                f'<span style="display:inline-block;background:#E3FCEF;color:#00875A;'
                f'font-size:12px;font-weight:600;padding:2px 8px;border-radius:10px;">'
                f'PIS: {_escape(after_pis)}</span>'
                f'{improved}</div>'
            )

        # Build comparison table rows
        table_rows = ""
        for field_name in before_fields:
            before_val = _get(row, col_map, f"before.{field_name}")
            after_val = _get(row, col_map, f"after.{field_name}")
            if not after_val:
                continue

            display_name = FIELD_DISPLAY_NAMES.get(field_name, field_name)
            before_display = _escape(
                _truncate(before_val) if field_name in LONG_TEXT_FIELDS else before_val
            )
            after_display = _escape(
                _truncate(after_val) if field_name in LONG_TEXT_FIELDS else after_val
            )

            table_rows += (
                f'<tr style="border-bottom:1px solid #F5F5F5;">'
                f'<td style="padding:8px 0;color:#333;font-weight:500;width:20%;'
                f'vertical-align:top;">{display_name}</td>'
                f'<td style="padding:8px 0;color:#696969;width:40%;vertical-align:top;'
                f'word-break:break-word;">{before_display}</td>'
                f'<td style="padding:8px 0;width:40%;vertical-align:top;'
                f'word-break:break-word;"><span style="color:#00875A;font-weight:600;">'
                f'{after_display}</span></td>'
                f'</tr>\n'
            )

        # Exclude button
        delete_btn = ""
        if not excluded:
            delete_btn = (
                f'<button class="btn-exclude" onclick="excludeProduct({row_idx})" '
                f'title="Exclude this product from optimization">✕ Exclude</button>'
            )

        cards_html += f'''<div class="product-card" id="card-{row_idx}" style="{card_style}">
  <div class="card-header">
    <div style="display:flex;align-items:center;gap:12px;flex:1;">
      {image_html}
      <div>
        <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:4px;">
          {_escape(_truncate(title, 80))}
        </div>
        <div style="color:#888;font-size:12px;">ID: {_escape(product_id)}{excluded_badge}</div>
        {pis_html}
      </div>
    </div>
    {delete_btn}
  </div>
  <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;">
    <tr style="border-bottom:1px solid #EEE;">
      <th style="text-align:left;padding:8px 0;color:#696969;width:20%;">Field</th>
      <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">Before</th>
      <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">After</th>
    </tr>
    {table_rows}
  </table>
</div>
'''

    optimized_fields_display = ", ".join(
        FIELD_DISPLAY_NAMES.get(f, f) for f in sorted(optimized_fields_set)
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Product Optimization Review</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5; padding: 0;
  }}
  .toolbar {{
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 2px solid #e0e0e0;
    padding: 12px 24px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }}
  .toolbar h1 {{ font-size: 18px; color: #333; flex: 1; }}
  .btn {{
    padding: 8px 20px; border: none; border-radius: 6px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s;
  }}
  .btn-save {{ background: #00875A; color: #fff; }}
  .btn-save:hover {{ background: #006644; }}
  .btn-save:disabled {{ background: #d9d9d9; cursor: not-allowed; }}
  .btn-close {{ background: #666; color: #fff; }}
  .btn-close:hover {{ background: #444; }}
  .status {{ font-size: 13px; color: #888; }}
  .status.saved {{ color: #00875A; }}
  .status.error {{ color: #FF4D4F; }}
  .container {{ max-width: 960px; margin: 0 auto; padding: 24px; }}
  .summary {{
    background: #fff; border-radius: 12px; padding: 16px 20px;
    margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    font-size: 14px; color: #555;
  }}
  .summary strong {{ color: #333; }}
  .product-card {{
    background: #fff; border-radius: 12px; padding: 20px;
    margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: all 0.3s;
  }}
  .product-card:hover {{ box-shadow: 0 2px 12px rgba(0,0,0,0.1); }}
  .card-header {{
    display: flex; align-items: flex-start; justify-content: space-between;
  }}
  .btn-exclude {{
    padding: 6px 14px; border: 1px solid #FF4D4F; border-radius: 6px;
    background: #fff; color: #FF4D4F; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }}
  .btn-exclude:hover {{ background: #FF4D4F; color: #fff; }}
  .footer {{
    text-align: center; padding: 20px; color: #999; font-size: 13px;
  }}
</style>
</head>
<body>

<div class="toolbar">
  <h1>📋 Product Optimization Review</h1>
  <span class="status" id="status">Ready</span>
  <button class="btn btn-save" id="saveBtn" onclick="saveData()">💾 Save Changes</button>
  <button class="btn btn-close" onclick="closeEditor()">✕ Close</button>
</div>

<div class="container">
  <div class="summary">
    <strong>{optimized_count}</strong> products optimized, fields: {optimized_fields_display or "none"}
    <br>
    <span style="color:#999;font-size:12px;">
      Click "✕ Exclude" to remove a product from optimization. Save to apply changes.
    </span>
  </div>
  {cards_html}
  <div class="footer">End of optimization results</div>
</div>

<script>
const BASE = "http://127.0.0.1:{port}";
let dirty = false;
let excludedRows = new Set();

// Heartbeat
setInterval(() => {{
  fetch(BASE + "/heartbeat").catch(() => {{}});
}}, 5000);

function excludeProduct(rowIdx) {{
  if (!confirm('Exclude this product from optimization?')) return;
  excludedRows.add(rowIdx);
  const card = document.getElementById('card-' + rowIdx);
  if (card) {{
    card.style.opacity = '0.4';
    card.style.pointerEvents = 'none';
  }}
  dirty = true;
  document.getElementById('status').textContent = 'Unsaved changes';
  document.getElementById('status').className = 'status';
}}

async function saveData() {{
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  btn.disabled = true;
  status.textContent = 'Saving...';
  status.className = 'status';

  try {{
    const resp = await fetch(BASE + "/save", {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify({{ excludedRows: Array.from(excludedRows) }})
    }});
    const result = await resp.json();
    if (result.success) {{
      status.textContent = '✓ Saved at ' + new Date().toLocaleTimeString();
      status.className = 'status saved';
      dirty = false;
    }} else {{
      status.textContent = '✗ Save failed: ' + result.error;
      status.className = 'status error';
    }}
  }} catch (e) {{
    status.textContent = '✗ Save failed: ' + e.message;
    status.className = 'status error';
  }}
  btn.disabled = false;
}}

function closeEditor() {{
  if (dirty && !confirm('You have unsaved changes. Close anyway?')) return;
  fetch(BASE + "/close").catch(() => {{}});
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;'
    + 'height:80vh;font-size:20px;color:#888;">Editor closed. You can close this tab.</div>';
}}

window.addEventListener('beforeunload', (e) => {{
  fetch(BASE + "/close").catch(() => {{}});
  if (dirty) {{
    e.preventDefault();
    e.returnValue = '';
  }}
}});
</script>
</body>
</html>"""
    return html


class EditorHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        global last_heartbeat_time
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "":
            last_heartbeat_time = time.time()
            headers, data_rows = read_csv_data(csv_file_path)
            html = build_html(headers, data_rows, self.server.server_port)
            self._respond(200, "text/html", html)

        elif path == "/heartbeat":
            last_heartbeat_time = time.time()
            self._respond(200, "application/json", '{"ok":true}')

        elif path == "/close":
            self._respond(200, "application/json", '{"ok":true}')
            print("[csv-editor] Browser closed. Shutting down server.")
            threading.Thread(target=self._shutdown, daemon=True).start()

        else:
            self._respond(404, "text/plain", "Not Found")

    def do_POST(self):
        global last_heartbeat_time
        last_heartbeat_time = time.time()
        parsed = urlparse(self.path)

        if parsed.path == "/save":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
                excluded_rows = set(payload.get("excludedRows", []))

                headers, data_rows = read_csv_data(csv_file_path)
                col_map = {h: i for i, h in enumerate(headers)}
                is_excluded_idx = col_map.get("isExcluded")

                if is_excluded_idx is not None:
                    for row_idx in excluded_rows:
                        if row_idx < len(data_rows):
                            data_rows[row_idx][is_excluded_idx] = "true"

                write_csv_data(csv_file_path, headers, data_rows)
                excluded_count = len(excluded_rows)
                print(f"[csv-editor] CSV saved: {csv_file_path}, excluded {excluded_count} products")
                self._respond(
                    200, "application/json",
                    json.dumps({"success": True, "excludedCount": excluded_count})
                )
            except Exception as e:
                print(f"[csv-editor] Save error: {e}")
                self._respond(
                    500, "application/json",
                    json.dumps({"success": False, "error": str(e)})
                )
        else:
            self._respond(404, "text/plain", "Not Found")

    def _respond(self, code, content_type, body):
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def _shutdown(self):
        time.sleep(0.5)
        if server_instance:
            server_instance.shutdown()


def heartbeat_watchdog():
    """Background thread: shut down server if no heartbeat for HEARTBEAT_TIMEOUT_SECONDS."""
    while True:
        time.sleep(HEARTBEAT_CHECK_INTERVAL)
        elapsed = time.time() - last_heartbeat_time
        if elapsed > HEARTBEAT_TIMEOUT_SECONDS:
            print(f"[csv-editor] No heartbeat for {int(elapsed)}s. Auto-shutting down.")
            if server_instance:
                server_instance.shutdown()
            break


def main():
    global csv_file_path, server_instance

    if len(sys.argv) < 2:
        print("Usage: python3 csv-editor-server.py <csv_file_path>")
        sys.exit(1)

    csv_file_path = os.path.abspath(sys.argv[1])
    if not os.path.isfile(csv_file_path):
        print(f"[csv-editor] Error: file not found: {csv_file_path}")
        sys.exit(1)

    port = find_free_port()
    server_instance = HTTPServer(("127.0.0.1", port), EditorHandler)

    watchdog = threading.Thread(target=heartbeat_watchdog, daemon=True)
    watchdog.start()

    url = f"http://127.0.0.1:{port}"
    print(f"[csv-editor] Server started at {url}")
    print(f"[csv-editor] Reviewing: {csv_file_path}")
    print(f"[csv-editor] Auto-shutdown after {HEARTBEAT_TIMEOUT_SECONDS}s of inactivity.")

    webbrowser.open(url)

    try:
        server_instance.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server_instance.server_close()
        print("[csv-editor] Server stopped.")


if __name__ == "__main__":
    main()
