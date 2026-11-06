import { createWorkspace } from './data-model.js';

export const SCHEMA_VERSION = 1;
const DB_NAME = 'our-plan-space';
const STORE_NAME = 'workspace';
const KEY = 'current';
const LOCAL_KEY = 'our-plan-space-fallback';

export function serializeWorkspace(workspace) {
  return { schemaVersion: SCHEMA_VERSION, workspace: structuredClone(workspace) };
}

export function deserializeWorkspace(payload) {
  if (!payload || payload.schemaVersion !== SCHEMA_VERSION) throw new Error('不支持的备份版本');
  const workspace = payload.workspace;
  if (!workspace || typeof workspace.id !== 'string' || !Array.isArray(workspace.plans) || !Array.isArray(workspace.memories)) {
    throw new Error('备份中的 Workspace 数据无效');
  }
  return structuredClone(workspace);
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('当前浏览器不支持 IndexedDB'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('无法打开本地存储'));
  });
}

export async function loadWorkspace() {
  try {
    const db = await openDb();
    const result = await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return result ? deserializeWorkspace(result).workspace : null;
  } catch (error) {
    const raw = globalThis.localStorage?.getItem(LOCAL_KEY);
    if (raw) return deserializeWorkspace(JSON.parse(raw));
    if (error?.message?.includes('不支持') || error?.name === 'SecurityError') return null;
    throw error;
  }
}

export async function saveWorkspace(workspace) {
  const payload = serializeWorkspace(workspace);
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(payload, KEY);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    if (!globalThis.localStorage) throw error;
    globalThis.localStorage.setItem(LOCAL_KEY, JSON.stringify(workspace));
  }
}

export async function ensureWorkspace(title) {
  const existing = await loadWorkspace();
  if (existing) return existing;
  const workspace = createWorkspace(title);
  await saveWorkspace(workspace);
  return workspace;
}

