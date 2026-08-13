# Harness Hooks Registry — 10事件 × 3类型

> 基于 Anthropic Claude Code 源码 system-prompt-hooks-configuration.md 重建。

---

## 一、10个核心Hook事件

| # | 事件 | 触发时机 | Operit实现 | 阻断能力 |
|---|------|---------|-----------|:--:|
| 1 | SessionStart | 会话开始 | 查铁律→查项目快照→查用户偏好 | ❌ |
| 2 | UserPromptSubmit | 用户每次提交消息 | 模糊指代澄清 + 精选Agent运行 | ❌ |
| 3 | PermissionRequest | 工具调用前权限判断 | 操作是否匹配用户意图 | ✅ |
| 4 | PreToolUse | 工具执行前 | 铁律检查 + 破坏性操作确认 + 文件路径校验 | ✅ |
| 5 | PostToolUse | 工具执行成功后 | 结果验证 + 产出检查 + 自动记录 | ❌ |
| 6 | PostToolUseFailure | 工具执行失败后 | 错误上下文捕获 → OnError联动 | ❌ |
| 7 | Notification | 系统通知(子Agent完成等) | 轮询子Agent状态→展示 | ❌ |
| 8 | Stop | Agent停止回复前 | 反幻觉自查 + 自我批判 + Token简报 | ❌ |
| 9 | PreCompact | 上下文压缩前 | **平台注入摘要提示词（确定性，六段式强制）** + AI保存状态→警告 | ❌ |
| 10 | PostCompact | 上下文压缩后 | 恢复关键状态 | ❌ |

## 二、3种Hook类型

| 类型 | 实现方式 | 适用事件 |
|------|---------|---------|
| Command Hook（确定性） | 记忆查询（确定性结果） | SessionStart, PreToolUse, PostToolUse, PostToolUseFailure, Stop |
| Prompt Hook（LLM评估） | 自我批判检查 | PostToolUseFailure, PreCompact |
| Agent Hook（子Agent） | 子Agent审查 | PostToolUseFailure, Notification |

## 三、Hook决策三分法

| 决策 | 含义 | 后续行为 |
|------|------|---------|
| approve | 批准执行 | 正常继续 |
| block | 阻断执行 | 返回 stopReason 给用户 |
| ask_user | 请求用户确认 | 展示完整待操作清单，等确认 |

## 四、核心事件执行清单

### SessionStart
```
1. query_memory("[铁律] 强制执行清单 v5.0")
2. 运行精选Agent（≤5条记忆）
3. 如有 active_project → query_memory(项目快照)
4. query_memory("[用户] 偏好与配置")
5. 确认 Harness 架构条目可访问
```

### PreToolUse
```
1. 铁律规则3: 涉及用户数据的破坏性操作必须确认
2. 用户约束1: 文件写入检查路径（平台临时目录）
3. 用户约束2: 文件删除确认非必要组件
4. 如工具=Bash → 检查命令是否危险
5. 如工具=Write/Edit → 版本号铁律(如有)
```

### PostToolUseFailure
```
1. 捕获: 错误类型 + 操作上下文 + 输入 + 输出
2. self-evolution-engine 分析错误模式
3. 如为新模式 → 写入 [反馈] 型记忆
```

### PreCompact（确定性实现：平台注入摘要提示词）
```
平台侧（L1，不依赖模型自觉）：
  配置"对话摘要额外提示词"（见 references/summary-prompt.md）
  → 每次压缩时平台自动附加 → 摘要强制六段式 + 悬挂线程不丢

AI侧（补充执行）：
  1. 压缩前确认关键状态已落库（铁律规则7：写记忆）
  2. 检查摘要输出：① 六段式 ② 悬挂线程完整 ③ ⑦待落库建议存在
  3. 任一缺失 → 报告并重新检查配置
```

### Stop
```
1. 反幻觉自查: 引用的文件/功能是否存在
2. 自我批判: 重要任务后输出反思
3. Token简报: 估算剩余上下文
4. 轮询子Agent: 检查完成状态
```

---

## 五、强制力三级分层（v1.1 新增）

| 层级 | 载体 | 依赖自觉？ | 示例 |
|------|------|:--:|------|
| **L1 平台确定性** | 平台配置注入类机制 | ❌ 不依赖 | 摘要额外提示词、enforcement: global 技能、Claude Code settings.json hooks |
| **L2 提示词级** | 世界书条目、系统提示词 | ⚠️ 半强制 | 世界书 Hook 条目、角色卡 system prompt |
| **L3 记忆级** | 记忆库条目 | ✅ 靠自觉 | 铁律、规则条目（SessionStart 查询触发） |

**决策指南（优先级）**：新需求需要"某事件发生时必须执行某动作"时——
1. 先问：平台有没有对应的**配置注入点**？有 → 用 L1（优先）
2. 没有 → 退到世界书/系统提示词（L2）
3. 最后 → 写记忆条目 + 依赖 Hook 查询（L3）

> 认知要点：**平台配置注入类机制（摘要额外提示词、settings.json hooks 等）是确定性 Hook 的合法载体**——不限于世界书/技能。PreCompact 是首个落地的 L1 平台配置注入型实现。

---

v1.1 | 2026-08-02 | 新增 PreCompact 确定性实现 + 强制力三级分层 | 社区版
