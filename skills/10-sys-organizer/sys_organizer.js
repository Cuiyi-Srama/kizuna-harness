/* METADATA
{
  "name": "sys_organizer",
  "display_name": {
    "zh": "系统整理器",
    "en": "System Organizer"
  },
  "description": {
    "zh": "一键巡检四大维护领域：①整理对话（10类分组+重复合并）②记忆库整理归簇（孤立节点+版本冲突+归簇）③整理手机空间（散落文件+分类归位）④架构一致性复检（链接悬挂+版本矛盾+包地图）+ ⑤索引同步（sync_index自动生成/刷新文件位置索引，闭环：整理→索引→找回）。工具为分析器：AI采集原始数据传入，包输出结构化报告+执行编排表，AI按表执行、用户对需确认项拍板。",
    "en": "One-shot inspection for 4 maintenance domains: chat organization, memory consolidation, storage cleanup, architecture consistency + index sync (sync_index regenerates the file location index to close the organize->find loop). Analyzer-style tools: AI feeds raw data, package outputs structured report + execution checklist."
  },
  "author": ["Cuiyi"],
  "category": "Utility",
  "version": "1.1.2-open",
  "tools": [
    {
      "name": "organize_chats",
      "description": {
        "zh": "对话整理巡检。输入chats（JSON字符串数组，元素含id/title/message_count/created_at，可用extended_chat:list_chats采集）→ 输出：未命名/短对话检测、疑似重复对（合并建议）、10类分组建议（重命名前缀）、执行编排表。不传chats时输出数据采集指引。",
        "en": "Chat organization inspection. Input chats JSON array (id/title/message_count/created_at) -> outputs untitled/short chat detection, duplicate pairs, 10-category rename suggestions, execution checklist."
      },
      "parameters": [
        {
          "name": "chats",
          "description": "对话列表JSON字符串：[{\"id\":\"...\",\"title\":\"...\",\"message_count\":12,\"created_at\":\"2026-08-01\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "scope",
          "description": "检查范围：all=全部检查，duplicates=仅重复检测，untitled=仅未命名/短对话，classify=仅分类建议。默认all",
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "consolidate_memory",
      "description": {
        "zh": "记忆库整理归簇。输入memories（JSON字符串数组，元素含title/folder/links/created_at，可用query_memory('*')采集）→ 输出：孤立节点（links=0）、同类多版本冲突、标题前缀与文件夹错位、归簇建议（move_memory目标）、执行编排表。不传memories时输出采集指引。",
        "en": "Memory consolidation. Input memories JSON (title/folder/links/created_at) -> outputs orphan nodes, version conflicts, folder mismatch, consolidation suggestions."
      },
      "parameters": [
        {
          "name": "memories",
          "description": "记忆列表JSON字符串：[{\"title\":\"[规则] xxx\",\"folder\":\"ironlaw\",\"links\":2,\"created_at\":\"2026-08-01\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "min_links",
          "description": "孤立判定阈值：links小于该值视为孤立，默认0",
          "type": "number",
          "required": false
        }
      ]
    },
    {
      "name": "organize_storage",
      "description": {
        "zh": "手机空间整理巡检。输入files（JSON字符串数组，元素含path/size/type，可用find命令采集）→ 输出：散落文件检测（根目录/Download根）、扩展名→分类目录映射建议、临时文件检测、不动区域过滤、执行编排表。不传files时输出采集指引。",
        "en": "Storage organization inspection. Input files JSON (path/size/type) -> outputs scattered files, extension-to-directory mapping, temp file detection, no-touch filtering."
      },
      "parameters": [
        {
          "name": "files",
          "description": "文件列表JSON字符串：[{\"path\":\"/sdcard/x.zip\",\"size\":1024,\"type\":\"zip\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "area",
          "description": "扫描区域：all=全盘浅扫，root=根目录，download=Download根，pictures=Pictures根，tmp=临时文件。默认all",
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "verify_consistency",
      "description": {
        "zh": "架构一致性复检。输入可选项：links（记忆链接JSON）、versions（版本引用JSON）、packages（包状态JSON）→ 输出：链接悬挂/循环依赖检测、版本引用矛盾检测、包地图checksum对比、Harness完整性报告（✅/⚠️）。全不传时输出完整检查清单指引。",
        "en": "Architecture consistency check. Optional inputs: links/versions/packages -> outputs dangling links, version conflicts, package map checksum, Harness integrity report."
      },
      "parameters": [
        {
          "name": "links",
          "description": "记忆链接JSON字符串：[{\"source\":\"A\",\"target\":\"B\",\"type\":\"GOVERNS\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "versions",
          "description": "版本引用JSON字符串：[{\"item\":\"HooksRegistry\",\"ref\":\"v5.0\",\"actual\":\"v5.1\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "packages",
          "description": "包状态JSON字符串：{\"recorded\":\"89-60-29\",\"actual\":\"89-60-29\",\"skills\":41}",
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "run_all",
      "description": {
        "zh": "一键全量巡检（只读，不执行任何修改）。串联organize_chats/consolidate_memory/organize_storage/verify_consistency四个子巡检，输出总报告：🔴紧急/🟡建议/ℹ️信息三级汇总 + 统一执行编排表（每项带item_id/action_type/目标/建议）。AI按表执行：immediate直接做，read_content先读内容，need_user等你拍板。",
        "en": "One-shot full inspection (read-only). Chains all 4 sub-inspections, outputs master report with severity levels and unified execution checklist."
      },
      "parameters": [
        {
          "name": "chats",
          "description": "对话列表JSON（可选，不传则该项输出采集指引）",
          "type": "string",
          "required": false
        },
        {
          "name": "memories",
          "description": "记忆列表JSON（可选）",
          "type": "string",
          "required": false
        },
        {
          "name": "files",
          "description": "文件列表JSON（可选）",
          "type": "string",
          "required": false
        },
        {
          "name": "links",
          "description": "记忆链接JSON（可选）",
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "sync_index",
      "description": {
        "zh": "索引同步（维护闭环最后一块）。输入dirs（目录树JSON，含dir/files/subdirs/note）+ 可选updates（本次归位变更from→to）+ 可选pending（待处理项）→ 输出完整版《文件位置索引.md》Markdown（固定模板+动态数据），AI直接覆盖写入 /sdcard/文档/文件位置索引.md。每次整理完成后必须调用本工具刷新索引，否则其他AI按旧索引找不到文件。不传dirs时输出采集指引。",
        "en": "Index sync (closes the maintain loop). Input dirs JSON (directory tree) + optional updates (moved files) + optional pending -> outputs full file-location-index Markdown to overwrite /sdcard/文档/文件位置索引.md. MUST run after every storage cleanup so other AIs can find files."
      },
      "parameters": [
        {
          "name": "dirs",
          "description": "目录树JSON字符串：[{\"dir\":\"文档\",\"files\":14,\"subdirs\":[\"学习资料\",\"教程说明书\"],\"note\":\"正式文档\"}]",
          "type": "string",
          "required": true
        },
        {
          "name": "updates",
          "description": "本次归位变更JSON字符串（可选）：[{\"from\":\"/sdcard/x.zip\",\"to\":\"/sdcard/压缩包/x.zip\"}]",
          "type": "string",
          "required": false
        },
        {
          "name": "pending",
          "description": "待处理项JSON字符串数组（可选）：[\"回收站/full.docx等用户决定删除\"]",
          "type": "string",
          "required": false
        }
      ]
    }
  ]
}*/

