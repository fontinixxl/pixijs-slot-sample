import {
  Application,
  Assets,
  Container,
  FillGradient,
  Graphics,
  Text,
  TextStyle,
  Texture,
  Color,
} from "pixi.js";
import { Reel } from "./Reel";
import { initDevtools } from "@pixi/devtools";
import gsap from "gsap"; // import GSAP

export class Game {
  private app: Application;
  private reels: Reel[] = [];
  private reelContainer: Container;
  private running = false;
  private readonly REEL_WIDTH = 160;
  private readonly SYMBOL_SIZE = 150;
  private slotTextures: Texture[] = [];

  // New properties for responsive layout
  private topContainer!: Graphics;
  private bottomContainer!: Graphics;
  private headerText!: Text;
  private playText!: Text;

  constructor() {
    this.app = new Application();
    this.reelContainer = new Container();
  }

  public async init(): Promise<void> {
    // Initialize devtools.
    initDevtools(this.app);

    // Initialize the Pixi application.
    await this.app.init({ background: "#1099bb", resizeTo: window });
    document.body.appendChild(this.app.canvas as HTMLCanvasElement);

    // Load textures.
    await Assets.load([
      "https://pixijs.com/assets/eggHead.png",
      "https://pixijs.com/assets/flowerTop.png",
      "https://pixijs.com/assets/helmlok.png",
      "https://pixijs.com/assets/skully.png",
    ]);

    this.slotTextures = [
      Texture.from("https://pixijs.com/assets/eggHead.png"),
      Texture.from("https://pixijs.com/assets/flowerTop.png"),
      Texture.from("https://pixijs.com/assets/helmlok.png"),
      Texture.from("https://pixijs.com/assets/skully.png"),
    ];

    // Build the reels.
    for (let i = 0; i < 5; i++) {
      const reel = new Reel(this.slotTextures, this.SYMBOL_SIZE);
      reel.container.x = i * this.REEL_WIDTH; // positioning kept local to container
      this.reelContainer.addChild(reel.container);
      this.reels.push(reel);
    }
    this.app.stage.addChild(this.reelContainer);

    // Create cover containers.
    this.topContainer = new Graphics();
    this.bottomContainer = new Graphics();

    // Create gradient fill for text style.
    const fill = new FillGradient(0, 0, 0, 2);
    const colors = [0xffffff, 0x00ff99].map((c) => Color.shared.setValue(c).toNumber());
    colors.forEach((num, index) => {
      fill.addColorStop(index / colors.length, num);
    });

    // Create text style.
    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: { fill },
      stroke: { color: 0x4a1850, width: 5 },
      dropShadow: {
        color: 0x000000,
        angle: Math.PI / 6,
        blur: 4,
        distance: 6,
      },
      wordWrap: true,
      wordWrapWidth: 440,
    });

    // Create header text.
    this.headerText = new Text("PIXI MONSTER SLOTS!", style);
    this.topContainer.addChild(this.headerText);

    // Create play text.
    this.playText = new Text("Spin the wheels!", style);
    this.bottomContainer.addChild(this.playText);

    // Add covers to stage.
    this.app.stage.addChild(this.topContainer);
    this.app.stage.addChild(this.bottomContainer);

    // Set interactivity on the bottom cover.
    this.bottomContainer.interactive = true;
    this.bottomContainer.cursor = "pointer";
    this.bottomContainer.on("pointerdown", this.startPlay.bind(this));

    // Initial layout
    this.adjustLayout();

    // Listen for window resize.
    window.addEventListener("resize", this.adjustLayout.bind(this));

    // Add ticker update.
    this.app.ticker.add(() => {
      this.reels.forEach((r) => {
        r.updateBlur();
        r.updateSymbols();
      });
    });
  }

  private adjustLayout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const numReels = 5;
    const reelsWidth = this.REEL_WIDTH * numReels;
    const reelsHeight = this.SYMBOL_SIZE * 3;
    const marginY = (height - reelsHeight) / 2;

    // Center the reel container.
    this.reelContainer.x = (width - reelsWidth) / 2;
    this.reelContainer.y = marginY;

    // Redraw the top cover.
    this.topContainer.clear();
    this.topContainer.beginFill(0x000000);
    this.topContainer.drawRect(0, 0, width, marginY);
    this.topContainer.endFill();

    // Redraw the bottom cover.
    this.bottomContainer.clear();
    this.bottomContainer.beginFill(0x000000);
    this.bottomContainer.drawRect(0, marginY + reelsHeight, width, marginY);
    this.bottomContainer.endFill();

    // Position header text in the top cover.
    this.headerText.x = (width - this.headerText.width) / 2;
    this.headerText.y = (marginY - this.headerText.height) / 2;

    // Position play text in the bottom cover.
    this.playText.x = (width - this.playText.width) / 2;
    this.playText.y = marginY + reelsHeight + (marginY - this.playText.height) / 2;
  }

  public startPlay(): void {
    if (this.running) return;

    this.running = true;
    this.reels.forEach((r, i) => {
      const extra = Math.floor(Math.random() * 3);
      const target = r.position + 10 + i * 5 + extra;
      const time = (2500 + i * 600 + 1 * 600) / 1000;

      gsap.to(r, {
        position: target,
        duration: time,
        ease: "back.out(0.5)",
        onComplete:
          i === this.reels.length - 1 ? this.reelsComplete.bind(this) : undefined,
      });
    });
  }

  private reelsComplete(): void {
    this.running = false;
  }
}
