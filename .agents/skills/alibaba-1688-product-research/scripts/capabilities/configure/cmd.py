#!/usr/bin/env python3
"""AK 配置命令 — CLI 入口"""

COMMAND_NAME = "configure"
COMMAND_DESC = "配置 AK"

import os
import sys

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..')))

from _output import print_output, print_error
from _const import OPENCLAW_CONFIG_PATH as CONFIG_PATH
from capabilities.configure.service import (
    validate_ak, configure_via_gateway, configure_via_file,
    check_existing_config, get_config_detail,
)


HELP_TEXT = """用法: cli.py configure [AK] [选项]

配置 1688 商品搜索的 API Key (AK)。

参数:
  AK              要配置的 Access Key（至少 32 位）。省略则查看当前配置状态。

选项:
  --detail, -d    显示详细配置信息（AK 来源、存储位置、各条目状态）
  --help, -h      显示此帮助信息

示例:
  cli.py configure                    查看当前 AK 配置状态
  cli.py configure --detail           查看详细配置信息
  cli.py configure YOUR_AK_HERE       配置新的 AK

获取 AK:
  如果还没有 API_KEY，请前往 https://clawhub.1688.com/ 获取。
"""


def _mask_ak(ak: str) -> str:
    if len(ak) >= 8:
        return f"{ak[:4]}****{ak[-4:]}"
    return "****"


def main():
    try:
        # --help / -h → 输出帮助信息
        if len(sys.argv) >= 2 and sys.argv[1] in ("--help", "-h"):
            print_output(True, HELP_TEXT.strip(), {"help": True})
            return

        # --detail / -d → 输出详细配置信息
        if len(sys.argv) >= 2 and sys.argv[1] in ("--detail", "-d"):
            detail = get_config_detail()
            lines = ["**AK 配置详情**\n"]

            # 当前生效的 AK
            if detail["active_ak"]:
                lines.append(f"当前生效 AK: `{detail['active_ak']}`（来源: {detail['active_source']}）\n")
            else:
                lines.append("当前生效 AK: **无**\n")

            # 环境变量
            env = detail["env_var"]
            lines.append(f"**环境变量** `ALI_1688_AK`: {'`' + env['value'] + '`' if env['available'] else '未设置'}")

            # 写入路径
            lines.append(f"\n**写入路径**: `{detail['write_path']}`")

            # 所有候选配置文件
            lines.append(f"\n**候选配置文件** ({len(detail['config_files'])} 个):")
            for cf in detail["config_files"]:
                marker = " ← 写入目标" if cf["is_write_target"] else ""
                if not cf["exists"]:
                    lines.append(f"  ⬜ `{cf['path']}` (不存在){marker}")
                elif cf.get("error"):
                    lines.append(f"  ⚠️ `{cf['path']}` (读取错误: {cf['error']}){marker}")
                elif cf["entries"]:
                    has_any = cf["available"]
                    icon = "✅" if has_any else "❌"
                    lines.append(f"  {icon} `{cf['path']}`{marker}")
                    for name, info in cf["entries"].items():
                        status = "✅" if info["has_ak"] else "❌"
                        ak_display = info["apiKey"] if info["apiKey"] else "(无)"
                        lines.append(f"    {status} `{name}`: apiKey=`{ak_display}`")
                else:
                    lines.append(f"  ❌ `{cf['path']}` (无 skill 条目){marker}")

            # Gateway
            lines.append(f"\n**Gateway**: `{detail['gateway']['url']}`")

            md = "\n".join(lines)
            print_output(True, md, {"detail": detail})
            return

        has_existing, existing_ak = check_existing_config()

        # 无参数 → 查看状态
        if len(sys.argv) < 2:
            if has_existing:
                src = ("环境变量（已生效）" if os.environ.get("ALI_1688_AK")
                       else "OpenClaw 配置（新会话/重载后生效）")
                md = f"✅ AK 已配置: `{_mask_ak(existing_ak)}`（来源: {src}）\n\n使用 `cli.py configure --detail` 查看详细配置信息。"
            else:
                md = "❌ 尚未配置 AK\n\n如果还没有 API_KEY，请前往 https://clawhub.1688.com/ 获取。\n\n运行: `cli.py configure YOUR_AK`"
            print_output(has_existing, md, {"configured": has_existing})
            return

        ak = sys.argv[1].strip()
        is_valid, error_msg = validate_ak(ak)
        if not is_valid:
            print_output(False, f"❌ {error_msg}", {"configured": False})
            return

        # 始终写入本地配置文件（确保跨会话可读），同时尝试通知 Gateway 当前会话立即生效
        file_ok, file_err = configure_via_file(ak)
        gateway_ok, gateway_err = configure_via_gateway(ak)
        gateway_url = os.environ.get("OPENCLAW_GATEWAY_URL", "http://localhost:18789")
        write_ok = file_ok or gateway_ok

        if not write_ok:
            reasons = []
            if file_err:
                reasons.append(f"本地文件: {file_err}")
            if gateway_err:
                reasons.append(f"Gateway: {gateway_err}")
            detail_msg = "\n".join(f"  - {r}" for r in reasons)
            print_output(False,
                         f"❌ AK 写入失败，所有存储通道均不可用。\n\n失败原因:\n{detail_msg}",
                         {"configured": False, "file_error": file_err, "gateway_error": gateway_err})
            return

        # 构建成功消息，只告知成功写入的位置
        lines = [f"✅ AK 已保存: `{_mask_ak(ak)}`\n"]
        if file_ok:
            lines.append(f"- 本地配置: 已写入 `{CONFIG_PATH}`")
        if gateway_ok:
            lines.append(f"- Gateway: 已同步 `{gateway_url}`")

        lines.append("")
        if file_ok and gateway_ok:
            lines.append("当前会话和后续新会话均可直接使用。")
        elif file_ok:
            lines.append("后续新会话可直接使用。如需当前会话立即生效，请新开会话或执行：`openclaw secrets reload`")
        else:
            lines.append("仅通过 Gateway 写入，若新会话仍提示 AK 未配置，请重新执行 configure。")

        md = "\n".join(lines)
        print_output(True, md, {"configured": True, "file_ok": file_ok, "gateway_ok": gateway_ok})
    except Exception as e:
        print_error(e, {"configured": False})


if __name__ == "__main__":
    main()
