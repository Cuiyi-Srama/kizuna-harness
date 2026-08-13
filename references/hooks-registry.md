# Harness Hooks Registry — 10事件 × 3类型 v1.9（社区版）

> 基于 Anthropic Claude Code 源码 system-prompt-hooks-configuration.md 重建。
> 通用发布版：个人环境细节已泛化（构建流程/文件索引），安装者可映射到自身平台。

---

## 一、10个核心Hook事件

| # | 事件 | 触发时机 | 匹配器 | 参考实现 | 阻断能力 |
|---|------|---------|--------|-----------|:--:|
| 1 | `SessionStart` | 会话开始 | — | 查铁律→查项目快照→查用户偏好→文件索引提示→构建场景认知 | ❌ |
| 2 | `UserPromptSubmit` | 用户每次提交消息 | — | 模糊指代澄清 + 精选Agent运行 | ❌ |
| 3 | `PermissionRequest` | 工具调用前权限判断 | 工具名 | 操作是否匹配用户意图 | ✅ |
| 4 | `PreToolUse` | 工具执行前 | 工具名 | 铁律检查 + 破坏性操作确认 + 文件路径校验 + 复杂任务规划检查 | ✅ |
| 5 | `PostToolUse` | 工具执行成功后 | 工具名 | 结果验证 + 产出检查 + 自动记录 | ❌ |
| 6 | `PostToolUseFailure` | 工具执行失败后 | 工具名 | 错误上下文捕获 → OnError联动 | ❌ |
| 7 | `Notification` | 系统通知(子Agent完成等) | 通知类型 | 轮询子Agent状态→展示 | ❌ |
| 8 | `Stop` | Agent停止回复前 | — | 反幻觉自查 + 自我批判 + Token简报 + 任务完整性核查 | ❌ |
| 9 | `PreCompact` | 上下文压缩前 | manual/auto | **平台注入摘要提示词（确定性，宿主四段+锚点行）** + 保存关键状态→警告 | ❌ |
| 10 | `PostCompact` | 上下文压缩后 | manual/auto | 恢复关键状态 | ❌ |

---

## 二、3种Hook类型

### Command Hook (确定性)
- 实现: 记忆查询 (确定性结果)
- 适用事件: SessionStart, PreToolUse, PostToolUse, PostToolUseFailure, Stop
- 执行: AI在对应时机查询指定记忆条目，按条目中的检查清单逐项执行

### Prompt Hook (LLM评估)
- 实现: self-evolution-engine 批判检查
- 适用事件: PostToolUseFailure (错误分析), PreCompact (状态评估)
- 执行: 调用批判框架，输出结构化评估结果

### Agent Hook (子Agent)
- 实现: sub_agent_manager review
- 适用事件: PostToolUseFailure (深度诊断), Notification (状态分类)
- 执行: 创建独立子Agent执行复杂检查

---

## 三、Hook决策三分法

| 决策 | 含义 | 后续行为 |
|------|------|---------|
| `approve` | 批准执行 | 正常继续 |
| `block` | 阻断执行 | 返回 stopReason 给用户 |
| `ask_user` | 请求用户确认 | 展示完整待操作清单，等确认 |

---

## 四、核心事件执行清单

### SessionStart
```
1. [Command] query_memory("[铁律]强制执行清单")   ← 引用不带版本号（标题固定）
2. [Command] query_memory("[Harness] MemorySelector") → 运行精选Agent
3. [Command] 如有 active_project → query_memory(项目快照)
4. [Command] query_memory("[用户] 偏好与配置")
5. [Command] 复杂任务先规划（按任务执行规范判定标准）
6. [Command] 文件查询类需求 → 先读平台文档索引（找不到 ≠ 不存在，继续排查）
7. [Command] 🔴 编译/构建类任务 → 走项目配置的构建流程（CI 或本地构建脚本）：
   先查项目是否已接入 → 未接入先配置（查 workflow+产物 → 补配置 → 记录时长基准）
   → 后台启动构建 → 读状态文件 → 完成通知。禁止固定 sleep、禁止绕过构建流程裸跑 API
```

### PreToolUse
```
1. [Command] 铁律规则2: 涉及用户数据的破坏性操作必须确认
2. [Command] 用户约束包①: 文件写入检查路径（平台临时目录）
3. [Command] 用户约束包②: 文件删除确认非必要组件
4. [Command] 如工具=Bash → 检查命令是否危险
5. [Command] 如工具=Write/Edit → 版本号规则（如有）
6. [Command] 当前任务是否复杂？是 → 先规划再执行（禁止直接开干）
```

### PostToolUseFailure
```
1. [Command] 捕获: 错误类型 + 操作上下文 + 输入 + 输出
2. [Prompt] self-evolution-engine 分析错误模式
3. [Command] 如为新模式 → 写入 [反馈] 型记忆
```

