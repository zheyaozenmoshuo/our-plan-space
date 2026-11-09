# 回忆详情查看与图片取回 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为回忆增加独立查看弹窗，让用户能浏览 App 内保存的照片，并复制或下载照片。

**Architecture:** 延续现有单页 HTML、原生 `dialog`、Base64 图片数据和事件绑定方式，不新增路由或云服务。详情弹窗读取当前回忆的 `photos` Data URL，下载通过 Blob/Object URL，复制通过 Clipboard API 能力检测。

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node.js built-in tests, Capacitor Android WebView.

**Spec:** `docs/superpowers/specs/2026-11-09-memory-view-design.md`

## Global Constraints

- 照片必须继续保存在回忆数据中，不依赖手机相册原文件。
- 不改变现有计划页整体视觉风格。
- 不支持图片剪贴板的设备必须显示提示，不得抛出未处理异常。
- 编辑、删除只能在用户明确点击后发生。

## Review Focus

- 回忆无照片：查看弹窗显示空状态，复制/下载按钮不可误操作。
- 回忆有多张照片：切换当前照片后复制/下载必须使用当前照片。
- Base64 图片下载：下载文件具有图片 MIME 类型和可识别扩展名。
- Clipboard API 不可用：界面显示提示，回忆数据不变。
- 关闭查看弹窗：不会触发编辑或保存。

### Task 1: Add failing regression tests

**Files:**
- Modify: `tests/regression.test.js`

- [ ] Add assertions for `memoryViewModal`, view action, photo gallery, copy/download handlers, and no-photo state.
- [ ] Run `npm test` and verify the new assertions fail because the view layer does not exist.

### Task 2: Add memory detail view markup and behavior

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [ ] Add `memoryViewModal` with title, date, text, main photo, thumbnails, copy/download buttons, edit/delete/close actions.
- [ ] Add `openMemoryView(memoryId)`, `renderMemoryView()`, `copyMemoryPhoto()`, and `downloadMemoryPhoto()` using the existing memory data.
- [ ] Make memory cards and an explicit “查看回忆” button open the view modal; move edit/delete actions into the detail actions without changing their semantics.
- [ ] Ensure missing photos produce an empty state and disable photo operations.

### Task 3: Improve memory card and detail visuals

**Files:**
- Modify: `styles-overrides.css`

- [ ] Style memory cards as tappable preview cards with photo count, date, and clear view affordance.
- [ ] Style the detail modal gallery, active thumbnail, action bar, empty state, and mobile layout.

### Task 4: Verify and commit

**Files:**
- Modify: `service-worker.js` if the new CSS/asset cache list requires it.

- [ ] Run `node --check app.js`.
- [ ] Run `npm test` and confirm all tests pass.
- [ ] Review the diff and commit with `feat: add memory detail viewer`.
