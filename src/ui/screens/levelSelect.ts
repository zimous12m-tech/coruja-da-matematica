import type { Level, World } from '../../content/schema';
import { t } from '../../services/i18n';
import { isLevelUnlocked } from '../../services/progress';
import { icon } from '../components/icons';
import { qs } from '../dom';

export interface LevelSelectDeps {
  world: World;
  levels: readonly Level[];
  save: { coins: number; stars: Record<string, number> };
  onOpenLevel: (level: Level) => void;
  onBack: () => void;
}

export function renderLevelSelect(root: HTMLElement, deps: LevelSelectDeps): void {
  const cells = deps.levels
    .map((level) => {
      const stars = deps.save.stars[level.id] ?? 0;
      const unlocked = isLevelUnlocked(deps.save, deps.levels, level.id);
      const starMarkup = [0, 1, 2]
        .map((i) => `<span class="${i < stars ? 'is-on' : 'is-off'}">${icon('star', 14)}</span>`)
        .join('');
      return `<li>
        <button class="level ${unlocked ? '' : 'is-locked'} ${level.boss ? 'is-boss' : ''}" type="button" data-level="${level.id}" ${unlocked ? '' : 'disabled'}>
          <span class="level__num">${level.boss ? icon('crown', 22) : level.id.slice(-1)}</span>
          <span class="level__stars">${starMarkup}</span>
          ${!unlocked ? `<span class="level__lock">${icon('lock', 16)}</span>` : ''}
        </button>
      </li>`;
    })
    .join('');

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <button class="btn" type="button" data-back>${icon('left', 18)}</button>
        <span class="chip">${t('menu.coins', { count: deps.save.coins })}</span>
      </header>
      <h1 style="color:${deps.world.cor}">${deps.world.nome['pt-PT']}</h1>
      <p class="menu__subtitle">${deps.world.descricao['pt-PT']}</p>
      <ul class="level-grid">${cells}</ul>
    </main>`;

  qs<HTMLButtonElement>(root, '[data-back]').addEventListener('click', deps.onBack);
  root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.level;
      const level = deps.levels.find((l) => l.id === id);
      if (level) deps.onOpenLevel(level);
    });
  });
}
