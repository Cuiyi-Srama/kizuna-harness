# Kizuna Harness — 通用 Agent 治理框架
> 仓库：`kizuna-harness` | 名称来源：AI 命名（日语「绊」= 纽带）+ Harness（治理框架）
> 基于 Anthropic 官方工程博客与社区公开资料重建。
> **平台中立**：核心方法论与平台无关；文档中的 Operit 实现（query_memory / use_package / 世界书 / enforcement: global）为参考实现，其他平台可映射到对应机制（如 Claude Code 的 CLAUDE.md / hooks）。

## 这是什么
一套完整的 **Agent 治理框架**，把"犯错 → 修正 → 永久工程化"的循环落地到 AI 运行环境：
- **10 事件 Hook 注册表**（3 类型 × 决策三分法）— 会话开始到回复结束的全生命周期约束
- **4 型记忆分类 + 精选规则** — 记忆按 user/project/feedback/reference 分型，≤5 条按需注入
- **反退化闭环** — 错误模式检测 → 分析 → 持久化 → 自动激活（铁律 L1→L4 升级路径）
- **经验纠错三路径** — 被动触发 / 版本变更自检 / 工具缺陷触发，统一修正标记
- **确定性路由表** — 按问题特征路由到最相关记忆源，检索前先缩小范围
- **跨卡入口模板** — 世界书标准条目，新角色卡 10 秒接入
- **铁律强制执行清单** — 6 条核心规则 + 用户约束包（原则级，防通胀；操作细节下沉至 [规则] 层）

## DSH 集成（2026-08-14）
DeepSeek Harness（DSH，github.com/deepseek-ai/deepseek-harness，v0.1 预览版，MIT）开源后，本框架已完成官方实现对照：
- **双轨策略**：Kizuna 主政宿主平台（约束层），DSH 作独立执行层（沙箱/工具链/子代理）
- **10事件 ↔ 插件映射**：见 `references/dsh-mapping.md`（Kizuna 每个组件在 DSH 都有插件级等价物）
- **替换/融合决策**：见 `references/dsh-integration.md`（维持双轨，不替换；等 DSH 稳定版再评估桥接）
- **关键发现**：DSH 的 `dsh-invariants` / `dsh-compaction` / `dsh-token-meter` 是 Kizuna DeterministicVerifier / SummaryPrompt / ContextBudget 的官方等价实现

## 安装（一键 + 一步粘贴，约 3 分钟）
### 第 1 步：安装技能
1. 下载本 zip 包
2. 解压后将 `05-kizuna-harness` 文件夹放入平台 skills 目录（如 `/sdcard/Download/Operit/skills/`）
### 第 2 步：一键安装（对 AI 说一句话）
对 AI 说 **"安装 Kizuna"**，AI 按 `INSTALL.md` 协议自动完成：
- 运行 `install.py` → 自动检测平台 + 校验完整性 + 生成导入清单
- 读取 `install_manifest.json` → 自动导入记忆（[铁律]/[Harness]/[规则] 前缀，当前 9 条）
- 展示世界书条目 → 你只需粘贴到角色卡（激活方式：常驻）
- **配置摘要额外提示词**（Operit）→ `install.py --print-summary-prompt` 输出，粘贴到平台配置（PreCompact 确定性实现）
- 执行验证清单 → 报告安装结果
### 第 3 步：平台适配（自动）
安装器自动检测平台并输出对应指引（见 `adapters/`）：
- **Operit**：参考实现，完整能力（记忆/世界书/全局强制）
- **Claude Code**：CLAUDE.md + settings.json hooks（Hook 为系统级执行，更强）
- **通用平台**：system prompt 注入（软强制，能力受限）
### 验证
- 新会话首条消息：AI 是否自动查询了铁律？
- 说"检查马具"：AI 能否列出 10 事件注册表？
- 说"卸载 Kizuna"：按清单删除对应记忆

## 文件结构
```
05-kizuna-harness/
├── SKILL.md              — 主入口（架构 + 使用指引）
├── README.md             — 本文件（安装手册）
├── LICENSE               — MIT
├── references/           — 记忆导入文档集（11 个组件）
│   ├── ironlaw-v5.md     — 铁律 v5.0（社区版，已泛化个人约束）
│   ├── kizuna-overview.md
│   ├── hooks-registry.md — v1.9（PreCompact 确定性 + 三级分层）
│   ├── memory-taxonomy.md
│   ├── memory-selector.md
│   ├── anti-regression.md
│   ├── cross-card-entry.md
│   ├── summary-prompt.md — 对话摘要额外提示词（v1.4，两轮验证通过）
│   ├── dsh-mapping.md    — Kizuna ↔ DSH 插件映射表（2026-08-14）
│   ├── dsh-integration.md
├── dsh/                 — DSH × Kizuna 注入层（2026-08-14）
│   ├── kizuna-injection.yml — cordis patch（权限/模型/技能/Shell 四项配置）
│   ├── README.md            — DSH 注入层安装说明
│   └── skills/kizuna-hooks/ — Kizuna 10事件 Hook 方法论技能（DSH 技能格式） — DSH 双轨决策基线（2026-08-14）
│   └── memory-consistency.md — 记忆一致性维护规范（单一事实源/去版本号）
└── worldbook/
    └── harness-hooks.md  — 世界书条目（扳机式 v1.1，8 条精简，可直接粘贴）
```

## 作品集（本仓库 skills/ 目录）
除核心框架外，本仓库还收录配套作品（全部 MIT）：
| # | 作品 | 说明 |
|---|------|------|
| 01 | self-evolution-engine | 自进化引擎（5维自我批判，全局强制） |
| 02 | sub-agent-troubleshooting | 子Agent故障排查手册 |
| 03 | anti-hallucination | 反幻觉协议（全局强制） |
| 04 | harness-verifier | 确定性验证器（55行JS，code_runner调用） |
| 05 | kizuna-harness | 本框架（根目录） |
| 06 | task-orchestration-system | 任务规划与执行系统 |
| 07 | self-evolution-action-framework | 自进化行动框架（S1-S5策略） |
| 08 | enforcement-engine | 强制规则引擎（含RULES_REGISTRY，全局强制） |
| 09 | chat-grouping | 对话分组整理 |
| 10 | sys-organizer | 系统巡检（对话/记忆/存储/架构一致性 + 索引同步） |

## 许可证
MIT © 2026 Cuiyi-Srama — 详见 LICENSE
