# Kizuna 一键安装协议（给 AI 执行）

> 安装者只需说一句：**"安装 Kizuna"**，AI 按本协议自动完成。

## AI 执行步骤

1. **运行安装器**
   ```
   python3 install.py
   ```
   → 自动检测平台、校验文件完整性、生成 `install_manifest.json` + 世界书条目 + 平台指引

   **平台指定（可选）**：自动检测可能误判时，可手动指定：
   ```bash
   python3 install.py --platform claude-code          # 参数方式
   KIZUNA_PLATFORM=generic python3 install.py         # 环境变量方式
   ```
   优先级：`--platform` 参数 > `KIZUNA_PLATFORM` 环境变量 > 自动检测。
   合法值：`operit` / `claude-code` / `generic`；非法值会警告并回退自动检测。

2. **导入记忆**（读 install_manifest.json，逐条执行）
   - 对每条 `{title, type, content}`：
     - 先按 title 查询是否已存在（避免重复导入）
     - 不存在 → 按 type 归类创建（ironlaw → 铁律类；reference → 参考类）
     - 已存在 → 跳过并报告"已存在，跳过"
3. **展示世界书条目** → 用户粘贴到角色卡世界书（激活方式：常驻）
4. **执行验证清单**
   - `query_memory("[铁律] 强制执行清单")（引用不带版本号）` 是否命中？
   - 说"检查马具"能否列出 10 事件注册表？
   - 记忆数量 = manifest 条数（当前 8 条）？
5. **完成提示**：告知安装结果 + 可选删除 install_manifest.json

## 注意事项

- 记忆导入是平台工具操作（create_memory / update_memory），脚本只负责生成清单
- 不同平台记忆机制不同：Operit 用记忆工具；Claude Code 用 CLAUDE.md 追加；通用平台用 system prompt 注入（见 adapters/）
- 安装后用户可随时说"卸载 Kizuna"（按 manifest 删除对应记忆）
