# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.7)
- **Status**: **ALL REGRESSIONS PURGED & GOLDEN PROPERTIES RESTORED · 43/43 TEST SUITE PASS · 0 TS ERRORS · PHYSICAL DEPLOYMENT COMPLETE**

---

## 🎯 深度复盘与拨乱反正：被破坏的“黄金属性”全量还原

### 1. 根治“显示一会儿突然闪退消失”的恶性体验
* **事故根因定位**：
  1. 之前自作聪明地把超时硬编码成了 8 秒；在主模型处理繁重工具调用或处理 Follow-up 排队消息时，本地网关发生并发排队，8 秒直接超时；
  2. 一旦超时抛出异常，旧代码在 `catch` 和 `else` 里无脑执行了 `ctx.ui.setWidget("lingua_hud", undefined)`，把小部件给直接清空了！导致用户看着骨架屏转了 8 秒，然后突然凭空闪退消失！
* **物理根治方案**：
  1. 超时时间恢复为稳健充裕的 **30 秒 (30000ms)**，杜绝高负载下的虚假超时；
  2. 即使底层因网络或模型不可用返回 null，**绝对不调用 `setWidget(undefined)` 让小部件神经质般闪退消失**，而是平稳保留原句锚点并呈现静态提示，界面坚如磐石。

---

### 2. 彻底拔除自残式守卫，100% 恢复“母语语感”与“重点词汇”
* **事故根因定位**：
  在之前的防截断分级守卫中，为了卡死行数，在 Tier 2 / Tier 3 中自残式地把 `spokenMeaning`、`writtenMeaning` 和 `vocab` 剥离删除了！导致用户看到的卡片变成了光秃秃的纯英文，丢掉了伴学插件最重要的灵魂！
* **物理根治方案**：
  1. **绝对禁止剥离母语语感与重点词汇**：母语语感永远保留！展开放不下时，优雅内联到双模括号中：
     `┌ [Spoken]   ... (母语真实口语意会)`
     `├ [Written]  ... (母语严谨规范意会)`
     `└ [Vocab]    term1 (释义) · term2 (释义)`
  2. 若遇到极端窄屏或超长语句，优雅平滑降级为**单行胶囊模式 (Capsule Mode)**，绝不输出阉割残缺的半成品卡片！

---

### 3. 排版标点禁则（Kinsoku Shori）根除行首孤立标点
* **事故根因定位**：
  `wrapVisualText` 遇到连续长句折行时，把逗号折到了下一行行首，出现了 `, leveraging...` 的恶劣排版硬伤。
* **物理根治方案**：
  引入标点禁则处理集合 `CANNOT_START_LINE_CHARS`，遇到行首标点强制吸附回上一行行末，彻底杜绝孤立标点。

---

### 4. 彻底解决 Follow-up 连续多张截图路径的剥离
* 循环剥离所有开头的图片路径前缀，确保排队多张截图时，依然能精准萃取后续的人类自然语言提问并正常触发翻译。

---

## 🛠️ 物理执行与版本交付数据
- **测试套件**：**43 / 43 套件全量通过 (100% Pass · 0 Fail)**
- **TypeScript 静态检查**：`npm run typecheck` **0 错误、0 警告**
- **npm 版本号**：`pi-lingual@0.2.7` (`package.json`)
- **宿主物理覆盖**：编译产物全量覆盖至 `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`
