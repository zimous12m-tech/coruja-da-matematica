import { t } from '../../services/i18n';
import { load } from '../../services/save';
import { icon } from '../components/icons';
import { qs } from '../dom';

export function renderParentZone(root: HTMLElement, onBack: () => void): void {
  const save = load();
  const a = 17;
  const b = 4;

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <button class="btn" type="button" data-back>${icon('left', 18)}</button>
      </header>
      <h1>${t('parents.title')}</h1>
      <div class="card">
        <p>${t('parents.gate', { a, b })}</p>
        <input class="gate-input" type="number" inputmode="numeric" data-gate />
        <p class="gate-error" data-error hidden>${t('parents.gateError')}</p>
        <button class="btn btn--primary" type="button" data-enter>${t('parents.enter')}</button>
      </div>
      <div data-report hidden></div>
    </main>`;

  const report = qs<HTMLDivElement>(root, '[data-report]');
  const input = qs<HTMLInputElement>(root, '[data-gate]');
  const error = qs<HTMLParagraphElement>(root, '[data-error]');

  qs<HTMLButtonElement>(root, '[data-back]').addEventListener('click', onBack);

  qs<HTMLButtonElement>(root, '[data-enter]').addEventListener('click', () => {
    if (Number(input.value) !== a * b) {
      error.hidden = false;
      return;
    }

    const entries = Object.entries(save.stars);
    const rows = entries
      .map(([id, stars]) => `<tr><td>${id}</td><td>${stars}</td></tr>`)
      .join('');

    const total = Object.values(save.stars).reduce((sum, value) => sum + value, 0);

    report.hidden = false;
    report.innerHTML = `
      <h2>${t('parents.report')}</h2>
      <p class="chip">${t('parents.coins', { count: save.coins })}</p>
      <p class="chip">${t('parents.totalStars', { count: total })}</p>
      <table class="report-table">
        <thead><tr><th>${t('parents.level')}</th><th>${t('parents.stars')}</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="2">${t('parents.empty')}</td></tr>`}</tbody>
      </table>
    `;
  });
}