/**
 * sys_organizer v1.0.0 — 系统整理器
 * 四大维护领域一键巡检：对话整理 / 记忆库归簇 / 手机空间 / 架构一致性
 * 设计：分析器模式 — AI采集原始数据传入，包内分析评分，输出结构化报告+执行编排表
 */
const sysOrganizer = (function () {
  // ==================== 内置规范数据 ====================
  const SPEC_VERSION = "1.0.0";

  // 对话10类分组体系 v2.0
  const CHAT_CATEGORIES = [
    { id: "技术", keywords: ["habit", "app", "开发", "代码", "bug", "apk", "gradle", "token", "github", "脚本", "python", "编译", "调试", "ui", "数据库", "服务器", "docker", "api", "编程", "软件", "android", "shizuku", "adb"] },
    { id: "游戏", keywords: ["游戏", "王者", "原神", "鸣潮", "崩坏", "蛋仔", "steam", "ps5", "switch", "外挂", "上分", "通关", "副本", "重装上阵", "和平精英", "游戏摄影"] },
    { id: "学习", keywords: ["作业", "考试", "学习", "笔记", "复习", "英语", "数学", "语文", "老师", "成绩", "寒假", "暑假", "单词", "作文", "辩论", "期中", "期末"] },
    { id: "小说", keywords: ["小说", "追更", "txt", "连载", "书单", "跌落暮色", "怪谈"] },
    { id: "心理", keywords: ["孤独", "焦虑", "抑郁", "失眠", "情绪", "压力", "药物", "副作用", "倾诉", "心理", "舍曲林", "心理咨询"] },
    { id: "家庭", keywords: ["妈妈", "爸爸", "妹妹", "家庭", "积分", "零花钱", "家长", "传销", "弟弟", "家务", "积分经济"] },
    { id: "数码", keywords: ["手机", "耳机", "平板", "电脑", "硬件", "配置", "cpu", "显卡", "屏幕", "电池", "wifi", "路由", "串流", "手柄"] },
    { id: "财经", keywords: ["股票", "基金", "关税", "股灾", "比特币", "理财", "融资", "经济", "房价", "拼多多传销", "赚钱"] },
    { id: "人文", keywords: ["诗词", "哲学", "历史", "科学", "社会", "文化", "电影", "音乐", "艺术", "读书"] }
  ];
  const CATEGORY_DEFAULT = "日常"; // 兜底类

  // 记忆库文件夹映射（标题前缀 → 目标文件夹）
  const MEMORY_FOLDER_MAP = [
    { prefix: "[铁律]", folder: "ironlaw" },
    { prefix: "[规则]", folder: "ironlaw" },
    { prefix: "[用户]", folder: "user" },
    { prefix: "[项目]", folder: "project" },
    { prefix: "[反馈]", folder: "feedback" },
    { prefix: "[参考]", folder: "reference" },
    { prefix: "[会话]", folder: "session" },
    { prefix: "[凭证]", folder: "credential" },
    { prefix: "[Harness]", folder: "Harness" },
    { prefix: "[索引]", folder: "(根目录)" }
  ];

  // 扩展名 → 分类目录映射（AI生成文件落盘规则 + 分类体系v4）
  const STORAGE_RULES = [
    { exts: ["apk", "aab"], dir: "安装包/", desc: "安装程序" },
    { exts: ["zip", "rar", "7z", "tar", "gz", "bz2"], dir: "压缩包/", desc: "归档压缩包" },
    { exts: ["py", "js", "sh", "jar", "ts", "html"], dir: "工具脚本/", desc: "工具脚本（html工具类）" },
    { exts: ["docx", "doc", "pdf", "md", "xlsx", "xls", "ppt", "pptx", "csv"], dir: "文档/", desc: "文档（按内容细分学习资料/教程等子目录）" },
    { exts: ["jpg", "jpeg", "png", "gif", "webp", "heic", "bmp"], dir: "Pictures/", desc: "图片（按OCR内容细分相册）" },
    { exts: ["mp4", "mov", "mkv", "avi", "webm"], dir: "Movies/", desc: "视频（录屏→Movies/视频收藏/录屏）" },
    { exts: ["mp3", "wav", "flac", "m4a", "ogg", "aac"], dir: "Music/", desc: "音频" },
    { exts: ["txt"], dir: "小说/或文档/", desc: "txt需读内容判定：小说→小说/，其他→文档/" }
  ];
  const TEMP_PATTERNS = [/^\./, /\.tmp$/i, /\.log$/i, /~$/, /\.part$/i, /\.crdownload$/i];
  const NO_TOUCH_DIRS = ["Android", "DCIM", "Music", "Movies", "Recordings", "GAMES", "Download", "Documents", "123云盘", "Tencent", "UCDownloads", "baidu", "cache", "工具大师", "制作铃声", "阅图锁屏", "i Music", "音乐", "音乐搜索", "下载", "backups", "丝竹居", "mit", "Operit", "待确认", "回收站", "备份数据", "文档", "小说", "安装包", "压缩包", "项目工程", "游戏", "逆向工程", "工具脚本", "角色卡", "Models", "Pictures"];

  // Harness 一致性检查项
  const HARNESS_CHECKS = [
    { id: "HC-01", name: "记忆链接悬挂检测", desc: "query_memory_links全量拉取，逐条验证source/target标题是否存在，悬挂链接需修复或删除", tool: "extended_memory_tools:query_memory_links" },
    { id: "HC-02", name: "循环依赖检测", desc: "链接图BFS/DFS检测环：规则→规范→工具→规则 是否成环", tool: "人工分析链接表" },
    { id: "HC-03", name: "版本引用矛盾", desc: "铁律当前版本（v5.1）vs HooksRegistry/索引/技能文件中的引用；项目版本号 vs 主快照", tool: "query_memory + grep技能文件" },
    { id: "HC-04", name: "包地图checksum对比", desc: "[索引]包与技能地图中的 checksum（包总数-启用-禁用-技能-mcp）vs list_sandbox_packages实际结果", tool: "operit_editor:list_sandbox_packages" },
    { id: "HC-05", name: "技能文件引用检查", desc: "强制规则引擎/self-evolution-engine/code-reviewer/bug-fixer 的SKILL.md中：铁律版本号、规则编号、查询关键词、回退标题", tool: "grep_code skills目录" },
    { id: "HC-06", name: "过时条目登记表核对", desc: "[索引]记忆库目录中的superseded登记表 vs 实际条目状态", tool: "query_memory" },
    { id: "HC-07", name: "孤立节点体检", desc: "链接数=0的记忆条目≥10条时触发补链（记忆一致性规范原则6）", tool: "query_memory_links统计" }
  ];

  // ==================== 工具函数 ====================

  function safeParse(jsonStr, fallback) {
    if (!jsonStr || typeof jsonStr !== "string") return fallback;
    try { return JSON.parse(jsonStr); } catch (e) { return fallback; }
  }

  function now() {
    const d = new Date();
    const p = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function titleSimilarity(a, b) {
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
    const na = norm(a), nb = norm(b);
    if (!na || !nb) return 0;
    if (na === nb) return 1;
    const short = na.length < nb.length ? na : nb;
    const long = na.length < nb.length ? nb : na;
    if (short.length < 2) return 0;
    // 子串包含或前缀重合
    if (long.includes(short) && short.length >= long.length * 0.5) return 0.85;
    // 公共前缀比例
    let common = 0;
    const maxLen = Math.min(na.length, nb.length);
    for (let i = 0; i < maxLen; i++) { if (na[i] === nb[i]) common++; else break; }
    return common / Math.max(na.length, nb.length, 1);
  }

  function classifyChat(title) {
    const t = (title || "").toLowerCase();
    for (const cat of CHAT_CATEGORIES) {
      for (const kw of cat.keywords) {
        if (t.includes(kw.toLowerCase())) return cat.id;
      }
    }
    return CATEGORY_DEFAULT;
  }

  // ---------- 工具1：对话整理 ----------
  async function organize_chats(params) {
    const p = params || {};
    const scope = p.scope || "all";
    const chats = safeParse(p.chats, null);

    if (!chats || !Array.isArray(chats)) {
      return {
        success: true,
        mode: "guide",
        spec_version: SPEC_VERSION,
        generated_at: now(),
        message: "未提供对话数据，先采集再分析：",
        guide: [
          "1. 调用 extended_chat:list_chats 获取全部对话",
          "2. 提取字段：id / title / message_count / created_at",
          "3. 构造JSON数组传回本工具：{\"chats\":\"[{\\\"id\\\":\\\"...\\\",\\\"title\\\":\\\"...\\\",\\\"message_count\\\":12}]\"}",
          "4. 或直接用 run_all 一次性传入四类数据"
        ],
        rules: {
          categories: CHAT_CATEGORIES.map(c => c.id),
          default_category: CATEGORY_DEFAULT,
          duplicate_threshold: "标题相似度>=0.85判定为疑似重复，需读内容确认后合并"
        }
      };
    }

    const items = [];
    let idSeq = 1;
    const seen = [];

    // 1) 未命名/短对话检测
    if (scope === "all" || scope === "untitled") {
      for (const c of chats) {
        const title = (c.title || "").trim();
        const cnt = c.message_count || 0;
        if (!title) {
          items.push({
            item_id: `CHT-${String(idSeq++).padStart(3, "0")}`,
            action_type: "read_content",
            priority: "suggest",
            target: `chat:${c.id || "?"}`,
            suggestion: `未命名对话（${cnt}条消息）：读取首条消息判定主题，按10类重命名（如 [技术] xxx）`,
            status: "pending"
          });
        } else if (cnt > 0 && cnt < 5) {
          items.push({
            item_id: `CHT-${String(idSeq++).padStart(3, "0")}`,
            action_type: "read_content",
            priority: "info",
            target: `chat:${c.id || "?"}`,
            suggestion: `短对话「${title}」（${cnt}条）：确认是否有保留价值，可归档或合并`,
            status: "pending"
          });
        }
      }
    }

    // 2) 重复检测
    if (scope === "all" || scope === "duplicates") {
      for (let i = 0; i < chats.length; i++) {
        const a = chats[i];
        if (!(a.title || "").trim()) continue;
        for (let j = i + 1; j < chats.length; j++) {
          const b = chats[j];
          if (!(b.title || "").trim()) continue;
          const sim = titleSimilarity(a.title, b.title);
          if (sim >= 0.85) {
            items.push({
              item_id: `CHT-${String(idSeq++).padStart(3, "0")}`,
              action_type: "need_user",
              priority: "suggest",
              target: `chat:${a.id} ↔ chat:${b.id}`,
              suggestion: `疑似重复：「${a.title}」（${a.message_count}条）↔「${b.title}」（${b.message_count}条）相似度${(sim * 100).toFixed(0)}%——需读内容确认后合并`,
              status: "pending"
            });
            seen.push([a.id, b.id]);
          }
        }
      }
    }

    // 3) 分类建议
    if (scope === "all" || scope === "classify") {
      for (const c of chats) {
        const title = (c.title || "").trim();
        if (!title) continue;
        const cat = classifyChat(title);
        const hasPrefix = /^\[(技术|游戏|学习|小说|心理|家庭|数码|财经|人文|日常)\]/.test(title);
        if (!hasPrefix) {
          items.push({
            item_id: `CHT-${String(idSeq++).padStart(3, "0")}`,
            action_type: "immediate",
            priority: "info",
            target: `chat:${c.id || "?"}`,
            suggestion: `「${title}」→ 建议重命名为 [${cat}] ${title}（关键词匹配）`,
            status: "pending"
          });
        }
      }
    }

    const critical = items.filter(i => i.priority === "critical").length;
    const suggest = items.filter(i => i.priority === "suggest").length;
    const info = items.filter(i => i.priority === "info").length;

    return {
      success: true,
      mode: "report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: { critical, suggest, info, total: items.length },
      items,
      checklist: [
        "① read_content项：读取对话首条消息确认主题后再重命名/合并",
        "② immediate项：直接按建议加分类前缀重命名",
        "③ need_user项：列出重复对话对，用户确认后合并（extended_chat）",
        "④ 完成后更新 [规则]对话分组整理记录（如分布变化）"
      ]
    };
  }

  // ---------- 工具2：记忆库归簇 ----------
  async function consolidate_memory(params) {
    const p = params || {};
    const minLinks = (typeof p.min_links === "number") ? p.min_links : 0;
    const memories = safeParse(p.memories, null);

    if (!memories || !Array.isArray(memories)) {
      return {
        success: true,
        mode: "guide",
        spec_version: SPEC_VERSION,
        generated_at: now(),
        message: "未提供记忆数据，先采集再分析：",
        guide: [
          "1. 调用 query_memory(\"*\") 获取全部记忆（标题+内容摘要）",
          "2. 提取字段：title / folder / links（链接数）/ created_at",
          "3. 构造JSON数组传回本工具：{\"memories\":\"[{\\\"title\\\":\\\"[规则] xxx\\\",\\\"folder\\\":\\\"ironlaw\\\",\\\"links\\\":2}]\"}",
          "4. 或直接用 run_all 一次性传入"
        ],
        folder_map: MEMORY_FOLDER_MAP
      };
    }

    const items = [];
    let idSeq = 1;

    // 1) 孤立节点检测
    for (const m of memories) {
      const links = m.links || 0;
      if (links <= minLinks && links !== undefined) {
        items.push({
          item_id: `MEM-${String(idSeq++).padStart(3, "0")}`,
          action_type: "immediate",
          priority: links === 0 ? "suggest" : "info",
          target: m.title,
          suggestion: `孤立节点（links=${links}）：按记忆一致性规范原则6建链，或评估归档到_归档/`,
          status: "pending"
        });
      }
    }

    // 2) 同类多版本冲突（标题核心词相同）
    const grouped = {};
    for (const m of memories) {
      const core = (m.title || "").replace(/^\[[^\]]+\]\s*/, "").replace(/\s+v?\d+(\.\d+)*.*$/, "").replace(/\s*—.*$/, "").trim();
      if (!core) continue;
      if (!grouped[core]) grouped[core] = [];
      grouped[core].push(m);
    }
    for (const core in grouped) {
      const list = grouped[core];
      if (list.length > 1) {
        items.push({
          item_id: `MEM-${String(idSeq++).padStart(3, "0")}`,
          action_type: "need_user",
          priority: "suggest",
          target: list.map(m => m.title).join(" | "),
          suggestion: `同类多版本×${list.length}：「${core}」——对比created_at与内容覆盖度，旧版标注⚠️[已过时]或移_归档/（按三步走规范）`,
          status: "pending"
        });
      }
    }

    // 3) 标题前缀与文件夹错位
    for (const m of memories) {
      const title = m.title || "";
      const folder = m.folder || "";
      for (const rule of MEMORY_FOLDER_MAP) {
        if (title.startsWith(rule.prefix)) {
          const expect = rule.folder;
          if (expect !== "(根目录)" && folder !== expect && folder !== "") {
            items.push({
              item_id: `MEM-${String(idSeq++).padStart(3, "0")}`,
              action_type: "immediate",
              priority: "info",
              target: m.title,
              suggestion: `文件夹错位：「${title}」在${folder}，按前缀应归 ${expect}/（move_memory）`,
              status: "pending"
            });
          }
          break;
        }
      }
    }

    const critical = items.filter(i => i.priority === "critical").length;
    const suggest = items.filter(i => i.priority === "suggest").length;
    const info = items.filter(i => i.priority === "info").length;

    return {
      success: true,
      mode: "report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: { critical, suggest, info, total: items.length },
      items,
      checklist: [
        "① immediate项：建链（link_memories）或 move_memory 归簇，自动执行",
        "② need_user项：多版本冲突列出对比，用户确认后处理",
        "③ 处理完更新 [索引]记忆库目录 整理日志与过时登记表",
        "④ 孤立法则：链接数=0条目≥10条时才需批量补链，零星无需处理"
      ]
    };
  }

  // ---------- 工具3：手机空间整理 ----------
  async function organize_storage(params) {
    const p = params || {};
    const area = p.area || "all";
    const files = safeParse(p.files, null);

    if (!files || !Array.isArray(files)) {
      return {
        success: true,
        mode: "guide",
        spec_version: SPEC_VERSION,
        generated_at: now(),
        message: "未提供文件数据，先采集再分析：",
        guide: [
          "1. 根目录散落：find /sdcard -maxdepth 1 -type f",
          "2. Download根散落：find /sdcard/Download -maxdepth 1 -type f",
          "3. 临时文件：find /sdcard -maxdepth 3 -name '*.tmp' -o -name '*.log' -o -name '.*'（排除App目录）",
          "4. 提取字段：path / size / type（扩展名）",
          "5. 构造JSON数组传回本工具：{\"files\":\"[{\\\"path\\\":\\\"/sdcard/x.zip\\\",\\\"size\\\":1024,\\\"type\\\":\\\"zip\\\"}]\"}"
        ],
        no_touch_dirs: NO_TOUCH_DIRS,
        temp_patterns: TEMP_PATTERNS.map(r => r.toString())
      };
    }

    const items = [];
    let idSeq = 1;

    for (const f of files) {
      const path = f.path || "";
      const ext = (f.type || path.split(".").pop() || "").toLowerCase();
      const base = path.split("/").pop() || "";
      const depth = path.split("/").filter(Boolean).length - 1; // /sdcard 为第0层
      const isRootScatter = depth <= 1; // 根目录散落
      const isDownloadRoot = path.startsWith("/sdcard/Download/") && depth === 2;
      const isHidden = /^\..+/.test(base);
      const isTemp = TEMP_PATTERNS.some(r => r.test(base));

      // 不动区域过滤（文件所在目录属于NO_TOUCH则跳过；Download根散落文件除外——根散落是待整理项）
      const parts = path.split("/");
      const topDir = parts.length > 2 ? parts[2] : "";
      if (NO_TOUCH_DIRS.includes(topDir) && !isDownloadRoot) continue;

      // 临时文件/隐藏文件检测
      if (isTemp || isHidden) {
        items.push({
          item_id: `STO-${String(idSeq++).padStart(3, "0")}`,
          action_type: "need_user",
          priority: isHidden ? "suggest" : "critical",
          target: path,
          suggestion: `${isHidden ? "隐藏文件" : "临时文件"}（${f.size ? Math.round(f.size / 1024) + "KB" : "?"}）：确认非必要组件后删除（铁律用户约束②）`,
          status: "pending"
        });
        continue;
      }

      // 散落检测 + 归位建议
      if (isRootScatter || isDownloadRoot) {
        const rule = STORAGE_RULES.find(r => r.exts.includes(ext));
        if (rule) {
          items.push({
            item_id: `STO-${String(idSeq++).padStart(3, "0")}`,
            action_type: "immediate",
            priority: isRootScatter ? "suggest" : "info",
            target: path,
            suggestion: `散落文件「${base}」(${ext}) → 建议归位 ${rule.dir}（${rule.desc}；txt需先读内容判定）`,
            status: "pending"
          });
        } else {
          items.push({
            item_id: `STO-${String(idSeq++).padStart(3, "0")}`,
            action_type: "read_content",
            priority: "info",
            target: path,
            suggestion: `未知类型「${base}」(${ext})：先读内容判定，不确定放待确认/`,
            status: "pending"
          });
        }
      }
    }

    const critical = items.filter(i => i.priority === "critical").length;
    const suggest = items.filter(i => i.priority === "suggest").length;
    const info = items.filter(i => i.priority === "info").length;

    return {
      success: true,
      mode: "report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: { critical, suggest, info, total: items.length },
      items,
      checklist: [
        "① critical项（临时文件）：列出清单经用户确认后删除",
        "② read_content项：先读文件内容再归类（[规则]文件必须读内容再归类）",
        "③ immediate项：按建议 mv 归位（注意跨分区mv是复制、目标目录已存在会嵌套）",
        "④ 完成后更新分类体系记忆的整理日志",
        "⑤ 🔄 索引同步：调用 sync_index 传入新目录树+本次变更 → 覆盖刷新 /sdcard/文档/文件位置索引.md（闭环：整理→索引→找回，防其他AI迷路）"
      ]
    };
  }

  // ---------- 工具4：架构一致性复检 ----------
  async function verify_consistency(params) {
    const p = params || {};
    const links = safeParse(p.links, null);
    const versions = safeParse(p.versions, null);
    const packages = safeParse(p.packages, null);

    if (!links && !versions && !packages) {
      return {
        success: true,
        mode: "guide",
        spec_version: SPEC_VERSION,
        generated_at: now(),
        message: "未提供检查数据，按以下检查清单逐项执行（或采集数据传回）：",
        checks: HARNESS_CHECKS,
        guide: [
          "可选数据采集：",
          "1. links：extended_memory_tools:query_memory_links → [{\"source\":\"A\",\"target\":\"B\",\"type\":\"GOVERNS\"}]",
          "2. versions：grep技能文件+查记忆 → [{\"item\":\"HooksRegistry\",\"ref\":\"v5.0\",\"actual\":\"v5.1\"}]",
          "3. packages：operit_editor:list_sandbox_packages → {\"recorded\":\"89-60-29\",\"actual\":\"89-60-29\",\"skills\":41}"
        ]
      };
    }

    const findings = [];
    let idSeq = 1;

    // 1) 链接悬挂检测
    if (links && Array.isArray(links)) {
      const knownTitles = new Set();
      // 链接里的所有source和target都算已知节点
      for (const l of links) { knownTitles.add(l.source); knownTitles.add(l.target); }
      // 悬挂 = target不在任何source中出现过（单边引用且无节点表时无法判定，标记为需人工核对）
      const dangling = links.filter(l => !l.source || !l.target);
      if (dangling.length > 0) {
        findings.push({
          item_id: `HCK-${String(idSeq++).padStart(3, "0")}`,
          severity: "⚠️",
          target: "记忆链接",
          detail: `发现${dangling.length}条字段不完整链接，需人工核对`
        });
      }
      // 重复边检测
      const seen = new Set();
      const dup = [];
      for (const l of links) {
        const key = `${l.source}||${l.target}||${l.type || "related"}`;
        if (seen.has(key)) dup.push(key); else seen.add(key);
      }
      if (dup.length > 0) {
        findings.push({
          item_id: `HCK-${String(idSeq++).padStart(3, "0")}`,
          severity: "⚠️",
          target: "记忆链接",
          detail: `发现${dup.length}条重复边（source+target+type相同）`
        });
      }
      if (findings.length === 0) {
        findings.push({ item_id: "HCK-000", severity: "✅", target: "记忆链接", detail: `共${links.length}条链接，无悬挂/重复/字段缺失` });
      }
    }

    // 2) 版本引用矛盾
    if (versions && Array.isArray(versions)) {
      for (const v of versions) {
        if (v.ref && v.actual && v.ref !== v.actual) {
          findings.push({
            item_id: `HCK-${String(idSeq++).padStart(3, "0")}`,
            severity: "⚠️",
            target: v.item || "版本引用",
            detail: `「${v.item || "?"}」引用 ${v.ref}，实际应为 ${v.actual}——需按记忆一致性三步走修复`
          });
        }
      }
      if (versions.length > 0 && !findings.some(f => f.target === "版本引用")) {
        findings.push({ item_id: `HCK-${String(idSeq++).padStart(3, "0")}`, severity: "✅", target: "版本引用", detail: `检查了${versions.length}处版本引用，全部一致` });
      }
    }

    // 3) 包地图 checksum
    if (packages && packages.recorded && packages.actual) {
      if (packages.recorded !== packages.actual) {
        findings.push({
          item_id: `HCK-${String(idSeq++).padStart(3, "0")}`,
          severity: "⚠️",
          target: "包与技能地图",
          detail: `checksum不匹配：记录 ${packages.recorded}，实际 ${packages.actual}——需更新[索引]包与技能地图（自进化S1）`
        });
      } else {
        findings.push({ item_id: `HCK-${String(idSeq++).padStart(3, "0")}`, severity: "✅", target: "包与技能地图", detail: `checksum一致：${packages.recorded}` });
      }
    }

    const issues = findings.filter(f => f.severity === "⚠️").length;
    const ok = findings.filter(f => f.severity === "✅").length;

    return {
      success: true,
      mode: "report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: { issues, ok, total: findings.length },
      findings,
      remaining_checks: HARNESS_CHECKS.filter(c => ["HC-05", "HC-06", "HC-07"].includes(c.id)),
      conclusion: issues === 0 ? "✅ Harness 架构一致" : `⚠️ ${issues} 处不一致需修复（按[规则]记忆一致性维护规范三步走）`
    };
  }

  // ---------- 工具5：一键全量巡检 ----------
  async function run_all(params) {
    const p = params || {};
    const subChats = await organize_chats({ chats: p.chats });
    const subMem = await consolidate_memory({ memories: p.memories });
    const subSto = await organize_storage({ files: p.files });
    const subVer = await verify_consistency({ links: p.links });

    const allItems = [];
    const collect = (sub, prefix) => {
      if (sub.mode === "report" && Array.isArray(sub.items)) {
        for (const it of sub.items) allItems.push({ ...it, domain: prefix });
      }
      if (sub.mode === "report" && Array.isArray(sub.findings)) {
        for (const f of sub.findings) allItems.push({
          item_id: f.item_id, action_type: "need_user", priority: f.severity === "✅" ? "info" : "suggest",
          target: f.target, suggestion: f.detail, status: "pending", domain: prefix
        });
      }
    };
    collect(subChats, "对话");
    collect(subMem, "记忆");
    collect(subSto, "存储");
    collect(subVer, "架构");

    const priorityOrder = { critical: 0, suggest: 1, info: 2 };
    allItems.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

    const critical = allItems.filter(i => i.priority === "critical").length;
    const suggest = allItems.filter(i => i.priority === "suggest").length;
    const info = allItems.filter(i => i.priority === "info").length;

    return {
      success: true,
      mode: "master_report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: {
        critical, suggest, info, total: allItems.length,
        by_domain: {
          chats: subChats.mode === "report" ? subChats.summary.total : "guide",
          memory: subMem.mode === "report" ? subMem.summary.total : "guide",
          storage: subSto.mode === "report" ? subSto.summary.total : "guide",
          consistency: subVer.mode === "report" ? subVer.summary.total : "guide"
        }
      },
      sub_reports: {
        chats: subChats.mode === "report" ? { summary: subChats.summary } : { mode: "guide", message: subChats.message, guide: subChats.guide },
        memory: subMem.mode === "report" ? { summary: subMem.summary } : { mode: "guide", message: subMem.message, guide: subMem.guide },
        storage: subSto.mode === "report" ? { summary: subSto.summary } : { mode: "guide", message: subSto.message, guide: subSto.guide },
        consistency: subVer.mode === "report" ? { summary: subVer.summary, conclusion: subVer.conclusion } : { mode: "guide", checks: subVer.checks }
      },
      items: allItems,
      execution_order: [
        "① immediate项 → 按建议直接执行（无风险）",
        "② read_content项 → 先读文件/对话内容再判定（[规则]文件必须读内容再归类）",
        "③ need_user项 → 汇总清单，用户确认后执行",
        "④ 存储域整理完成后 → 🔄 调用 sync_index 刷新 /sdcard/文档/文件位置索引.md（目录树+变更→覆盖写入）",
        "⑤ 全部完成后 → 更新相关记忆（整理日志/过时登记表）+ 输出验收报告"
      ],
      note: "只读巡检，未执行任何修改。破坏性操作（删除/移动/合并）必须经用户确认（铁律规则2）。"
    };
  }

  // ---------- 工具6：索引同步（维护闭环最后一块） ----------
  async function sync_index(params) {
    const p = params || {};
    const dirs = safeParse(p.dirs, null);
    const updates = safeParse(p.updates, []);
    const pending = safeParse(p.pending, []);

    if (!dirs || !Array.isArray(dirs)) {
      return {
        success: true,
        mode: "guide",
        spec_version: SPEC_VERSION,
        generated_at: now(),
        message: "未提供目录数据，先采集再生成索引：",
        guide: [
          "1. 分类目录总览：for d in 文档 小说 安装包 压缩包 项目工程 游戏 逆向工程 备份数据 工具脚本 角色卡 Models 待确认 回收站 Pictures Movies; do echo \"$d: $(ls /sdcard/$d 2>/dev/null | wc -l) 项\"; done",
          "2. 重点目录子目录：ls /sdcard/文档/ /sdcard/Pictures/（自建相册）/sdcard/Movies/视频收藏/",
          "2.5 🔴 全局大文件扫描（防漏索引）：find /sdcard -maxdepth 5 -type f -size +100M -not -path '*/Android/data/*' 2>/dev/null —— 按大小过滤（不枚举扩展名，任何大文件都覆盖），含 /sdcard/下载/（下载工具目录）、根目录等所有位置；大文件条目 files=全部大文件数，note 列出文件名",
          "3. 构造 dirs JSON：[{\"dir\":\"文档\",\"files\":14,\"subdirs\":[\"学习资料\",\"教程说明书\"],\"note\":\"正式文档\"}]",
          "4. updates（本次归位变更，可选）：[{\"from\":\"/sdcard/x.zip\",\"to\":\"/sdcard/压缩包/x.zip\"}]",
          "5. pending（待处理项，可选）：[\"回收站/full.docx等用户决定删除\"]",
          "6. 传回本工具：{\"dirs\":\"...\",\"updates\":\"...\",\"pending\":\"...\"} → 输出完整索引Markdown，直接覆盖写入 /sdcard/文档/文件位置索引.md"
        ]
      };
    }

    // ---- 固定模板（索引文档稳定骨架，本地版按实际环境维护） ----
    const INDEX_HEADER = `# 📁 手机文件位置索引

> 更新：${now()} | 用途：**任何 AI 找不到文件时，先读本文件定位，再下结论**
> 文件可能已被分类归位——find 不到 ≠ 数据被清理！

---

## ⚡ 快速查找指南（找不到文件时的排查顺序）

\`\`\`
1. 读本索引 → 判断文件类型 → 去对应目录找
2. 全盘搜索：find /sdcard -name "*关键词*"（排除 App 目录：Android/DCIM/Download 等）
3. 查回收站：/sdcard/回收站/
4. 查待确认：/sdcard/待确认/
5. 仍找不到 → 才可以说"可能被清理"，并询问用户是否确认过删除
\`\`\`

---

## 📂 分类目录总览（AI 整理的归位目标）

| 目录 | 内容 | 典型子目录/文件 |
|---|---|---|
`;

    const INDEX_FOOTER = `---

## 🔒 不动区域（App/系统目录，勿动）

Android/、DCIM/、Download/、Documents/、Music/、Recordings/、GAMES/、123云盘/、Tencent/、UCDownloads/、baidu/、cache/、com.*/、vivo*/、工具大师/、制作铃声/、阅图锁屏/、i Music/、音乐/、音乐搜索/、下载/、backups/、丝竹居/、mit/、Operit/

---

## ⚠️ 特别提醒（给其他 AI）

1. **文件被移动归位是常态**：根目录/Download 根散落文件会被收进分类目录，find 时先按类型猜位置
2. **隐私文件**：按用户偏好存放（本地版：备份数据/个人记录/），勿外泄
3. **AI 生成的脚本**在 \`工具脚本/\`，临时文件在 \`/data/local/tmp/\`（用完即删）
4. 本索引由 sys_organizer 维护体系生成（sync_index 自动刷新），分类规则见记忆库 \`[用户]偏好—手机文件分类体系规范\`
5. **大文件规则**：>100MB 大文件（模型 .gguf/.safetensors、大安装包、大压缩包等任何类型）只记录索引、不自动移动（除非用户要求）；大文件统一放 \`Models/\` 或用户指定目录
6. **下载工具目录**（\`/sdcard/下载/\`）：App 自动分类目录，不移动其内部文件，但内容必须纳入索引（扫描时别漏）`;

    // ---- 动态部分 ----
    const rows = dirs.map(d => {
      const sub = (d.subdirs && d.subdirs.length) ? d.subdirs.join("、") : "—";
      const fileInfo = d.files !== undefined ? `（${d.files} 文件${d.subdirs && d.subdirs.length ? " + " + d.subdirs.length + " 子目录" : ""}）` : "";
      return `| \`${d.dir}/\` | ${d.note || ""}${fileInfo} | ${sub} |`;
    }).join("\n");

    let changesBlock = "（无变更）";
    if (updates && updates.length) {
      changesBlock = updates.map(u => `- \`${u.from}\` → \`${u.to}\``).join("\n");
    }

    let pendingBlock = "（无）";
    if (pending && pending.length) {
      pendingBlock = pending.map(x => `- ${x}`).join("\n");
    }

    const markdown = `${INDEX_HEADER}
${rows}

---

## 🔄 本次整理变更记录（sys_organizer 自动同步）

${changesBlock}

---

## 📌 当前待处理

${pendingBlock}

${INDEX_FOOTER}`;

    return {
      success: true,
      mode: "report",
      spec_version: SPEC_VERSION,
      generated_at: now(),
      summary: {
        dirs: dirs.length,
        changes: updates ? updates.length : 0,
        pending: pending ? pending.length : 0
      },
      target_path: "/sdcard/文档/文件位置索引.md",
      index_markdown: markdown,
      checklist: [
        "① 用 create_file 将 index_markdown 全文覆盖写入 /sdcard/文档/文件位置索引.md",
        "② 验证：read_file 确认写入成功、格式完整（表格/分区齐全）",
        "③ 目录结构有重大变化时同步更新记忆库 [规则]文件查找规范 的类型→位置映射"
      ]
    };
  }

  return {
    organize_chats,
    consolidate_memory,
    organize_storage,
    verify_consistency,
    run_all,
    sync_index
  };
})();

// 导出工具
exports.organize_chats = sysOrganizer.organize_chats;
exports.consolidate_memory = sysOrganizer.consolidate_memory;
exports.organize_storage = sysOrganizer.organize_storage;
exports.verify_consistency = sysOrganizer.verify_consistency;
exports.run_all = sysOrganizer.run_all;
exports.sync_index = sysOrganizer.sync_index;
