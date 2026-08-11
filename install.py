#!/usr/bin/env python3
"""Kizuna 一键安装器 — 平台检测 + 导入清单生成 + 完整性校验
用法: python3 install.py
输出: install_manifest.json（AI导入用）+ 世界书条目 + 平台安装指引
"""
import os, json, sys, re

BASE = os.path.dirname(os.path.abspath(__file__))
REFERENCES = os.path.join(BASE, "references")
WORLDBOOK = os.path.join(BASE, "worldbook")

DOCS = {
    "ironlaw-v5.md": ("[铁律] 强制执行清单 v5.0", "ironlaw"),
    "kizuna-overview.md": ("[Harness] Kizuna — 架构总览", "reference"),
    "hooks-registry.md": ("[Harness] HooksRegistry — 10事件注册表", "reference"),
    "memory-taxonomy.md": ("[Harness] MemoryTaxonomy — 4型分类规则", "reference"),
    "memory-selector.md": ("[Harness] MemorySelector — 精选规则", "reference"),
    "anti-regression.md": ("[Harness] AntiRegression — 反退化闭环", "reference"),
    "cross-card-entry.md": ("[Harness] 跨卡入口模板", "reference"),
    "memory-consistency.md": ("[规则] 记忆一致性维护规范 v1.0", "reference"),
}

VALID_PLATFORMS = ("operit", "claude-code", "generic")

def detect_platform():
    """平台检测：--platform 参数 > KIZUNA_PLATFORM 环境变量 > 自动检测"""
    # 1. 命令行参数（最高优先级）
    if len(sys.argv) > 1:
        p = None
        if sys.argv[1].startswith("--platform="):
            p = sys.argv[1].split("=", 1)[1]
        elif sys.argv[1] == "--platform" and len(sys.argv) > 2:
            p = sys.argv[2]
        if p:
            if p in VALID_PLATFORMS:
                print("[INFO] Platform specified via --platform: %s" % p)
                return p
            print("[WARN] Invalid --platform: %s (valid: %s)" % (p, "/".join(VALID_PLATFORMS)))
        else:
            print("[WARN] Unknown arg: %s (usage: python3 install.py [--platform operit|claude-code|generic])" % sys.argv[1])
    # 2. 环境变量（次优先级）
    env = os.environ.get("KIZUNA_PLATFORM", "")
    if env in VALID_PLATFORMS:
        print("[INFO] Platform via KIZUNA_PLATFORM: %s" % env)
        return env
    if env:
        print("[WARN] Invalid KIZUNA_PLATFORM: %s (valid: %s)" % (env, "/".join(VALID_PLATFORMS)))
    # 3. 自动检测（兜底）
    if os.path.exists("/sdcard/Download/Operit") or os.path.exists(os.path.expanduser("~/.operit")):
        return "operit"
    if os.path.exists(os.path.expanduser("~/.claude")) or os.path.exists("CLAUDE.md"):
        return "claude-code"
    return "generic"

def main():
    platform = detect_platform()
    print("Kizuna Harness Installer v1.2")
    print("Detected platform:", platform)
    print()

    # 1. 完整性校验
    missing = [d for d in DOCS if not os.path.exists(os.path.join(REFERENCES, d))]
    wb = os.path.join(WORLDBOOK, "harness-hooks.md")
    if not os.path.exists(wb):
        missing.append("worldbook/harness-hooks.md")
    if missing:
        print("[FAIL] Missing files:", missing)
        sys.exit(1)
    print("[OK] Integrity check passed (%d docs)" % len(DOCS))

    # 2. 生成导入清单（写 BASE 失败则写 cwd，再失败则输出到 stdout）
    manifest = []
    for doc, (title, mtype) in DOCS.items():
        with open(os.path.join(REFERENCES, doc), encoding="utf-8") as f:
            content = f.read()
        manifest.append({"title": title, "type": mtype, "content": content})
    manifest_json = json.dumps(manifest, ensure_ascii=False, indent=1)
    written = False
    for target in (os.path.join(BASE, "install_manifest.json"), os.path.join(os.getcwd(), "install_manifest.json")):
        try:
            with open(target, "w", encoding="utf-8") as f:
                f.write(manifest_json)
            print("[OK] Generated install_manifest.json (%d memories) -> %s" % (len(manifest), target))
            written = True
            break
        except OSError:
            continue
    if not written:
        print("[OK] Manifest (%d memories) printed below (AI can read directly):" % len(manifest))
        print(manifest_json[:2000])

    # 3. 世界书条目
    with open(wb, encoding="utf-8") as f:
        wb_content = f.read()
    print()
    print("=" * 50)
    print("WORLDBOOK ENTRY (paste to character card, mode: persistent)")
    print("=" * 50)
    m = re.search(r"```markdown\n(.*?)\n```", wb_content, re.S)
    if m:
        print(m.group(1))
    print("=" * 50)

    # 4. 平台安装指引
    adapter = os.path.join(BASE, "adapters", platform + ".md")
    print()
    print("Platform guide:", adapter)
    if os.path.exists(adapter):
        with open(adapter, encoding="utf-8") as f:
            print(f.read())

if __name__ == "__main__":
    main()