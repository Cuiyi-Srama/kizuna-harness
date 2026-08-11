---
name: kizuna-harness
description: >-
  基于 Anthropic 官方工程博客与社区公开资料重建的 AI 治理框架。
  实现 10 事件 Hook 注册表、4 阶段 Dream 记忆整合、反退化闭环与确定性验证器，
  将"犯错→修正→永久工程化"的循环落地到 Agent 运行环境。
  This skill should be used when the user asks to "搭建Harness"、"实现Hook系统"、
  "构建AI治理框架"、"反退化闭环"、"记忆整合"、"确定性验证"、"Kizuna",
  or needs a structured agent governance framework with hooks, memory consolidation,
  and regression prevention.
license: MIT
metadata:
  author: Cuiyi-Srama
  version: 2.1.0
  created: 2026-08-01
  last_reviewed: 2026-08-12
---

# Kizuna Harness — AI 治理框架

> 依据 Anthropic 官方工程博客与社区公开资料重建。
> 设计哲学：**"每次 agent 犯错，就把修正方案永久工程化进 agent 的运作环境里，让同样的错误不会再发生。"** — Mitchell Hashimoto

Harness 不做"建议"，做"强制执行"。模型推理前，正确的约束已经注入 context。

---

## 一、三层架构

```
L1: 单Agent运行时
  ├── SystemPrompt Assembler（22条件组件）
  ├── Hooks Engine（10事件×3类型）
  ├── Memory System（4型分类 + 精选Agent + Dream整合）
  ├── Skill System（3层渐进披露）
  ├── Permission Manager（5级模式）
  ├── Context Budget（多级压缩+断路器）
  └── Frustration Detection（Regex匹配）

L2: 多Agent协作框架
  ├── Coordinator（唯一用户接口）
  ├── Worker×N（不直接对话用户）
  ├── Evaluator（测试+4维评分）
  ├── State Classifier（working/blocked/done/failed）
  └── Sprint Contract（Generator↔Evaluator协商）

L3: 自我进化引擎
  ├── Dream Consolidation（4阶段: Orient→Gather→Consolidate→Prune）
  ├── Anti-Regression Loop（Detect→Analyze→Extract→Persist→Activate）
  └── Background Cleanup Agent（定期扫描→修复漂移）
```

## 二、10 事件 Hook 注册表

| # | 事件 | 触发时机 | 阻断能力 |
|---|------|---------|:--:|
| 1 | `SessionStart` | 会话开始 | ❌ |
| 2 | `UserPromptSubmit` | 用户每次提交消息 | ❌ |
| 3 | `PermissionRequest` | 工具调用前权限判断 | ✅ |
| 4 | `PreToolUse` | 工具执行前 | ✅ |
| 5 | `PostToolUse` | 工具执行成功后 | ❌ |
| 6 | `PostToolUseFailure` | 工具执行失败后 | ❌ |
| 7 | `Notification` | 系统通知 | ❌ |
| 8 | `Stop` | Agent停止回复前 | ❌ |
| 9 | `PreCompact` | 上下文压缩前 | ❌ |
| 10 | `PostCompact` | 上下文压缩后 | ❌ |

### 3 种 Hook 类型

| 类型 | 实现 | 适用事件 |
|------|------|---------|
| Command Hook（确定性） | 记忆查询 + 检查清单 | SessionStart, PreToolUse, PostToolUse, Stop |
| Prompt Hook（LLM评估） | 自我批判框架 | PostToolUseFailure, PreCompact |
| Agent Hook（子Agent） | 创建独立子Agent | PostToolUseFailure 深度诊断, Notification |

### 决策三分法

| 决策 | 含义 | 后续行为 |
|------|------|---------|
| `approve` | 批准执行 | 正常继续 |
| `block` | 阻断执行 | 返回 stopReason |
| `ask_user` | 请求用户确认 | 展示完整待操作清单 |

## 三、Memory System — 4型分类

| 类型 | 标识 | 用途 | 保守度 | 查询优先级 |
|------|------|------|:--:|-----------|
| `user` | 👤 | 用户档案、偏好 | 🔴极度保守 | P1 |
| `project` | 📦 | 项目状态、架构 | 🔴极度保守 | P1 |
| `feedback` | 📝 | 错误模式、修复记录 | 🟡中等 | P2 |
| `reference` | 📚 | 外部知识、文档 | 🟢宽松 | P3 |

### 精选Agent规则（≤5条）

