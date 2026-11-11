import type { Question } from '../../content/schema';
import { t } from '../../services/i18n';
import { play } from '../../services/audio';
import { load } from '../../services/save';
import { icon } from '../components/icons';
import { renderVisual } from '../components/visual';
import { qs } from '../dom';
import { createGame, type GameHandle } from '../../game/game';

export interface GameResult {
  correct: number;
  total: number;
  errors: number;
}

export interface GameDeps {
  questions: readonly Question[];
  levelId: string;
  boss: boolean;
  onExit: () => void;
  onFinish: (result: GameResult) => void;
}

export function renderGame(root: HTMLElement, deps: GameDeps): void {
  const total = deps.questions.length;
  let index = 0;
  let correct = 0;
  let errors = 0;
  let answered = false;
  let gameHandle: GameHandle | null = null;
  let destroyed = false;

  const buttonsOnly = load().settings.buttonsOnly;
  const arenaEnabled = !buttonsOnly;

  root.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <button class="btn" type="button" data-exit aria-label="${t('game.exit')}">${icon('exit', 18)}</button>
        <span class="hud__progress" data-progress></span>
        ${deps.boss ? `<span class="chip chip--boss">${icon('crown', 16)}BOSS</span>` : ''}
      </header>
      <div class="card"><p class="question" data-question></p></div>
      <div data-visual></div>
      ${arenaEnabled ? '<div class="arena" data-arena></div>' : ''}
      ${arenaEnabled ? `
        <div class="arena-controls" aria-label="${t('game.arenaControls', { defaultValue: 'Controlos da coruja' })}">
          <button class="btn btn--ghost" type="button" data-arrow="left" aria-label="${t('game.left', { defaultValue: 'Esquerda' })}">${icon('left', 20)}</button>
          <button class="btn btn--ghost" type="button" data-arrow="jump" aria-label="${t('game.jump', { defaultValue: 'Saltar' })}">${icon('up', 20)}</button>
          <button class="btn btn--ghost" type="button" data-arrow="right" aria-label="${t('game.right', { defaultValue: 'Direita' })}">${icon('right', 20)}</button>
        </div>
      ` : ''}
      <div class="options" data-options></div>
      <div class="feedback" data-feedback hidden>
        <p class="feedback__title" data-title></p>
        <span class="feedback__label">${t('game.explanation')}</span>
        <p data-explanation></p>
        <button class="btn btn--primary" type="button" data-next>${icon('next', 18)}<span data-next-label></span></button>
      </div>
    </main>`;

  const progressEl = qs<HTMLSpanElement>(root, '[data-progress]');
  const questionEl = qs<HTMLParagraphElement>(root, '[data-question]');
  const visualEl = qs<HTMLDivElement>(root, '[data-visual]');
  const optionsEl = qs<HTMLDivElement>(root, '[data-options]');
  const feedbackEl = qs<HTMLDivElement>(root, '[data-feedback]');
  const titleEl = qs<HTMLParagraphElement>(root, '[data-title]');
  const explanationEl = qs<HTMLParagraphElement>(root, '[data-explanation]');
  const nextBtn = qs<HTMLButtonElement>(root, '[data-next]');
  const nextLabel = qs<HTMLSpanElement>(root, '[data-next-label]');

  if (arenaEnabled) {
    const arenaEl = qs<HTMLDivElement>(root, '[data-arena]');
    try {
      gameHandle = createGame(arenaEl);
    } catch (error) {
      console.error('Erro ao criar arena Phaser:', error);
      arenaEl.innerHTML = '<div class="arena-error">Arena indisponivel. Usa os botoes.</div>';
      gameHandle = null;
    }
  }

  function cleanup(): void {
    if (destroyed) return;
    destroyed = true;
    gameHandle?.destroy();
    gameHandle = null;
  }

  function handlePick(choice: number): void {
    if (destroyed || answered) return;
    answered = true;
    const q = deps.questions[index];
    if (!q) return;
    const isRight = choice === q.resposta;
    if (isRight) {
      correct += 1;
      play('correct');
    } else {
      errors += 1;
      play('wrong');
    }

    optionsEl.querySelectorAll<HTMLButtonElement>('.option').forEach((btn, pos) => {
      btn.disabled = true;
      if (pos === q.resposta) btn.classList.add('is-correct');
      else if (pos === choice) btn.classList.add('is-wrong');
    });

    feedbackEl.hidden = false;
    feedbackEl.className = `feedback ${isRight ? 'is-correct' : 'is-wrong'}`;
    titleEl.textContent = isRight ? t('game.correct') : t('game.wrong');
    explanationEl.textContent = q.explicacao['pt-PT'];
    nextLabel.textContent = index === total - 1 ? t('game.finish') : t('game.next');
    nextBtn.focus();
  }

  function showQuestion(): void {
    const q = deps.questions[index];
    if (!q) return;
    answered = false;
    progressEl.textContent = t('game.progress', { current: index + 1, total });
    questionEl.textContent = q.pergunta['pt-PT'];
    visualEl.innerHTML = renderVisual(q.visual);
    optionsEl.innerHTML = '';
    feedbackEl.hidden = true;

    q.opcoes.forEach((label, pos) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.textContent = label;
      btn.addEventListener('click', () => handlePick(pos));
      optionsEl.appendChild(btn);
    });

    if (gameHandle) {
      gameHandle.showQuestion(q.opcoes, handlePick, deps.boss);
    }
  }

  if (gameHandle) {
    const hold = (selector: string, down: () => void, up: () => void): void => {
      const btn = qs<HTMLButtonElement>(root, selector);
      btn.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        down();
      });
      for (const type of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
        btn.addEventListener(type, up);
      }
    };
    hold(
      '[data-arrow="left"]',
      () => gameHandle?.setInput(-1),
      () => gameHandle?.setInput(0)
    );
    hold(
      '[data-arrow="right"]',
      () => gameHandle?.setInput(1),
      () => gameHandle?.setInput(0)
    );
    qs<HTMLButtonElement>(root, '[data-arrow="jump"]').addEventListener('pointerdown', (event) => {
      event.preventDefault();
      gameHandle?.jump();
    });
  }

  nextBtn.addEventListener('click', () => {
    if (!answered) return;
    if (index === total - 1) {
      cleanup();
      deps.onFinish({ correct, total, errors });
      return;
    }
    index += 1;
    showQuestion();
  });

  qs<HTMLButtonElement>(root, '[data-exit]').addEventListener('click', () => {
    cleanup();
    deps.onExit();
  });

  showQuestion();
}
