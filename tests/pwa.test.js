import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const worker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

test('declares an installable standalone app', () => {
  assert.match(html, /rel="manifest"/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.ok(manifest.icons.length >= 2);
});

test('service worker caches the app shell and handles offline navigation', () => {
  assert.match(worker, /CACHE_NAME/);
  assert.match(worker, /index\.html/);
  assert.match(worker, /fetch/);
  assert.match(worker, /caches\.match/);
});

test('page does not show obsolete home-screen install guidance', () => {
  assert.doesNotMatch(html, /id="installButton"/);
  assert.doesNotMatch(html, /id="installModal"/);
});

