import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync(new URL('../.github/workflows/android-apk.yml', import.meta.url), 'utf8');
const icon = fs.readFileSync(new URL('../android-resources/mipmap-anydpi/ic_launcher.xml', import.meta.url), 'utf8');
const adaptiveIcon = fs.readFileSync(new URL('../android-resources/mipmap-anydpi-v26/ic_launcher.xml', import.meta.url), 'utf8');

test('Android build installs the Star Wish Together launcher icon', () => {
  assert.match(workflow, /mipmap-anydpi-v26\/ic_launcher\.xml/);
  assert.match(workflow, /mipmap-anydpi\/ic_launcher\.xml/);
  assert.match(workflow, /@mipmap\/ic_launcher_round\|@drawable\/ic_launcher/);
  assert.match(workflow, /@mipmap\/ic_launcher\|@drawable\/ic_launcher/);
  assert.match(icon, /#101530/);
  assert.match(icon, /#FFFFD58B/);
  assert.match(adaptiveIcon, /adaptive-icon/);
});
