# Harness Hooks Registry — 10事件 × 3类型

> 基于 Anthropic Claude Code 源码 system-prompt-hooks-configuration.md 重建。

---

## 一、10个核心Hook事件

| # | 事件 | 触发时机 | Operit实现 | 阻断能力 |
|---|------|---------|-----------|:--:|
| 1 | SessionStart | 会话开始 | 查铁律→查项目快照→查用户偏好→文件索引提示 | ❌ |
| 2 | UserPromptSubmit | 用户每次提交消息 | 模糊指代澄清 + 精选Agent运行 | ❌ |
| 3 | PermissionRequest | 工具调用前权限判断 | 操作是否匹配用户意图 | ✅ |
| 4 | PreToolUse | 工具执行前 | 铁律检查 + 破坏性操作确认 + 文件路径校验 | ✅ |
| 5 | PostToolUse | 工具执行成功后 | 结果验证 + 产出检查 + 自动记录 | ❌ |
| 6 | PostToolUseFailure | 工具执行失败后 | 错误上下文捕获 → OnError联动 | ❌ |
| 7 | Notification | 系统通知(子Agent完成等) | 轮询子Agent状态→展示 | ❌ |
| 8 | Stop | Agent停止回复前 | 反幻觉自查 + 自我批判 + Token简报 | ❌ |
| 9 | PreCompact | 上下文压缩前 | 保存关键状态→警告 | ❌ |
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
1. query_memory("[铁律]强制执行清单")   ← 引用不带版本号（当前v5.1）
2. 运行精选Agent（≤5条记忆）
3. 如有 active_project → query_memory(项目快照)
4. query_memory("[用户] 偏好与配置")
5. 铁律规则7：复杂任务先规划（配合[规则]任务执行规范 v1.1 判定标准）
6. 文件查询类需求 → 先读 /sdcard/文档/文件位置索引.md（find不到≠被清理，详细排查见[规则]文件查找规范）
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

### Stop
```
1. 反幻觉自查: 引用的文件/功能是否存在
2. 自我批判: 重要任务后输出反思
3. Token简报: 估算剩余上下文
4. 轮询子Agent: 检查完成状态
```

---

v1.0 | 社区版
