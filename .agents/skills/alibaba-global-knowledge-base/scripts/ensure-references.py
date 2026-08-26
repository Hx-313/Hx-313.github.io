#!/usr/bin/env python3
"""
ensure-references.py
懒加载知识库 references 文件：本地无文件时从远程下载 zip 并解压。
用法：python3 ensure-references.py
退出码：0 = references 就绪，1 = 下载/解压失败

纯 Python 标准库实现，跨平台兼容（macOS / Windows / Linux）。
"""

import sys
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

# ── 常量 ──────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
REF_DIR = SKILL_DIR / "references"
ZIP_URL = "https://sc01.alicdn.com/H01114e47f2764695bdc6c5bd222d8bf0b.zip"
ZIP_TMP = SKILL_DIR / ".references-tmp.zip"
VERSION_FILE = REF_DIR / ".version"

# ── 预留版本号机制 ────────────────────────────────────
# 当前无远程版本控制，仅做本地记录。
# 未来如需强制更新，可在此处设置 EXPECTED_VERSION 并与 VERSION_FILE 比对。
EXPECTED_VERSION = ""  # 留空 = 不做版本校验，仅检查文件是否存在

CONNECT_TIMEOUT = 15  # 秒
DOWNLOAD_TIMEOUT = 180  # 秒
CHUNK_SIZE = 1024 * 64


def count_md_files() -> int:
    """统计 references 目录下一级的 .md 文件数量。"""
    return sum(1 for p in REF_DIR.glob("*.md") if p.is_file())


def check_need_download() -> bool:
    """判断是否需要下载 references。"""
    # 目录不存在
    if not REF_DIR.is_dir():
        return True

    # 目录存在但没有 .md 文件
    if count_md_files() == 0:
        return True

    # 版本校验（仅当 EXPECTED_VERSION 非空时生效）
    if EXPECTED_VERSION:
        if VERSION_FILE.is_file():
            current_version = VERSION_FILE.read_text(encoding="utf-8").strip()
            if current_version != EXPECTED_VERSION:
                print(
                    f"Version mismatch: local={current_version}, "
                    f"expected={EXPECTED_VERSION}. Re-downloading..."
                )
                return True
        else:
            return True

    return False


def download_zip() -> None:
    """从远程下载 zip 文件到临时路径。"""
    start_time = time.monotonic()

    with urllib.request.urlopen(ZIP_URL, timeout=CONNECT_TIMEOUT) as response:
        with ZIP_TMP.open("wb") as fp:
            while True:
                if time.monotonic() - start_time > DOWNLOAD_TIMEOUT:
                    raise TimeoutError(
                        f"Download exceeded max time ({DOWNLOAD_TIMEOUT}s)."
                    )

                chunk = response.read(CHUNK_SIZE)
                if not chunk:
                    break
                fp.write(chunk)


def extract_zip_safely() -> None:
    """安全解压 zip 到 SKILL_DIR，避免 zip slip。

    使用 metadata_encoding='utf-8' 强制以 UTF-8 解码文件名，
    解决 macOS 压缩工具未设置 ZIP UTF-8 flag (bit 11) 导致
    Python zipfile 回退到 CP437 编码产生中文乱码的问题。
    """
    target_root = SKILL_DIR.resolve()
    with zipfile.ZipFile(ZIP_TMP, "r", metadata_encoding="utf-8") as zf:
        for info in zf.infolist():
            target_path = (target_root / info.filename).resolve()
            if target_path != target_root and target_root not in target_path.parents:
                raise ValueError(f"Unsafe zip entry path: {info.filename}")

        zf.extractall(target_root)


def write_version() -> None:
    """写入版本号（如果 EXPECTED_VERSION 非空）。"""
    if EXPECTED_VERSION:
        VERSION_FILE.write_text(EXPECTED_VERSION + "\n", encoding="utf-8")
    elif VERSION_FILE.exists():
        # 禁用版本校验时删除历史版本标记，避免后续行为歧义。
        VERSION_FILE.unlink()


def main() -> int:
    # ── 检查是否已就绪 ──────────────────────────────
    if not check_need_download():
        count = count_md_files()
        print(f"OK: references already populated ({count} files). Skip download.")
        return 0

    # ── 下载 ────────────────────────────────────────
    print("Downloading knowledge base references from remote...")
    REF_DIR.mkdir(parents=True, exist_ok=True)

    try:
        download_zip()
        extract_zip_safely()
        write_version()
    except (
        TimeoutError,
        urllib.error.URLError,
        urllib.error.HTTPError,
        OSError,
        zipfile.BadZipFile,
        ValueError,
    ) as exc:
        print(f"ERROR: Failed to download or unzip references: {exc}")
        return 1
    finally:
        if ZIP_TMP.exists():
            try:
                ZIP_TMP.unlink()
            except OSError:
                # 清理失败不影响主流程结果。
                pass

    # ── 验证 ────────────────────────────────────────
    count = count_md_files()
    if count == 0:
        print(f"ERROR: Unzip succeeded but no .md files found in {REF_DIR}")
        return 1

    print(f"OK: Download complete. {count} reference files ready.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
