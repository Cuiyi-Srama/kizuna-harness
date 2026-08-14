# Kizuna Harness ↔ DeepSeek Harness (DSH) 插件映射表 v1.0（社区版）
> 2026-08-14 建立。目的：两套 Harness 理念融合的设计依据。
> DSH（github.com/deepseek-ai/deepseek-harness，v0.1 开发者预览版，MIT，TypeScript）是 DeepSeek 官方开源的 Agent 运行时框架，核心设计"一切皆插件"（模型/工具/技能/会话/沙箱/存储/循环/调度/UI 全部可替换），由 Cordis 驱动。
> 定位差异：Kizuna 是约束层（寄生宿主平台），DSH 是执行层（独立进程）。

## 一、10事件 Hook 映射

| # | Kizuna 事件 | DSH 对应插件/机制 | 融合方式 |
|---|------------|------------------|---------|
| 1 | SessionStart（铁律/项目/偏好注入） | dsh-session + dsh-session-persistence + dsh-system-prompt + dsh-persona | 铁律+快照+偏好 → system-prompt 插件；persona 管角色 |
| 2 | UserPromptSubmit（澄清+精选记忆） | dsh-agent-loop + dsh-agent-instructions + dsh-user-questions | 精选记忆 → instructions 注入；user-questions 澄清 |
| 3 | PermissionRequest（意图匹配分级） | dsh-user-approval + dsh-permission-presets + dsh-scope | 5级许可 → presets 预设；approval 落地 |
| 4 | PreToolUse（路径校验/危险命令） | dsh-invariants + dsh-sandbox-policy + dsh-fs-observation-policy + dsh-scope | invariants = DeterministicVerifier 的官方版（代码级确定性） |
| 5 | PostToolUse（产出验证） | dsh-compaction-tool-result-pruner + dsh-output-retention + dsh-tool-fs | 工具结果修剪 + 输出保留 |
| 6 | PostToolUseFailure（失败分析） | dsh-llm-retry + dsh-repeat-tool-reminder | 自动重试 + 重复工具提醒 |
| 7 | Notification（子Agent完成） | dsh-session-telemetry + dsh-client-connection + dsh-message-feedback | 遥测/连接事件 → 推送 |
| 8 | Stop（Token简报/任务核查） | dsh-token-meter + dsh-session-stats + dsh-command-feedback | token 计量 + 会话统计 |
| 9 | PreCompact（保存状态+摘要提示词） | dsh-compaction + dsh-compaction-basic + dsh-session-checkpoint-policy + dsh-command-compact | SummaryPrompt 可直接作为 compaction 提示词模板 |
| 10 | PostCompact（恢复状态） | dsh-session-persistence-jsonl + dsh-session-projection | 持久化恢复 + 会话投影 |

## 二、Kizuna 组件 → DSH 映射

| Kizuna 组件 | DSH 对应 | 备注 |
|------------|---------|------|
| MemoryTaxonomy（4型分类） | dsh-storage-domain + dsh-session-persistence | 存储域定义记忆分类 |
| MemorySelector（精选规则） | dsh-agent-instructions | 注入时选择，逻辑移植 |
| SummaryPrompt 锚点机制 | dsh-compaction 提示词配置 | 直接复用，已验证 L1 机制 |
| DeterministicVerifier | dsh-invariants | 官方等价物 |
| PermissionManager（5级） | dsh-permission-presets + dsh-user-approval | 预设+批准闭环 |
| ContextBudget（Token经济学） | dsh-token-meter + dsh-compaction-tool-result-pruner | 官方实现 |
| DreamConsolidation | dsh-schedule + dsh-storage | 定时+存储，需自建逻辑 |
| SkillDiscovery（3层渐进） | dsh-skill + dsh-skill-filesystem + dsh-skill-badge | DSH 原生技能系统，更完整 |
| AntiRegression | dsh-invariants + dsh-session-checkpoint-policy | 检查点+不变量 |
| BackgroundCleanup | dsh-schedule | 调度插件 |

## 三、DSH 独有能力（可借鉴）
- 沙箱隔离：landlock-run 原生沙箱（node-addon-landlock-run）
- MCP 客户端：dsh-mcp-client（未来桥接点）
- 子代理：dsh-subagent 系列（fork/spawn/in-process 三种模式）
- 工作流：dsh-workflow + dsh-workflow-worker-thread
- 计划模式：dsh-plan-mode
- 会话查询：dsh-session-query-sqlite（SQLite 检索）
- 遥测：dsh-session-telemetry-otel（OpenTelemetry）
- 模型适配：dsh-llm-deepseek / dsh-llm-pi-ai

## 四、结论
1. DSH 是 Kizuna 设计思路的官方完整实现——每个组件在 DSH 都有插件级等价物，验证架构方向正确
2. Kizuna 强在绑定宿主平台能力，DSH 强在确定性执行（沙箱/权限/压缩均为代码级）
3. 融合路径：方法论层（本表）→ 配置层（SummaryPrompt 迁移为 compaction 模板）→ 桥接层（dsh-mcp-client，等 DSH 稳定版）
4. 最高价值复用：SummaryPrompt 锚点机制 → DSH compaction 提示词（同为 L1 确定性机制）

---
v1.0 | 2026-08-14 | 基于 DSH v0.1.0-rc.6 实测插件清单（195 插件）+ Kizuna HooksRegistry v1.9 | 社区版