### PreCompact（确定性实现：平台注入摘要提示词）
```
平台侧（L1，不依赖模型自觉）：
  配置"自定义总结规则 / 对话摘要额外提示词"（见 references/summary-prompt.md）
  → 每次压缩时平台自动附加 → 摘要按宿主四段格式 + 锚点行输出

AI侧（补充执行）：
  1. 压缩前确认关键状态已落库（铁律规则7：写记忆）
  2. 检查摘要输出：① 宿主四段齐全 ② 悬挂线程完整 ③ 锚点行存在（【关键信息与上下文】列表末尾）
  3. 任一缺失 → 报告并重新检查配置
```

### PreCompact 平台机制实证（v1.9 新增，2026-08-13 两轮验证通过后补充）
```
平台机制：自定义总结规则 = 当前会话绑定模型配置的 summaryCustomRules（全局生效，非独立全局字段）
注入位置：摘要服务 → systemPrompt += "\n\n" + customRules（追加在宿主规则之后）
存储位置：平台 DataStore 配置库（JSON 序列化）
已知坑①：输入框 700ms 防抖自动保存——先删除后粘贴会触发空值保存覆盖旧版；粘贴后需停留≥2秒再切走
已知坑②：序列化未开 encodeDefaults——空字符串字段被省略，存储文件变小、字段消失
已知坑③：修改规则后必须「存储验证 → 灌消息」闭环（直接读存储文件比肉眼确认更硬核）
实测形态（v1.4）：宿主四段 + 【关键信息与上下文】列表末尾锚点行（列表项伪装 = 格式内合法元素，消除格式冲突）
验证结论：锚点两轮验证通过（出生 + 继承 + 唯一不累积），详见 references/summary-prompt.md
```

### Stop（v1.5 新增第5项）
```
1. [Command] 反幻觉自查: 引用的文件/功能是否存在
2. [Command] 自我批判: 重要任务后输出反思
3. [Command] Token简报: 估算剩余上下文
4. [Command] 轮询子Agent: 检查完成状态
5. [Command] 🔴 任务完整性核查: 本会话用户提出的任务/纠正/安排是否已落库？
   未落库先补录再回复。防上下文压缩遗忘（教训：用户质问"安排的任务做全了没"，
   核查发现遗留悬挂未进待办）
```

---

## 五、强制力三级分层（v1.8 新增）

| 层级 | 载体 | 依赖自觉？ | 示例 |
|------|------|:--:|------|
| **L1 平台确定性** | 平台配置注入类机制 | ❌ 不依赖 | 摘要额外提示词、enforcement: global 技能、Claude Code settings.json hooks |
| **L2 提示词级** | 世界书条目、系统提示词 | ⚠️ 半强制 | 世界书 Hook 条目、角色卡 system prompt |
| **L3 记忆级** | 记忆库条目 | ✅ 靠自觉 | 铁律、规则条目（SessionStart 查询触发） |

**决策指南（优先级）**：新需求需要"某事件发生时必须执行某动作"时——
1. 先问：平台有没有对应的**配置注入点**？有 → 用 L1（优先）
2. 没有 → 退到世界书/系统提示词（L2）
3. 最后 → 写记忆条目 + 依赖 Hook 查询（L3）

> 认知要点：**平台配置注入类机制（摘要额外提示词、settings.json hooks 等）是确定性 Hook 的合法载体**——不限于世界书/技能。PreCompact 是首个落地且**完成两轮端到端验证**的 L1 平台配置注入型实现（2026-08-13：出生+继承+唯一不累积全通过）。

---

## 六、关联

- 依赖: [铁律]强制执行清单（标题固定，引用不带版本号）
- 依赖: [Harness] MemorySelector
- 依赖: self-evolution-engine
- 依赖: [规则]记忆一致性维护规范（原则2：标题固定化，正文引用不带版本号）
- 依赖: [规则]任务执行规范（复杂任务判定 + 长任务等待 + 构建流程 + 待办清理/错误落库）
- 依赖: [Harness] SummaryPrompt（PreCompact 确定性实现）
- 子条目: 各Hook的详细检查清单 (PreCodeGen, PostCodeGen 等)

---
v1.9 | 2026-08-13 | PreCompact 补平台机制实证（customRules 注入位置 + 防抖保存坑 + 存储 + 实测形态）；修正"六段式"旧认知为"宿主四段+锚点行"；确认首个完成端到端验证的 L1 机制 | 社区版
v1.8 | 2026-08-13 | PreCompact 确定性实现 + 强制力三级分层（双向合并：本地 v1.7 + 发布 v1.1 增量）| 社区版