- 只包含**确定**有用的记忆；不确定 → 不包括
- 对 user/project 类型**极度保守**
- 匹配的是**问题本身**，而非表面关键词重叠
- 同一会话不重复注入已选记忆

## 四、Dream Consolidation — 4阶段记忆整合

| Phase | 名称 | 动作 |
|-------|------|------|
| 1 | Orient（定位） | 列出所有记忆 + 读取索引 |
| 2 | Gather（收集） | 收集近期反馈记忆 + Harness 完整性审计（悬挂链接/循环依赖/版本不一致） |
| 3 | Consolidate（整合） | MERGE / ABSOLUTE_DATE / PURGE / CLASSIFY |
| 4 | Prune（修剪） | 索引 ≤25KB，每行 ≤150字符 |

触发：用户主动 / 每30天 / 记忆>40条。

## 五、Anti-Regression — 反退化闭环

```
错误发生 → 修正方案永久化进环境 → 同样的错误不会再发生
```

```
1. DETECT    PostToolUseFailure 捕获错误上下文
2. ANALYZE   自我批判引擎分析根因
3. EXTRACT   提炼规则模式
4. PERSIST   写入 feedback/ironlaw 记忆
5. ACTIVATE  PreToolUse 自动加载
6. VERIFY    同类任务不再犯
```

### 铁律升级路径

| 级别 | 行为 | 升级条件 |
|------|------|---------|
| L1 建议 | Stop hook 提醒 | 首次发现模式 |
| L2 警告 | PreToolUse 警告但允许 | 复发1次 |
| L3 阻断 | PreToolUse 阻断 | 复发2次+ |
| L4 铁律 | SessionStart 注入 + 自修改保护 | L3 稳定运行 |

## 六、Deterministic Verifier — 确定性验证器

弥补文本 Hook 的"建议层"缺陷，提供 AI 无法跳过的代码级验证（55行 JS）：

| 检查项 | 确定性 | 说明 |
|--------|:--:|------|
| checkPathSafe | ✅ | 系统路径写入=block |
| checkVersionIncrement | ✅ | 版本号未递增=block |
| checkDangerousCommand | ✅ | 6种危险命令模式=block |
| preToolUse | ✅ | 聚合决策 approve/block |

```
worldbook PreToolUse（建议层）→ AI 读取规则
  → 调用验证器（执行层）→ 代码级判断 → AI 不能绕过
```

## 七、Sprint Contract — 协商契约

Generator 和 Evaluator 在开始实现前协商"完成"的定义：

```markdown
# Sprint N Contract
1. 本Sprint目标
2. 实现范围
3. 涉及文件
4. 验收测试（Evaluator 逐条验证）
5. 评分阈值（Functionality 40% / Code Quality 25% / Design 20% / Depth 15%）
```

任一维度低于最低分 → Sprint 失败。Generator 按 Contract 范围实现，不修复不相关问题。

## 八、集成检查清单（部署 Harness 时逐项确认）

- [ ] Hook 注册表：10 事件全部有实现载体（记忆/批判/子Agent）
- [ ] 记忆分类：4 型标签 + 索引文件 + 精选规则
- [ ] 反退化：PostToolUseFailure → 记忆写入链路通畅
- [ ] 确定性验证器：PreToolUse 前可调用，block 不可绕过
- [ ] Context 预算：基础+铁律+精选 ≤ 总上下文 20%
- [ ] Permission：5 级模式 + 高风险操作始终确认
- [ ] Dream：可手动触发，Phase 2 含完整性审计

---

## 参考

- Anthropic 官方工程博客与社区公开资料
- Anthropic 官方工程博客（Harness design for long-running application development, 2026.03）
- Mitchell Hashimoto 核心循环（2026.02）

---

## 九、安装指引（面向安装者）

> v2.1.0 (2026-08-12)：新增 references/memory-consistency.md（记忆一致性维护规范：单一事实源 / 引用去版本号 / 规则状态分离 / 过时标注 / 索引去计数化 / 三步走）。铁律引用已全部去版本号化。

本技能是 **Harness 治理框架**的入口。完整安装需 4 步：

1. **装技能**：本目录放入平台 skills 目录
2. **导入记忆**：让 AI 读取 `references/` 全部文档，按文档头部标注的标题导入记忆库（[铁律] / [Harness] 前缀）
3. **贴世界书**：将 `worldbook/harness-hooks.md` 中的条目复制到当前角色卡世界书（激活方式选常驻）
4. **启用全局强制**：平台支持 enforcement: global 时建议开启

详细步骤见 README.md。安装后可让 AI 执行验证清单确认生效。
