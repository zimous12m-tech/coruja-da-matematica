import { z } from 'zod';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n';

const STORAGE_KEY = 'coruja.save.v2';
const STORAGE_KEY_V1 = 'coruja.save.v1';

export const starsSchema = z.number().int().min(0).max(3);

const settingsShape = {
  locale: z.enum(SUPPORTED_LOCALES),
  soundEnabled: z.boolean(),
  musicEnabled: z.boolean(),
  timedMode: z.boolean(),
  buttonsOnly: z.boolean(),
  highContrast: z.boolean(),
  dyslexiaFont: z.boolean(),
  fontScale: z.number().int().min(0).max(2)
};

const saveSchemaV1 = z.object({
  version: z.literal(1),
  coins: z.number().int().min(0),
  stars: z.record(z.string(), starsSchema),
  settings: z.object(settingsShape)
});

export const saveSchema = z.object({
  version: z.literal(2),
  coins: z.number().int().min(0),
  stars: z.record(z.string(), starsSchema),
  settings: z.object(settingsShape),
  streak: z.number().int().min(0),
  lastPlayedDate: z.string(),
  achievements: z.array(z.string()),
  bossesWon: z.array(z.string()),
  dailyDate: z.string(),
  dailyDone: z.boolean(),
  dailiesCompleted: z.number().int().min(0),
  onboardingDone: z.boolean()
});

export type SaveData = z.infer<typeof saveSchema>;
export type SaveDataV1 = z.infer<typeof saveSchemaV1>;
export type Settings = SaveData['settings'];

export const DEFAULT_SAVE: SaveData = {
  version: 2,
  coins: 0,
  stars: {},
  settings: {
    locale: DEFAULT_LOCALE,
    soundEnabled: true,
    musicEnabled: true,
    timedMode: true,
    buttonsOnly: false,
    highContrast: false,
    dyslexiaFont: false,
    fontScale: 0
  },
  streak: 0,
  lastPlayedDate: '',
  achievements: [],
  bossesWon: [],
  dailyDate: '',
  dailyDone: false,
  dailiesCompleted: 0,
  onboardingDone: false
};

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function migrateV1(raw: unknown): SaveData | null {
  const parsed = saveSchemaV1.safeParse(raw);
  if (!parsed.success) return null;
  return {
    ...structuredClone(DEFAULT_SAVE),
    coins: parsed.data.coins,
    stars: parsed.data.stars,
    settings: parsed.data.settings
  };
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readRaw(key: string): unknown {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function load(): SaveData {
  const store = storage();
  if (!store) return structuredClone(DEFAULT_SAVE);

  const current = saveSchema.safeParse(readRaw(STORAGE_KEY));
  if (current.success) return current.data;

  const migrated = migrateV1(readRaw(STORAGE_KEY_V1));
  if (migrated) {
    write(migrated);
    store.removeItem(STORAGE_KEY_V1);
    return migrated;
  }

  return structuredClone(DEFAULT_SAVE);
}

export function write(data: SaveData): SaveData {
  const store = storage();
  if (store) store.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function update(change: (draft: SaveData) => void): SaveData {
  const draft = structuredClone(load());
  change(draft);
  return write(draft);
}

export function addCoins(amount: number): SaveData {
  return update((d) => {
    d.coins = Math.max(0, d.coins + amount);
  });
}

export function saveSettings(change: Partial<Settings>): SaveData {
  return update((d) => {
    d.settings = { ...d.settings, ...change };
  });
}

export function recordLevelResult(levelId: string, stars: number): SaveData {
  return update((d) => {
    const previous = d.stars[levelId] ?? 0;
    d.stars[levelId] = Math.max(previous, Math.min(3, Math.max(1, stars)));
  });
}

export function markBossWon(levelId: string): SaveData {
  return update((d) => {
    if (!d.bossesWon.includes(levelId)) d.bossesWon.push(levelId);
  });
}

export function markOnboardingDone(): SaveData {
  return update((d) => {
    d.onboardingDone = true;
  });
}

export function markDailyDone(): SaveData {
  return update((d) => {
    const today = todayKey();
    if (d.dailyDate === today) return;
    d.dailyDate = today;
    d.dailyDone = true;
    d.dailiesCompleted += 1;
  });
}

export function registerPlay(): SaveData {
  return update((d) => {
    const today = todayKey();
    if (d.lastPlayedDate === today) return;
    if (d.lastPlayedDate === yesterdayKey()) d.streak += 1;
    else d.streak = 1;
    d.lastPlayedDate = today;
  });
}

export function reset(): SaveData {
  const store = storage();
  if (store) store.removeItem(STORAGE_KEY);
  return structuredClone(DEFAULT_SAVE);
}
