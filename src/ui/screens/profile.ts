import { t } from '../../services/i18n';
import { ACHIEVEMENTS, computeStats } from '../../services/achievements';
import { load } from '../../services/save';
import { icon } from '../components/icons';
import { owlSvg } from '../components/owl';
import { qs } from '../dom';

export function renderProfile(root: HTMLElement, onBack: () => void): void {
  const save = load();
  const stats = computeStats(save);
  const unlocked = new Set(save.achievements);

  const statsRow = `
    <li>${icon('star', 22)} <strong>${stats.totalStars}</strong> ${t('profile.stars')}</li>
    <li>${icon('feather', 22)} <strong>${save.coins}</strong> ${t('profile.coins')}</li>
    <li>${icon('flame', 22)} <strong>${save.streak}</strong> ${t('profile.streak')}</li>
    <li>${icon('trophy', 22)} <strong>${unlocked.size}/${ACHIEVEMENTS.length}</strong></li>
  `;

  const grid = ACHIEVEMENTS.map((a) => {
    const isUnlocked = unlocked.has(a.id);
    return `
      <li class="achievement ${isUnlocked ? 'is-unlocked' : ''}">
        <span class="achievement__icon">${icon(isUnlocked ? 'trophy' : 'lock', 20)}</span>
        <span class="achievement__body">
          <span class="achievement__title">${a.titulo['pt-PT']}</span>
          <span class="achievement__desc">${a.descricao['pt-PT']}</span>
        </span>
      </li>`;
  }).join('');

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <button class="btn" type="button" data-back>${icon('left', 18)}</button>
        <h1>${t('profile.title')}</h1>
      </header>
      <div class="profile__avatar">${owlSvg(120)}</div>
      <ul class="profile__stats">${statsRow}</ul>
      <h2 class="profile__section">${t('profile.achievements')}</h2>
      <ul class="achievement-grid">${grid}</ul>
    </main>`;

  qs<HTMLButtonElement>(root, '[data-back]').addEventListener('click', onBack);
}
