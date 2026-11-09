# “我们的专属档案”彩蛋实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有情侣计划 App 中加入一个通过首页星星连续点击解锁的“我们的专属档案”纪念页。

**Architecture:** 使用现有 `workspace` 数据实时计算档案内容，不新增数据表、云服务或同步字段。首页星星区域只负责累计连续点击并触发档案弹窗；档案页面使用现有 `dialog` 模式和已有样式体系展示统计与文案。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Node.js 内置测试、Capacitor Android 构建。

**Spec:** `docs/superpowers/specs/2026-11-09-shared-profile-easter-egg-design.md`

## Global Constraints

- 入口为首页星星装饰区域连续点击 5 次，普通点击不得误触发。
- 档案内容必须从当前 `workspace` 实时计算，不保存重复统计数据。
- 不新增账号、云端服务、付费存储或铭牌项目业务。
- 计划、回忆、照片保存、备份和同步功能必须保持不变。

## Review Focus

- 连续点击计数：点击间隔过长时应重新计数，避免误触发。
- 空数据状态：没有完成计划或回忆时不能出现虚假统计。
- 计划删除/恢复和同步合并后：档案统计应跟随当前有效数据更新。
- 档案编号：同一个共同空间在两台设备上应显示一致编号。
- 弹窗关闭：关闭档案后不能修改计划或回忆数据。

---

### Task 1: 先补充彩蛋行为回归测试

**Files:**
- Modify: `tests/regression.test.js`

**Interfaces:**
- Tests the HTML hook `id="sharedProfileModal"` and app hooks `sharedProfileClickCount`, `openSharedProfile`.

- [ ] **Step 1: Write the failing tests**

增加测试，验证：档案弹窗存在；首页星星区域存在彩蛋点击绑定；代码包含 5 次点击阈值、计时重置、空状态文案、完成计划和回忆统计、短档案编号计算。

- [ ] **Step 2: Run the focused tests**

Run: `npm test`

Expected: 新增彩蛋测试失败，现有测试继续通过。

### Task 2: 加入档案弹窗与展示结构

**Files:**
- Modify: `index.html`
- Modify: `styles-overrides.css`

**Interfaces:**
- Produces `sharedProfileModal` with fields `sharedProfileCreatedAt`, `sharedProfilePlanCount`, `sharedProfileMemoryCount`, `sharedProfileFirstPlan`, `sharedProfileMessage`, and `sharedProfileCode`.

- [ ] **Step 1: Add the read-only modal markup**

在现有页面中增加纪念卡片式弹窗；只提供关闭按钮，不提供编辑入口，不修改任何业务数据。

- [ ] **Step 2: Add the visual treatment**

增加与当前 App 风格一致的档案卡片、星光装饰、统计项和空状态样式；不改动全局视觉方向。

- [ ] **Step 3: Run HTML regression tests**

Run: `npm test`

Expected: 结构相关测试通过，行为相关测试仍因 JS 未实现而失败。

### Task 3: 实现解锁手势与实时档案内容

**Files:**
- Modify: `app.js`
- Test: `tests/regression.test.js`

**Interfaces:**
- Add `sharedProfileClickCount` and `sharedProfileClickTimer` state.
- Add `openSharedProfile()` to calculate and render the current workspace snapshot.
- Add `handleSharedProfileTrigger()` to count clicks within a 1500ms window and open after exactly 5 clicks.

- [ ] **Step 1: Implement the click counter**

给首页星星区域绑定点击事件；每次点击后在 1500ms 内继续累计，超时归零；达到 5 次时清零计数并打开档案。

- [ ] **Step 2: Implement live statistics**

从 `activePlans()` 和 `activeMemories()` 计算有效计划数、已完成计划数、回忆数；从完成计划中找到最早完成的一项；没有数据时使用设计稿中的空状态文案。

- [ ] **Step 3: Implement the stable profile code**

从 `workspace.id` 生成固定的短档案编号，同一共同空间在不同设备上保持一致；不展示完整内部 ID。

- [ ] **Step 4: Wire close behavior and render refresh**

档案弹窗关闭后只恢复界面状态；每次打开重新计算，确保同步、恢复和删除后数据准确。

- [ ] **Step 5: Run the full test suite**

Run: `node --check app.js; npm test`

Expected: 全部测试通过，包含彩蛋专项测试。

### Task 4: 构建验证与交付

**Files:**
- Verify: `app.js`, `index.html`, `styles-overrides.css`, `tests/regression.test.js`

- [ ] **Step 1: Review the diff**

Run: `git diff --check; git diff --stat`

Expected: 无空白错误；改动只涉及彩蛋展示、交互和测试。

- [ ] **Step 2: Commit the feature**

```bash
git add app.js index.html styles-overrides.css tests/regression.test.js
git commit -m "feat: add shared profile easter egg"
```

- [ ] **Step 3: Push and verify the Android workflow**

推送到 `main`，等待 GitHub Actions 的 Android APK 构建成功，再提供新的构建下载链接。
