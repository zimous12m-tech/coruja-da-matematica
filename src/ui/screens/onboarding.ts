import { t } from '../../services/i18n';
import { owlSvg } from '../components/owl';
import { qs } from '../dom';

export function renderOnboarding(root: HTMLElement, onFinish: () => void): void {
  let step = 0;

  const draw = (): void => {
    const dots = [0, 1, 2]
      .map((i) => `<span class="onboarding__dot ${i === step ? 'is-active' : ''}"></span>`)
      .join('');

    let content = '';
    if (step === 0) {
      content = `
        ${owlSvg(160)}
        <h1>${t('onboarding.welcome')}</h1>
        <p>${t('onboarding.welcomeText')}</p>
      `;
    } else if (step === 1) {
      content = `
        <div style="font-size:64px;line-height:1;">6</div>
        <h1>${t('onboarding.howTo')}</h1>
        <p>${t('onboarding.howToText')}</p>
      `;
    } else {
      content = `
        ${owlSvg(160)}
        <h1>${t('onboarding.ready')}</h1>
        <p>${t('onboarding.readyText')}</p>
      `;
    }

    const isLast = step === 2;

    root.innerHTML = `
      <main class="onboarding">
        <button class="onboarding__skip" type="button" data-skip>${t('onboarding.skip')}</button>
        <div class="onboarding__card">
          <div class="onboarding__dots">${dots}</div>
          <div class="onboarding__content">${content}</div>
          <button class="btn btn--primary" type="button" data-next style="width:100%;margin-top:24px;">
            ${isLast ? t('onboarding.start') : t('onboarding.next')}
          </button>
        </div>
      </main>`;

    qs<HTMLButtonElement>(root, '[data-skip]').addEventListener('click', onFinish);
    qs<HTMLButtonElement>(root, '[data-next]').addEventListener('click', () => {
      if (step < 2) {
        step += 1;
        draw();
      } else {
        onFinish();
      }
    });
  };

  draw();
}
