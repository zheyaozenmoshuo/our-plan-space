import { mergeWorkspace } from './data-model.js';

export const SYNC_SCHEMA_VERSION = 1;
export const QR_PAYLOAD_LIMIT = 3500;

export function exportWorkspace(workspace) {
  return JSON.stringify({ schemaVersion: SYNC_SCHEMA_VERSION, workspace });
}

export function importWorkspace(raw, local = null) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!parsed || parsed.schemaVersion !== SYNC_SCHEMA_VERSION || !parsed.workspace?.id) throw new Error('备份版本或 Workspace 数据无效');
  if (local && local.id !== parsed.workspace.id) throw new Error('只能导入同一个共同空间的数据');
  return structuredClone(parsed.workspace);
}

export function toQrPayload(workspace) {
  const lightweight = structuredClone(workspace);
  lightweight.memories = (lightweight.memories ?? []).map((memory) => ({ ...memory, photos: [] }));
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ schemaVersion: SYNC_SCHEMA_VERSION, workspace: lightweight }))));
  if (encoded.length > QR_PAYLOAD_LIMIT) throw new Error('二维码内容过大，请改用完整备份文件导出');
  return `OURPLAN:${encoded}`;
}

export function fromQrPayload(payload) {
  if (typeof payload !== 'string' || !payload.startsWith('OURPLAN:')) throw new Error('同步内容格式无效');
  const encoded = payload.slice('OURPLAN:'.length);
  return importWorkspace(decodeURIComponent(escape(atob(encoded))));
}

export function previewImport(local, raw) {
  const incoming = importWorkspace(raw, local);
  const result = mergeWorkspace(local, incoming);
  return { ...result, incoming };
}

