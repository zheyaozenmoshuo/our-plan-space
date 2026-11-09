import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

test('memory cancel controls cannot submit the memory form', () => {
  assert.match(html, /id="memoryModal"[\s\S]*button[^>]+type="button"[^>]+data-close-dialog="memoryModal"/);
  assert.match(html, /id="memoryModal"[\s\S]*button[^>]+type="button"[^>]+data-close-dialog="memoryModal"[^>]*>取消/);
});

test('memory editor supports multiple photos and renders photo previews', () => {
  assert.match(html, /id="memoryPhoto"[^>]+multiple/);
  assert.match(html, /id="memoryPreview"[^>]*class="memory-preview-grid"/);
  assert.match(app, /currentPhotos/);
  assert.match(app, /Promise\.all/);
});

test('sync panel explains backup location and text sync usage', () => {
  assert.match(html, /备份文件/);
  assert.match(html, /复制文本/);
  assert.match(app, /navigator\.share/);
});

test('sync actions can invoke the system share sheet and expose the app version', () => {
  assert.match(html, /测试版 0\.4\.0/);
  assert.match(app, /navigator\.share/);
  assert.match(app, /navigator\.canShare/);
  assert.match(app, /APP_VERSION/);
});

test('selected app identity is reflected in name, icon, and startup animation', () => {
  assert.equal(manifest.name, '星愿同行');
  assert.equal(manifest.short_name, '星愿同行');
  assert.match(html, /id="appSplash"/);
  assert.match(html, /星愿同行/);
  assert.match(app, /appSplash/);
});

test('full backups have an in-app backup box with restore and delete controls', () => {
  assert.match(html, /id="backupList"/);
  assert.match(html, /保存完整备份到 App/);
  assert.match(app, /BACKUP_KEY/);
  assert.match(app, /restoreBackup/);
  assert.match(app, /deleteBackup/);
});

test('backup sharing falls back to sharing the backup content as text', () => {
  assert.match(app, /const title='星愿同行完整备份'/);
  assert.match(app, /当前设备没有系统分享功能/);
  assert.doesNotMatch(app, /当前环境不支持直接分享文件/);
});

test('pasted backup text can be imported alongside light sync codes', () => {
  assert.match(html, /粘贴同步内容（轻量码或备份文本）/);
  assert.match(app, /JSON\.parse\(raw\)/);
});

test('a backup can initialize an empty device with a different workspace id', () => {
  assert.match(app, /workspace\.plans\.length===0&&workspace\.memories\.length===0/);
  assert.match(app, /用这份备份初始化当前设备/);
  assert.match(app, /workspace=clone\(incoming\)/);
  assert.match(app, /合并到当前共同空间/);
});

test('each in-app backup can use the Android native file share bridge', () => {
  assert.match(app, /data-backup-share/);
  assert.match(app, /native-plugins\.js/);
  assert.match(app, /Filesystem\.writeFile/);
  assert.match(app, /Share\.share/);
  assert.match(app, /directory:'CACHE'/);
});

test('memory cards open a dedicated read-only detail view', () => {
  assert.match(html, /id="memoryViewModal"/);
  assert.match(app, /openMemoryView/);
  assert.match(app, /data-memory-action="view"/);
});

test('memory detail supports photo switching, copying, downloading, and empty state', () => {
  assert.match(app, /downloadMemoryPhoto/);
  assert.match(app, /URL\.createObjectURL/);
  assert.match(app, /没有保存照片/);
});

test('memory detail only exposes saving photos, not clipboard copying', () => {
  assert.doesNotMatch(html, /id="copyMemoryPhoto"/);
  assert.doesNotMatch(app, /document\.getElementById\('copyMemoryPhoto'\)/);
});

test('Android memory photo actions use gallery storage and fallback storage', () => {
  assert.match(app, /native\.Media\.savePhoto/);
  assert.match(app, /albumIdentifier/);
  assert.match(app, /星愿同行/);
  assert.match(app, /directory:'DOCUMENTS'/);
  assert.match(app, /文档\/星愿同行/);
  assert.match(app, /native\.Share\.share/);
});

test('shared profile easter egg has an isolated read-only modal', () => {
  assert.match(html, /id="sharedProfileModal"/);
  assert.match(html, /id="sharedProfilePlanCount"/);
  assert.match(html, /id="sharedProfileMemoryCount"/);
  assert.match(app, /sharedProfileClickCount/);
  assert.match(app, /openSharedProfile/);
  assert.match(app, /sharedProfileClickCount===5/);
  assert.match(app, /1500/);
  assert.match(app, /第一件共同完成的事，正在等你们写下/);
  assert.match(app, /sharedProfileCode/);
});

