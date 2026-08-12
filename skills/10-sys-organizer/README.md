# 10-sys-organizer — 系统整理器（开源版）

> Operit 平台 JS Sandbox Package：四大维护领域一键巡检。
> 作品集第 10 件，定位：**Harness 维护工具**（L1 记忆/文件的日常巡检与整理）。

## 功能（5 工具）

| 工具 | 功能 | 数据来源 |
|---|---|---|
| `organize_chats` | 对话整理：未命名/短对话检测、疑似重复对、分类分组建议 | extended_chat:list_chats |
| `consolidate_memory` | 记忆归簇：孤立节点、同类多版本冲突、文件夹错位 | query_memory("*") |
| `organize_storage` | 空间整理：散落文件、扩展名→目录映射、临时文件、不动区域过滤 | find 命令 |
| `verify_consistency` | 架构复检：链接悬挂/重复边、版本引用矛盾、包地图 checksum | query_memory_links + list_sandbox_packages |
| `run_all` | 一键全量巡检：4 域汇总 + 统一执行编排表 | 以上全部 |

## 设计模式：分析器

**AI 采集原始数据传入 → 包内按内置规范分析评分 → 输出结构化报告 + 执行编排表**

- `immediate`：AI 直接执行（无风险）
- `read_content`：先读文件/对话内容再判定（防文件名误判）
- `need_user`：列出清单等用户拍板（破坏性操作必须确认）

> ⚠️ 只读巡检：本包所有工具不执行任何修改。

## 安装（Operit 平台）

1. 将 `sys_organizer.js` 放入平台可访问目录
2. 让 AI 执行：`operit_editor:debug_install_js_package`（source_path 指向该文件）
3. 激活：`use_package("sys_organizer")`

## 配置自定义（重要）

本包内置**通用示例配置**，使用前请按你的实际情况修改文件顶部常量：

| 常量 | 说明 | 示例 |
|---|---|---|
| `CHAT_CATEGORIES` | 对话分类关键词表（10 类） | 游戏类加你的常玩游戏名 |
| `STORAGE_RULES` | 扩展名→目录映射 | 文档类映射到你的文档目录 |
| `NO_TOUCH_DIRS` | 不动区域（App/系统目录） | 加你的网盘/音乐App目录 |
| `TEMP_PATTERNS` | 临时文件特征 | 默认已覆盖 .tmp/.log/隐藏文件 |
| `HARNESS_CHECKS` | 一致性检查项清单 | 默认已覆盖 Harness 核心检查 |

文件索引路径提示（`/sdcard/文档/文件位置索引.md`）请改为你的索引文档位置，或删除对应检查项。

## 与 Kizuna 的配合

- SessionStart 钩子第 6 项引用文件索引 → 本包的 `organize_storage` 负责生成/维护索引所需的目录扫描
- 遵循 `[规则]文件查找规范`：find 不到 ≠ 数据被清理
- 输出报告遵循铁律规则2：破坏性操作必须用户确认

## 许可证

MIT © Cuiyi-Srama（与 Kizuna Harness 一致）

## 变更日志

- v1.0.0-open (2026-08-13)：开源首版。配置已泛化（专属数据替换为通用示例），引擎逻辑与本地版一致。
