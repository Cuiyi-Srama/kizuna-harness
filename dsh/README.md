# DSH × Kizuna 注入层（dsh/）

> Kizuna Harness 方法论注入 DeepSeek Harness（DSH）的官方分发目录。
> 让 DSH 继承 Kizuna 的约束层治理规则，并解锁最大化运行配置。

## 包含内容

| 文件 | 说明 |
|------|------|
| `kizuna-injection.yml` | cordis patch overlay：权限/模型/技能/Shell 四项配置 |
| `skills/kizuna-hooks/SKILL.md` | Kizuna 10事件 Hook 方法论技能（DSH 技能格式） |

## 安装（3 步）

### 1. 应用配置 patch

**方式 A（推荐，持久）**：合并 `kizuna-injection.yml` 内容到
`~/.dsh/profiles/web/cordis.patch.yml`，重启：

```bash
pkill -f 'dsh web'
cd /root && nohup dsh web > /tmp/dsh_web.log 2>&1 &
```

**方式 B（临时）**：

```bash
dsh --profile web --patch ./kizuna-injection.yml
```

### 2. 安装技能

```bash
mkdir -p ~/.dsh/skills && cp -r skills/kizuna-hooks ~/.dsh/skills/
```

技能自动发现（`~/.dsh/skills/` 是默认 user 技能根目录，rank 400）。

### 3. 验证

```bash
# 配置生效检查（应看到 defaultPreset: danger-full-access、model: deepseek-v4-pro）
dsh --profile web --dump-config | grep -E 'defaultPreset|model:'
# 技能发现检查
cd /root && dsh --profile headless '你有哪些可用技能？'
```

## 配置内容说明

| 项 | 值 | 效果 |
|----|-----|------|
| `permission.defaultPreset` | `danger-full-access` | sandbox full + approval never，解锁 Shell 全能力（proot 无 landlock 时的唯一解） |
| `agent-default-model.model` | `deepseek-v4-pro` | 复杂任务推理质量优先；日常可在 Web UI 切回 `deepseek-v4-flash` 省 token |
| `skill-filesystem.enabled` | `true` | 恢复文件系统技能发现（web-app 默认禁用） |
| `tool-skill.enabled` | `true` | 恢复技能工具（web-app 默认禁用） |
| `tool-bash.enabled` | `true` | 恢复 Bash 工具（web-app 默认禁用） |

## 注意

- 配置的插件 id 是 `permission`（包名 `@deepseek-ai/dsh-permission-presets`），写错会静默不生效。
- 不可直接改 `sandbox-policy.mode`——`dsh-permission-presets` 校验 sandbox+approval 组合，
  不匹配预设会启动失败（`configure defaultPreset explicitly`）。
- 本配置面向个人设备使用（approval never），多人/生产环境请改用 `workspace-write` 预设。

## 关联

- 方法论来源：[references/dsh-mapping.md](../references/dsh-mapping.md)、[references/dsh-integration.md](../references/dsh-integration.md)
- DSH 官方仓库：github.com/deepseek-ai/deepseek-harness
