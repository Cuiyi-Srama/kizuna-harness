# Harness 跨卡入口模板 — 世界书标准条目

> 用途：新角色卡安装 Harness 时使用。解决世界书绑定角色卡导致的自动链路断裂。

## 标准条目文本（复制到新卡世界书）

```markdown
[Harness] 系统钩子（常驻）
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 铁律：query_memory("[铁律] 强制执行清单")（引用不带版本号）
2. 架构：query_memory("[Harness] Kizuna — 架构总览")
3. 执行：按 [Harness] HooksRegistry — 10事件注册表 逐项检查
```

## 配置步骤
1. 角色卡 → 世界书 → 新建条目
2. 粘贴上方文本
3. 激活方式选【常驻】（确保每次回复都注入）
4. 保存即生效

## 原理说明
- 入口一条，明细在库：10事件注册表 / MemoryTaxonomy / AntiRegression 明细都在记忆库（平台级，切卡可查）
- 本条目只承担"扳机"角色：提醒 AI 查铁律 → 查架构 → 按注册表执行
- 全局强制技能由平台注入，无需配置在世界书

## 可选增强
若新卡需要完整 Hook 明细注入（而非按需查询），再加一条关键词条目：
```markdown
[Harness] Hook明细（关键词触发：铁律|Harness|Hook|规则）
→ query_memory("[Harness] HooksRegistry — 10事件注册表")
→ query_memory("[Harness] MemoryTaxonomy — 4型分类规则")
→ query_memory("[Harness] AntiRegression — 反退化闭环")
```

## 验证清单（贴完后）
- [ ] 新卡首条消息：AI 是否自动查了铁律？
- [ ] 说"检查马具"：AI 能否完整列出 10 事件注册表？
- [ ] 若缺包：use_package 激活所需包

---
v1.0 | 社区版
