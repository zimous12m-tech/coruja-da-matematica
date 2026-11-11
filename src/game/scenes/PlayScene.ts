import Phaser from 'phaser';

const VIEW_W = 720;
const VIEW_H = 300;
const ORB_X: readonly number[] = [104, 284, 460, 636];
const ORB_Y: readonly number[] = [196, 156, 188, 148];
const ORB_COLORS: readonly number[] = [0xff7675, 0x74b9ff, 0x55efc4, 0xffeaa7];
const ORB_RADIUS = 26;
const START = { x: 360, y: 240 };

interface HeldKeys {
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  jump: Phaser.Input.Keyboard.Key[];
}

interface PendingShow {
  options: readonly string[];
  onPick: (index: number) => void;
  boss: boolean;
}

export class PlayScene extends Phaser.Scene {
  private built = false;
  private locked = true;
  private owl?: Phaser.Physics.Matter.Sprite;
  private orbs: MatterJS.BodyType[] = [];
  private orbObjects: Phaser.GameObjects.GameObject[] = [];
  private heldKeys: HeldKeys = { left: [], right: [], jump: [] };
  private manualInput: -1 | 0 | 1 = 0;
  private manualJump = false;
  private onPick: ((index: number) => void) | null = null;
  private pending: PendingShow | null = null;

  constructor() {
    super('Play');
  }

  create(): void {
    this.buildWorld();
    this.built = true;
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      this.showQuestion(p.options, p.onPick, p.boss);
    }
  }

  showQuestion(options: readonly string[], onPick: (index: number) => void, boss: boolean): void {
    if (!this.built) {
      this.pending = { options, onPick, boss };
      return;
    }
    this.locked = true;
    this.onPick = onPick;
    this.manualInput = 0;
    this.manualJump = false;
    this.cameras.main.setBackgroundColor(boss ? '#2b1b3d' : '#dff6ff');

    this.clearOrbs();

    if (this.owl) {
      this.owl.setPosition(START.x, START.y);
      this.owl.setVelocity(0, 0);
    }

    options.forEach((text, i) => {
      const x = ORB_X[i] ?? 104;
      const y = ORB_Y[i] ?? 196;
      const color = ORB_COLORS[i] ?? 0xffeaa7;

      this.orbs.push(
        this.matter.add.circle(x, y, ORB_RADIUS, {
          isStatic: true,
          isSensor: true,
          label: `orb-${i}`
        })
      );

      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.lineStyle(3, 0x241c2e, 1);
      g.fillCircle(x, y, ORB_RADIUS);
      g.strokeCircle(x, y, ORB_RADIUS);

      const label = this.add.text(x, y, text, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#241c2e',
        align: 'center'
      }).setOrigin(0.5);

      if (label.width > ORB_RADIUS * 1.8) {
        label.setFontSize(11);
      }

      this.orbObjects.push(g, label);
    });

    this.locked = false;
  }

  setInput(dir: -1 | 0 | 1): void {
    this.manualInput = dir;
  }

  jump(): void {
    this.manualJump = true;
  }

  update(): void {
    const owl = this.owl;
    if (!owl || this.locked) return;

    const left = this.heldKeys.left.some((k) => k.isDown) || this.manualInput === -1;
    const right = this.heldKeys.right.some((k) => k.isDown) || this.manualInput === 1;
    const jumpPressed = this.heldKeys.jump.some((k) => k.isDown) || this.manualJump;

    const force = 0.0035;
    if (left && !right) owl.applyForce(new Phaser.Math.Vector2(-force, 0));
    else if (right && !left) owl.applyForce(new Phaser.Math.Vector2(force, 0));

    const body = owl.body;
    if (!body) return;

    const vx = body.velocity.x;
    if (Math.abs(vx) > 6) {
      owl.setVelocityX(Math.sign(vx) * 6);
    }

    const onGround = Math.abs(body.velocity.y) < 0.6;
    if (jumpPressed && onGround) {
      owl.setVelocityY(-9);
    }

    this.manualJump = false;
  }

  private buildWorld(): void {
    this.makeOwlTexture();
    this.matter.world.setBounds(0, 0, VIEW_W, VIEW_H);

    const ground = this.add.graphics();
    ground.fillStyle(0x77c66e, 1);
    ground.fillRect(0, VIEW_H - 14, VIEW_W, 14);

    const platforms = [
      { x: 104, y: 238 },
      { x: 284, y: 198 },
      { x: 460, y: 230 },
      { x: 636, y: 190 }
    ];
    const layer = this.add.graphics();
    layer.fillStyle(0x9be08d, 1);
    layer.lineStyle(3, 0x241c2e, 1);
    for (const p of platforms) {
      layer.fillRoundedRect(p.x - 58, p.y, 116, 14, 7);
      layer.strokeRoundedRect(p.x - 58, p.y, 116, 14, 7);
      this.matter.add.rectangle(p.x, p.y + 7, 116, 14, {
        isStatic: true,
        label: 'plataforma'
      });
    }

    this.owl = this.matter.add.sprite(START.x, START.y, 'owl');
    this.owl.setFrictionAir(0.03);
    this.owl.setBounce(0.05);
    this.owl.setFixedRotation();

    this.matter.world.on(
      'collisionstart',
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        if (this.locked || !this.onPick) return;
        for (const pair of event.pairs) {
          for (const body of [pair.bodyA, pair.bodyB]) {
            if (!body.label.startsWith('orb-')) continue;
            const idx = Number(body.label.slice(4));
            this.locked = true;
            const handler = this.onPick;
            if (this.owl) this.owl.setVelocityY(-6);
            handler(idx);
            return;
          }
        }
      }
    );

    const kb = this.input.keyboard;
    if (kb) {
      this.heldKeys = {
        left: [
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        ],
        right: [
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        ],
        jump: [
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        ]
      };
    }
  }

  private makeOwlTexture(): void {
    if (this.textures.exists('owl')) return;
    const g = this.add.graphics();
    g.fillStyle(0x8e7cf0, 1);
    g.lineStyle(3, 0x241c2e, 1);
    g.fillEllipse(22, 28, 32, 38);
    g.strokeEllipse(22, 28, 32, 38);
    g.fillStyle(0x6c5ce7, 1);
    g.fillEllipse(8, 30, 12, 22);
    g.fillEllipse(36, 30, 12, 22);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(15, 20, 8);
    g.fillCircle(29, 20, 8);
    g.strokeCircle(15, 20, 8);
    g.strokeCircle(29, 20, 8);
    g.fillStyle(0x241c2e, 1);
    g.fillCircle(15, 20, 3.4);
    g.fillCircle(29, 20, 3.4);
    g.fillStyle(0xfdcb6e, 1);
    g.fillTriangle(22, 27, 18, 33, 26, 33);
    g.strokeTriangle(22, 27, 18, 33, 26, 33);
    g.generateTexture('owl', 44, 50);
    g.destroy();
  }

  private clearOrbs(): void {
    for (const body of this.orbs) this.matter.world.remove(body);
    for (const obj of this.orbObjects) obj.destroy();
    this.orbs = [];
    this.orbObjects = [];
  }
}
