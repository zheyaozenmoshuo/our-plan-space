const DEFAULT_CATEGORY = '日常小事';

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
}

function clone(value) {
  return structuredClone(value);
}

export function createWorkspace(title = '我们的共同计划', timestamp = nowIso()) {
  return {
    id: makeId('space'),
    title: title.trim() || '我们的共同计划',
    createdAt: timestamp,
    updatedAt: timestamp,
    plans: [],
    memories: [],
    settings: { categories: ['想去的地方', '想一起体验', DEFAULT_CATEGORY, '未来目标'] },
  };
}

export function createPlan(input = {}, timestamp = nowIso()) {
  const title = String(input.title ?? '').trim();
  if (!title) throw new Error('计划标题不能为空');
  return {
    id: input.id ?? makeId('plan'),
    title,
    category: String(input.category ?? DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY,
    note: String(input.note ?? '').trim(),
    status: input.status === 'completed' ? 'completed' : 'planned',
    completedAt: input.completedAt ?? null,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp,
    deletedAt: input.deletedAt ?? null,
  };
}

export function createMemory(planId, input = {}, timestamp = nowIso()) {
  if (!planId) throw new Error('回忆必须关联计划');
  return {
    id: input.id ?? makeId('memory'),
    planId,
    text: String(input.text ?? '').trim(),
    photos: Array.isArray(input.photos) ? input.photos : [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp,
    deletedAt: input.deletedAt ?? null,
  };
}

function entityMap(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function mergeEntities(localItems, incomingItems) {
  const map = entityMap(localItems.map(clone));
  let added = 0;
  let updated = 0;
  let conflicts = 0;

  for (const incoming of incomingItems) {
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, clone(incoming));
      added += 1;
      continue;
    }
    conflicts += 1;
    if (new Date(incoming.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      map.set(incoming.id, clone(incoming));
      updated += 1;
    }
  }

  return { items: [...map.values()], added, updated, conflicts };
}

export function mergeWorkspace(local, incoming) {
  if (!local?.id || !incoming?.id || local.id !== incoming.id) {
    return { workspace: clone(local), added: 0, updated: 0, conflicts: 0, rejected: true, reason: '只能合并同一个共同空间的数据' };
  }
  const plans = mergeEntities(local.plans ?? [], incoming.plans ?? []);
  const memories = mergeEntities(local.memories ?? [], incoming.memories ?? []);
  const workspace = clone(local);
  workspace.plans = plans.items;
  workspace.memories = memories.items;
  workspace.updatedAt = new Date(Math.max(
    new Date(local.updatedAt).getTime(),
    new Date(incoming.updatedAt).getTime(),
  )).toISOString();
  return {
    workspace,
    added: plans.added + memories.added,
    updated: plans.updated + memories.updated,
    conflicts: plans.conflicts + memories.conflicts,
    rejected: false,
    reason: '',
  };
}

export function softDeletePlan(workspace, planId, timestamp = nowIso()) {
  const next = clone(workspace);
  const plan = next.plans.find((item) => item.id === planId);
  if (!plan) throw new Error('找不到计划');
  plan.deletedAt = timestamp;
  plan.updatedAt = timestamp;
  next.updatedAt = timestamp;
  return next;
}

export function restoreEntity(workspace, entityType, id, timestamp = nowIso()) {
  const next = clone(workspace);
  const collection = entityType === 'memory' ? next.memories : next.plans;
  const entity = collection.find((item) => item.id === id);
  if (!entity) throw new Error('找不到要恢复的记录');
  entity.deletedAt = null;
  entity.updatedAt = timestamp;
  next.updatedAt = timestamp;
  return next;
}

export function updatePlan(workspace, planId, patch, timestamp = nowIso()) {
  const next = clone(workspace);
  const plan = next.plans.find((item) => item.id === planId);
  if (!plan) throw new Error('找不到计划');
  Object.assign(plan, patch, { updatedAt: timestamp });
  next.updatedAt = timestamp;
  return next;
}

export function updateMemory(workspace, memoryId, patch, timestamp = nowIso()) {
  const next = clone(workspace);
  const memory = next.memories.find((item) => item.id === memoryId);
  if (!memory) throw new Error('找不到回忆');
  Object.assign(memory, patch, { updatedAt: timestamp });
  next.updatedAt = timestamp;
  return next;
}

export function softDeleteMemory(workspace, memoryId, timestamp = nowIso()) {
  return updateMemory(workspace, memoryId, { deletedAt: timestamp }, timestamp);
}

