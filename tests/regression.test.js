import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

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
  assert.match(html, /测试版 0\.3\.0/);
  assert.match(app, /navigator\.share/);
  assert.match(app, /navigator\.canShare/);
  assert.match(app, /APP_VERSION/);
});

