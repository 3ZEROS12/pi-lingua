# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.3.0)
- **Status**: **PHANTOM CHUNK PURGED & READY-SAFE PAGINATION DELIVERED · 45/45 TESTS PASS · 0 TS ERRORS · FULL PHYSICAL DEPLOYMENT**

---

## 🎯 深度根因剖析：“第三页操作之后反而是第一页”与形态撕裂现场复盘

### 1. 现场故障复盘（Post-Mortem）
* **会话 ID**：`01a11ead-61e9-721e-98c9-d97fb71a9d92`
* **用户输入**：
  `不知道为什么，想要背诵一首古诗，床前明月关，疑是地上霜，举头望明月，低头思故乡。君不见，高堂明镜悲白发，朝如青丝暮成雪。岑夫子，丹丘生，将进酒，杯莫停。日照香炉生紫烟，要看瀑布挂前川。C:\Users\Jason\Desktop\CURRENT_MISSION_STATE.mdC:\Users\Jason\AppData\Local\Temp\pi-clipboard-3372a8e2-6500-45a5-87b4-6749a6f85d60.png`
* **异常现象**：
  1. 卡片角标提示 `[1/3 ⌥.]` 与 `[2/3 ⌥.]`，给用户造成“一共有 3 页”的假象；
  2. 用户在第 2 页按 `Alt+.` 试图查看第 3 页时，卡片**出人意料地直接跳回了第 1 页**！
  3. 第 1 页呈现为单行胶囊模式，而第 2 页呈现为完整树状模式（视觉形态撕裂）。

---

### 2. 底层物理根因定位（Root Causes）
1. **幽灵切片（Phantom Chunk）**：
   - 用户在诗词末尾附带了截图与临时状态文件路径；
   - 旧版清洗正则带有行首锚点 `^...`，**无法剥离文本末尾/行中夹带的路径**；
   - 导致该长路径被分句器当成正常的自然语言，切分成了 **第 3 个切片（chunk 2）**，`totalExpectedPages` 被虚标成了 3；
   - 后台异步翻译时，chunk 2 是一串纯路径，被 `shouldTriggerTranslation` 拒翻（返回 null），导致 **`pagedResults[2]` 根本不存在（是 undefined）**！实际有效卡片只有 2 张（`length = 2`）！
2. **取模翻页的逻辑漏洞（Ready-Safe Desync）**：
   - 翻页快捷键取模逻辑写着：`currentPageIndex = (currentPageIndex + 1) % pagedResults.length;`
   - 当在第 2 页（`index = 1`）按翻页时，由于实际有效长度只有 2：
     `(1 + 1) % 2 = 0`！
     **直接取模跳回了第 1 页！用户永远看不到第 3 页！**
3. **首页超行逼成胶囊（Line Budget Clamping）**：
   - 旧版 `maxChunkChars = 90` 粒度过粗，把《静夜思》与《将进酒》硬揉在同一个卡片（80+ 汉字），展开行数达到 10 行，触发硬预算降级逼成了单行胶囊；而第 2 页《望庐山瀑布》只有 14 字，得以完整展开为树状。

---

### 3. 终极物理根治方案
1. **全文路径彻底剥离（Full-Text Path Stripping）**：
   `sanitizePromptForTranslation` 引入全局正则，彻底剥离混杂在文本任何位置的剪贴板图片与临时文件路径，存入 `rawPayload` 供 AI 上下文无损使用，自然语言文本彻底纯净化，**幽灵切片彻底根绝，真实切片精准收敛！**
2. **就绪安全翻页（Ready-Safe Pagination）**：
   角标显示与翻页循环**严格以实际翻译就绪的有效卡片 `readyList.length` 为准**！如果只有 2 页就绪，角标实事求是显示 `[1/2]` 和 `[2/2]`，绝对不虚标透支，翻页心智模型 100% 吻合！
3. **切片粒度优雅调优（Semantic Chunking Granularity）**：
   将 `maxChunkChars` 校准至 65 字符，让每首诗/每个段落舒展独立成卡，行数保持在 6~8 行，**100% 完整展开为极具美感的树状图，绝不触发胶囊降级！**

---

## 🛠️ 物理执行与版本交付数据
- **测试套件**：**45 / 45 套件全量通过 (100% Pass · 0 Fail)**
- **TypeScript 静态检查**：`npm run typecheck` **0 错误、0 警告**
- **npm 版本号**：`pi-lingual@0.3.0` (`package.json`)
- **宿主物理覆盖**：全量编译产物、源码、CLI、文档已物理同步覆盖至 `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`
