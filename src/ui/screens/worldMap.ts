import type { World } from '../../content/schema';
import { t } from '../../services/i18n';
import type { SaveData } from '../../services/save';
import { icon, worldIcon } from '../components/icons';
import { owlSvg } from '../components/owl';

export interface WorldMapDeps {
  worlds: readonly World[];
  save: SaveData;
  dailyDone: boolean;
  onOpenWorld: (worldId: string) => void;
  onOpenProfile: () => void;
  onOpenDaily: () => void;
  onOpenSettings: () => void;
  onOpenParents: () => void;
  onOpenCredits: () => void;
}

export function renderWorldMap(root: HTMLElement, deps: WorldMapDeps): void {
  const cards = deps.worlds
    .map((world) => {
      const levelIds = [1, 2, 3, 4, 5, 6].map((n) => `${world.id}-nivel-${n}`);
      const earned = levelIds.reduce((sum, id) => sum + (deps.save.stars[id] ?? 0), 0);
      return `<li>
        <button class="world" type="button" data-world="${world.id}" style="--world:${world.cor};--world-soft:${world.corSuave}">
          <span class="world__icon">${worldIcon(world.icone, 36)}</span>
          <span class="world__body">
            <span class="world__name">${world.nome['pt-PT']}</span>
            <span class="world__desc">${world.descricao['pt-PT']}</span>
            <span class="world__meta">${t('world.stars', { done: earned, total: 18 })}</span>
          </span>
        </button>
      </li>`;
    })
    .join('');

  const dailyBanner = deps.dailyDone
    ? `<div class="daily-banner is-done">
         ${icon('check', 24)}
         <div class="daily-banner__text">
           <div class="daily-banner__title">${t('daily.alreadyDone')}</div>
         </div>
       </div>`
    : `<button class="daily-banner" type="button" data-daily>
         ${icon('sun', 24)}
         <div class="daily-banner__text">
           <div class="daily-banner__title">${t('daily.title')}</div>
           <div class="daily-banner__sub">${t('daily.intro')}</div>
         </div>
       </button>`;

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <button class="topbar__profile" type="button" data-profile aria-label="${t('profile.title')}">
          ${owlSvg(48)}
          <span class="chip">${icon('feather', 16)}${deps.save.coins}</span>
          ${deps.save.streak > 0 ? `<span class="chip chip--streak">${icon('flame', 16)}${deps.save.streak}</span>` : ''}
        </button>
        <div class="topbar__actions">
          <button class="btn btn--ghost btn--icon" type="button" data-settings aria-label="${t('settings.title')}">${icon('settings', 18)}</button>
          <button class="btn btn--ghost btn--icon" type="button" data-parents aria-label="${t('parents.title')}">${icon('family', 18)}</button>
          <button class="btn btn--ghost btn--icon" type="button" data-credits aria-label="${t('credits.title')}">${icon('info', 18)}</button>
        </div>
      </header>
      ${dailyBanner}
      <h1>${t('world.title')}</h1>
      <ul class="world-list">${cards}</ul>
    </main>`;

  root.querySelectorAll<HTMLButtonElement>('[data-world]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.world;
      if (id) deps.onOpenWorld(id);
    });
  });
  root.querySelector<HTMLButtonElement>('[data-profile]')?.addEventListener('click', deps.onOpenProfile);
  root.querySelector<HTMLButtonElement>('[data-daily]')?.addEventListener('click', deps.onOpenDaily);
  root.querySelector<HTMLButtonElement>('[data-settings]')?.addEventListener('click', deps.onOpenSettings);
  root.querySelector<HTMLButtonElement>('[data-parents]')?.addEventListener('click', deps.onOpenParents);
  root.querySelector<HTMLButtonElement>('[data-credits]')?.addEventListener('click', deps.onOpenCredits);
}
