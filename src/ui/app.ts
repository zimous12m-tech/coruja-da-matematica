import { loadLevels, loadLevelQuestions, loadWorlds } from '../content/worlds';
import type { Level, World, WorldId } from '../content/schema';
import {
  addCoins,
  load,
  markBossWon,
  markDailyDone,
  recordLevelResult,
  registerPlay,
  saveSettings,
  update
} from '../services/save';
import { computeStars, featherReward, type Stars } from '../services/progress';
import { ACHIEVEMENTS, checkNewAchievements } from '../services/achievements';
import { getDailyQuestions, isDailyDone } from '../services/daily';
import { configure, play, startMusic } from '../services/audio';
import { setLocale } from '../services/i18n';
import { renderWorldMap } from './screens/worldMap';
import { renderLevelSelect } from './screens/levelSelect';
import { renderGame } from './screens/game';
import { renderComplete } from './screens/complete';
import { renderProfile } from './screens/profile';
import { renderDailyResult } from './screens/dailyResult';
import { renderParentZone } from './screens/parentZone';
import { renderCredits } from './screens/credits';
import { openSettings } from './screens/settingsSheet';
import { showToast } from './components/toast';

function unlockAndToast(): void {
  const save = load();
  const newIds = checkNewAchievements(save);
  if (newIds.length === 0) return;
  update((d) => {
    d.achievements.push(...newIds);
  });
  for (const id of newIds) {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (a) showToast(a.titulo['pt-PT'], 'trophy');
  }
}

export async function startApp(root: HTMLElement): Promise<void> {
  const worlds = await loadWorlds();
  let gameHandle: { destroy: () => void } | null = null;

  async function showWorldMap(): Promise<void> {
    gameHandle?.destroy();
    gameHandle = null;
    const save = load();
    configure(save.settings.soundEnabled, save.settings.musicEnabled);
    renderWorldMap(root, {
      worlds,
      save,
      dailyDone: isDailyDone(),
      onOpenWorld: (worldId) => {
        play('click');
        const world = worlds.find((w) => w.id === worldId);
        if (world) void showLevelSelect(world);
      },
      onOpenProfile: () => {
        play('click');
        renderProfile(root, () => void showWorldMap());
      },
      onOpenDaily: () => {
        play('click');
        void startDaily();
      },
      onOpenSettings: () => {
        play('click');
        openSettings({
          current: load().settings,
          onChange: (change) => {
            saveSettings(change);
            const updated = load().settings;
            configure(updated.soundEnabled, updated.musicEnabled);
            if (change.locale) {
              void setLocale(change.locale).then(() => void showWorldMap());
            } else {
              void showWorldMap();
            }
          }
        });
      },
      onOpenParents: () => {
        play('click');
        renderParentZone(root, () => void showWorldMap());
      },
      onOpenCredits: () => {
        play('click');
        renderCredits(root, () => void showWorldMap());
      }
    });
  }

  async function showLevelSelect(world: World): Promise<void> {
    const levels = await loadLevels(world.id as WorldId);
    renderLevelSelect(root, {
      world,
      levels,
      save: load(),
      onOpenLevel: (level) => {
        play('click');
        void playLevel(world, levels, level);
      },
      onBack: () => void showWorldMap()
    });
  }

  async function playLevel(world: World, levels: Level[], level: Level): Promise<void> {
    const questions = await loadLevelQuestions(world.id as WorldId, level.id);
    renderGame(root, {
      questions,
      levelId: level.id,
      boss: level.boss,
      onExit: () => void showLevelSelect(world),
      onFinish: (result) => {
        const stars: Stars = computeStars(result.errors);
        recordLevelResult(level.id, stars);
        const coins = featherReward(result.correct, stars);
        addCoins(coins);
        if (level.boss && stars >= 1) markBossWon(level.id);
        registerPlay();
        unlockAndToast();
        play('star');

        const currentIndex = levels.findIndex((l) => l.id === level.id);
        const nextLevel = levels[currentIndex + 1];

        renderComplete(root, {
          correct: result.correct,
          total: result.total,
          stars,
          coins,
          hasNextLevel: Boolean(nextLevel),
          onRepeat: () => void playLevel(world, levels, level),
          onNextLevel: () => {
            if (nextLevel) void playLevel(world, levels, nextLevel);
          },
          onBackToMap: () => void showWorldMap()
        });
      }
    });
  }

  async function startDaily(): Promise<void> {
    const questions = await getDailyQuestions();
    if (questions.length === 0) {
      showToast('Sem perguntas disponiveis', 'info');
      return;
    }
    renderGame(root, {
      questions,
      levelId: 'daily',
      boss: false,
      onExit: () => void showWorldMap(),
      onFinish: (result) => {
        const perfect = result.correct === result.total;
        const coins = result.correct * 5 + (perfect ? 15 : 0);
        addCoins(coins);
        markDailyDone();
        registerPlay();
        unlockAndToast();
        play('star');
        renderDailyResult(root, {
          correct: result.correct,
          total: result.total,
          coins,
          onBack: () => void showWorldMap()
        });
      }
    });
  }

  await showWorldMap();
  const settings = load().settings;
  if (settings.musicEnabled) startMusic();
}
