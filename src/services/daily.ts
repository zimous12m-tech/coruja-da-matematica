import type { Question, WorldId } from '../content/schema';
import { loadWorldQuestions } from '../content/worlds';
import { load, todayKey } from './save';

let poolCache: Question[] | null = null;

async function loadPool(): Promise<Question[]> {
  if (poolCache) return poolCache;
  const worldIds: WorldId[] = [
    'mundo-1', 'mundo-2', 'mundo-3', 'mundo-4', 'mundo-5', 'mundo-6'
  ];
  const all: Question[] = [];
  for (const wid of worldIds) {
    const qs = await loadWorldQuestions(wid);
    all.push(...qs);
  }
  poolCache = all;
  return all;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export async function getDailyQuestions(): Promise<Question[]> {
  const pool = await loadPool();
  if (pool.length === 0) return [];
  let seed = hashString(todayKey());
  const picked: Question[] = [];
  const seen = new Set<string>();
  let idx = seed % pool.length;
  let attempts = 0;
  while (picked.length < 3 && attempts < pool.length * 2) {
    attempts += 1;
    const q = pool[idx % pool.length];
    if (q && !seen.has(q.id)) {
      seen.add(q.id);
      picked.push(q);
    }
    idx = (idx + 1) % pool.length;
  }
  return picked;
}

export function isDailyDone(): boolean {
  const save = load();
  return save.dailyDate === todayKey() && save.dailyDone;
}
