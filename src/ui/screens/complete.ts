import { t } from '../../services/i18n';
import { icon } from '../components/icons';
import { owlSvg } from '../components/owl';
import { qs } from '../dom';

export interface CompleteDeps {
  correct: number;
  total: number;
  stars: number;
  coins: number;
  hasNextLevel: boolean;
  onRepeat: () => void;
  onNextLevel: () => void;
  onBackToMap: () => void;
}

export function renderComplete(root: HTMLElement, deps: CompleteDeps): void {
  const starMarkup = [0, 1, 2]
    .map((i) => `<span class="${i < deps.stars ? 'is-on' : 'is-off'}">${icon('star', 44)}</span>`)
    .join('');

  root.innerHTML = `
    <main class="screen complete">
      ${owlSvg(110)}
      <h1>${t('complete.title')}</h1>
      <div class="complete__stars">${starMarkup}</div>
      <p class="chip">${t('complete.coins', { count: deps.coins })}</p>
      <p>${t('complete.score', { correct: deps.correct, total: deps.total })}</p>
      <div class="complete__actions">
        <button class="btn" type="button" data-repeat>${t('complete.repeat')}</button>
        ${deps.hasNextLevel ? `<button class="btn btn--primary" type="button" data-next>${t('complete.nextLevel')}</button>` : ''}
        <button class="btn" type="button" data-map>${t('complete.backToMap')}</button>
      </div>
    </main>`;

  qs<HTMLButtonElement>(root, '[data-repeat]').addEventListener('click', deps.onRepeat);
  qs<HTMLButtonElement>(root, '[data-map]').addEventListener('click', deps.onBackToMap);
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]');
  if (nextBtn) nextBtn.addEventListener('click', deps.onNextLevel);
}
