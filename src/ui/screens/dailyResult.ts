import { t } from '../../services/i18n';
import { icon } from '../components/icons';
import { owlSvg } from '../components/owl';
import { qs } from '../dom';

export interface DailyResultDeps {
  correct: number;
  total: number;
  coins: number;
  onBack: () => void;
}

export function renderDailyResult(root: HTMLElement, deps: DailyResultDeps): void {
  const perfect = deps.correct === deps.total;

  root.innerHTML = `
    <main class="screen complete">
      ${owlSvg(110)}
      <h1>${perfect ? t('daily.perfect') : t('daily.title')}</h1>
      <p>${t('complete.score', { correct: deps.correct, total: deps.total })}</p>
      <p class="chip">${icon('feather', 16)}${t('complete.coins', { count: deps.coins })}</p>
      <p class="menu__subtitle">${t('daily.comeBack')}</p>
      <div class="complete__actions">
        <button class="btn btn--primary" type="button" data-back>${t('complete.backToMap')}</button>
      </div>
    </main>`;

  qs<HTMLButtonElement>(root, '[data-back]').addEventListener('click', deps.onBack);
}
