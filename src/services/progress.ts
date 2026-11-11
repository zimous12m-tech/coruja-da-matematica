import type { SaveData } from './save';

export type Stars = 0 | 1 | 2 | 3;

export function computeStars(errors: number): Stars {
  if (errors === 0) return 3;
  if (errors === 1) return 2;
  return 1;
}

export function featherReward(correct: number, stars: Stars): number {
  const bonus = stars === 3 ? 20 : stars === 2 ? 10 : 5;
  return correct * 5 + bonus;
}

type StarsMap = { stars: Record<string, number> };

export function levelStars(save: StarsMap, levelId: string): number {
  return save.stars[levelId] ?? 0;
}

export function totalStars(save: SaveData): number {
  return Object.values(save.stars).reduce((sum, value) => sum + value, 0);
}

export function isLevelUnlocked(
  save: StarsMap,
  levels: readonly { id: string }[],
  levelId: string
): boolean {
  const position = levels.findIndex((level) => level.id === levelId);
  if (position <= 0) return position === 0;
  const previous = levels[position - 1];
  return previous ? levelStars(save, previous.id) >= 1 : false;
}