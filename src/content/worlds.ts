import { levelSchema, questionSchema, worldSchema } from './schema';
import type { Level, Question, World, WorldId } from './schema';

type Module = { default: unknown };
type Loader = () => Promise<Module>;

const manifestLoaders = import.meta.glob<Module>('./mundos/*/manifest.json');
const levelLoaders = import.meta.glob<Module>('./mundos/*/nivel-*.json');
const questionLoaders = import.meta.glob<Module>('./mundos/*/questoes/*.json');

const worldCache = new Map<string, World>();
const questionCache = new Map<string, Question>();
const levelCache = new Map<string, Level[]>();

function parse<T>(
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { message: string } } },
  raw: unknown,
  label: string
): T {
  const result = schema.safeParse(raw);
  if (!result.success) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

function loaderFor(map: Record<string, Loader>, key: string): Loader {
  const loader = map[key];
  if (!loader) throw new Error(`Ficheiro em falta: ${key}`);
  return loader;
}

export function loadAllWorldIds(): WorldId[] {
  return Object.keys(manifestLoaders)
    .map((key) => key.split('/')[2] ?? '')
    .filter((id): id is WorldId => id.length > 0)
    .sort();
}

export async function loadWorldManifest(worldId: WorldId): Promise<World> {
  const cached = worldCache.get(worldId);
  if (cached) return cached;
  const raw = await loaderFor(manifestLoaders, `./mundos/${worldId}/manifest.json`)();
  const world = parse(worldSchema, raw.default, `manifest ${worldId}`);
  worldCache.set(worldId, world);
  return world;
}

export async function loadWorlds(): Promise<World[]> {
  return Promise.all(loadAllWorldIds().map((id) => loadWorldManifest(id)));
}

export async function loadLevels(worldId: WorldId): Promise<Level[]> {
  const cached = levelCache.get(worldId);
  if (cached) return cached;
  const prefix = `./mundos/${worldId}/nivel-`;
  const keys = Object.keys(levelLoaders)
    .filter((key) => key.startsWith(prefix))
    .sort();
  const levels = await Promise.all(
    keys.map(async (key) => {
      const raw = await loaderFor(levelLoaders, key)();
      return parse(levelSchema, raw.default, `nível ${key}`);
    })
  );
  levelCache.set(worldId, levels);
  return levels;
}

export async function loadLevelQuestions(worldId: WorldId, levelId: string): Promise<Question[]> {
  const levels = await loadLevels(worldId);
  const level = levels.find((item) => item.id === levelId);
  if (!level) throw new Error(`Nível inexistente: ${levelId}`);
  return Promise.all(
    level.questionIds.map(async (id) => {
      const key = `./mundos/${worldId}/questoes/${id}.json`;
      const cached = questionCache.get(key);
      if (cached) return cached;
      const raw = await loaderFor(questionLoaders, key)();
      const question = parse(questionSchema, raw.default, `questão ${id}`);
      if (question.worldId !== worldId) throw new Error(`${id} diz pertencer a ${question.worldId}`);
      questionCache.set(key, question);
      return question;
    })
  );
}

export async function loadWorldQuestions(worldId: WorldId): Promise<Question[]> {
  const prefix = `./mundos/${worldId}/questoes/`;
  const ids = Object.keys(questionLoaders)
    .filter((key) => key.startsWith(prefix))
    .map((key) => (key.split('/').pop() ?? '').replace('.json', ''));
  return Promise.all(
    ids.map(async (id) => {
      const key = `./mundos/${worldId}/questoes/${id}.json`;
      const cached = questionCache.get(key);
      if (cached) return cached;
      const raw = await loaderFor(questionLoaders, key)();
      const question = parse(questionSchema, raw.default, `questão ${id}`);
      questionCache.set(key, question);
      return question;
    })
  );
}