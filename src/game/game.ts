import Phaser from 'phaser';
import { PlayScene } from './scenes/PlayScene';

export interface GameHandle {
  showQuestion(options: readonly string[], onPick: (index: number) => void, boss: boolean): void;
  setInput(dir: -1 | 0 | 1): void;
  jump(): void;
  destroy(): void;
}

interface ShowCall {
  options: readonly string[];
  onPick: (index: number) => void;
  boss: boolean;
}

export function createGame(parent: HTMLElement): GameHandle {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#dff6ff',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 720,
      height: 300
    },
    physics: {
      default: 'matter',
      matter: { gravity: { x: 0, y: 1.1 }, debug: false }
    },
    scene: [PlayScene]
  });

  let ready = false;
  let destroyed = false;
  const pending: ShowCall[] = [];

  game.events.once(Phaser.Core.Events.READY, () => {
    if (destroyed) return;
    ready = true;
    const scene = game.scene.getScene('Play') as PlayScene;
    for (const call of pending) {
      scene.showQuestion(call.options, call.onPick, call.boss);
    }
    pending.length = 0;
  });

  return {
    showQuestion(options, onPick, boss) {
      if (destroyed) return;
      if (ready) {
        const scene = game.scene.getScene('Play') as PlayScene;
        scene.showQuestion(options, onPick, boss);
      } else {
        pending.push({ options, onPick, boss });
      }
    },
    setInput(dir) {
      if (destroyed || !ready) return;
      const scene = game.scene.getScene('Play') as PlayScene;
      scene.setInput(dir);
    },
    jump() {
      if (destroyed || !ready) return;
      const scene = game.scene.getScene('Play') as PlayScene;
      scene.jump();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      game.destroy(true);
    }
  };
}
