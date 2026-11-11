import type { SaveData } from './save';

export interface AchievementStats {
  totalStars: number;
  levelsDone: number;
  perfectLevels: number;
  bossesWon: number;
  dailiesCompleted: number;
}

export interface Achievement {
  id: string;
  titulo: { 'pt-PT': string; en: string };
  descricao: { 'pt-PT': string; en: string };
  check: (save: SaveData, stats: AchievementStats) => boolean;
}

function mk(
  id: string,
  ptTitulo: string,
  enTitulo: string,
  ptDesc: string,
  enDesc: string,
  check: Achievement['check']
): Achievement {
  return {
    id,
    titulo: { 'pt-PT': ptTitulo, en: enTitulo },
    descricao: { 'pt-PT': ptDesc, en: enDesc },
    check
  };
}

function worldDone(save: SaveData, world: number): boolean {
  for (let n = 1; n <= 6; n += 1) {
    const id = `mundo-${world}-nivel-${n}`;
    if ((save.stars[id] ?? 0) < 1) return false;
  }
  return true;
}

function playedInAllWorlds(save: SaveData): boolean {
  for (const w of [1, 2, 3, 4, 5, 6]) {
    const prefix = `mundo-${w}-nivel-`;
    const hasStar = Object.entries(save.stars).some(
      ([id, s]) => id.startsWith(prefix) && s >= 1
    );
    if (!hasStar) return false;
  }
  return true;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  mk('a01', 'Primeiro passo', 'First step', 'Conclui 1 nivel', 'Complete 1 level', (_s, x) => x.levelsDone >= 1),
  mk('a02', 'Cinco niveis', 'Five levels', 'Conclui 5 niveis', 'Complete 5 levels', (_s, x) => x.levelsDone >= 5),
  mk('a03', 'Dez niveis', 'Ten levels', 'Conclui 10 niveis', 'Complete 10 levels', (_s, x) => x.levelsDone >= 10),
  mk('a04', 'Vinte niveis', 'Twenty levels', 'Conclui 20 niveis', 'Complete 20 levels', (_s, x) => x.levelsDone >= 20),
  mk('a05', 'Trinta niveis', 'Thirty levels', 'Conclui 30 niveis', 'Complete 30 levels', (_s, x) => x.levelsDone >= 30),
  mk('a06', 'Perfeicao', 'Perfection', 'Conclui 1 nivel com 3 estrelas', 'Complete 1 level with 3 stars', (_s, x) => x.perfectLevels >= 1),
  mk('a07', 'Cinco perfeitos', 'Five perfect', 'Conclui 5 niveis com 3 estrelas', 'Complete 5 levels with 3 stars', (_s, x) => x.perfectLevels >= 5),
  mk('a08', 'Dez perfeitos', 'Ten perfect', 'Conclui 10 niveis com 3 estrelas', 'Complete 10 levels with 3 stars', (_s, x) => x.perfectLevels >= 10),
  mk('a09', 'Vinte perfeitos', 'Twenty perfect', 'Conclui 20 niveis com 3 estrelas', 'Complete 20 levels with 3 stars', (_s, x) => x.perfectLevels >= 20),
  mk('a10', 'Estrela maior', 'Big star', 'Junta 30 estrelas', 'Collect 30 stars', (_s, x) => x.totalStars >= 30),
  mk('a11', 'Constelacao', 'Constellation', 'Junta 60 estrelas', 'Collect 60 stars', (_s, x) => x.totalStars >= 60),
  mk('a12', 'Ceu inteiro', 'Whole sky', 'Junta 100 estrelas', 'Collect 100 stars', (_s, x) => x.totalStars >= 100),
  mk('a13', 'Coruja completa', 'Owl complete', 'Junta 150 estrelas', 'Collect 150 stars', (_s, x) => x.totalStars >= 150),
  mk('a14', 'Boss derrubado', 'Boss down', 'Vence 1 boss', 'Beat 1 boss', (_s, x) => x.bossesWon >= 1),
  mk('a15', 'Cacador de bosses', 'Boss hunter', 'Vence 3 bosses', 'Beat 3 bosses', (_s, x) => x.bossesWon >= 3),
  mk('a16', 'Lenda', 'Legend', 'Vence os 6 bosses', 'Beat all 6 bosses', (_s, x) => x.bossesWon >= 6),
  mk('a17', 'Vale completo', 'Valley cleared', 'Completa o Mundo 1', 'Complete World 1', (s) => worldDone(s, 1)),
  mk('a18', 'Cozinha limpa', 'Kitchen clean', 'Completa o Mundo 2', 'Complete World 2', (s) => worldDone(s, 2)),
  mk('a19', 'Oficina arrumada', 'Workshop tidy', 'Completa o Mundo 3', 'Complete World 3', (s) => worldDone(s, 3)),
  mk('a20', 'Mercado fechado', 'Market closed', 'Completa o Mundo 4', 'Complete World 4', (s) => worldDone(s, 4)),
  mk('a21', 'Observatorio lido', 'Observatory read', 'Completa o Mundo 5', 'Complete World 5', (s) => worldDone(s, 5)),
  mk('a22', 'Enigma resolvido', 'Enigma solved', 'Completa o Mundo 6', 'Complete World 6', (s) => worldDone(s, 6)),
  mk('a23', 'Tres dias', 'Three days', 'Sequencia de 3 dias', '3-day streak', (s) => s.streak >= 3),
  mk('a24', 'Semana cheia', 'Full week', 'Sequencia de 7 dias', '7-day streak', (s) => s.streak >= 7),
  mk('a25', 'Mes a serio', 'Serious month', 'Sequencia de 30 dias', '30-day streak', (s) => s.streak >= 30),
  mk('a26', 'Primeiro dia', 'First day', 'Completa 1 desafio diario', 'Complete 1 daily', (_s, x) => x.dailiesCompleted >= 1),
  mk('a27', 'Semana diaria', 'Weekly dailies', 'Completa 7 desafios diarios', 'Complete 7 dailies', (_s, x) => x.dailiesCompleted >= 7),
  mk('a28', 'Mes diario', 'Monthly dailies', 'Completa 30 desafios diarios', 'Complete 30 dailies', (_s, x) => x.dailiesCompleted >= 30),
  mk('a29', 'Penas a voar', 'Feathers flying', 'Junta 100 penas', 'Collect 100 feathers', (s) => s.coins >= 100),
  mk('a30', 'Saco cheio', 'Full bag', 'Junta 300 penas', 'Collect 300 feathers', (s) => s.coins >= 300),
  mk('a31', 'Tesouro', 'Treasure', 'Junta 600 penas', 'Collect 600 feathers', (s) => s.coins >= 600),
  mk('a32', 'Explorador', 'Explorer', 'Joga nos 6 mundos', 'Play in all 6 worlds', (s) => playedInAllWorlds(s))
];

export function computeStats(save: SaveData): AchievementStats {
  const values = Object.values(save.stars);
  return {
    totalStars: values.reduce((a, b) => a + b, 0),
    levelsDone: values.filter((v) => v >= 1).length,
    perfectLevels: values.filter((v) => v === 3).length,
    bossesWon: save.bossesWon.length,
    dailiesCompleted: save.dailiesCompleted
  };
}

export function checkNewAchievements(save: SaveData): string[] {
  const stats = computeStats(save);
  return ACHIEVEMENTS.filter(
    (a) => !save.achievements.includes(a.id) && a.check(save, stats)
  ).map((a) => a.id);
}

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
