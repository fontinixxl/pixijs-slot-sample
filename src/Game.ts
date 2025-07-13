import "@pixi/layout/devtools";
import {
  Application,
  Assets,
  Container,
  FillGradient,
  Text,
  TextStyle,
  Texture,
  Color,
} from "pixi.js";
import { Reel } from "./Reel";
import { initDevtools } from "@pixi/devtools";
import gsap from "gsap"; // import GSAP
import "@pixi/layout";
import { LayoutContainer } from "@pixi/layout/components";

export class Game {
  private app: Application;
  private reels: Reel[] = [];
  private running = false;
  private readonly REEL_WIDTH = 160;
  private readonly SYMBOL_SIZE = 150;
  private slotTextures: Texture[] = [];

  // Update container types
  private topContainer!: LayoutContainer;
  private reelContainer!: Container;
  private bottomContainer!: LayoutContainer;
  private headerText!: Text;
  private playText!: Text;

  constructor() {
    this.app = new Application();
  }

  public async init(): Promise<void> {
    // Initialize devtools.
    initDevtools(this.app);

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

    // Initialize the Pixi application.
    await this.app.init({ background: "#1099bb", resizeTo: window });
    document.body.appendChild(this.app.canvas as HTMLCanvasElement);

    // Create a new layout for the stage that will fill the entire screen
    // and center the content
    this.app.stage.layout = {
      width: this.app.screen.width,
      height: this.app.screen.height,
      justifyContent: "center",
      alignItems: "center",
    };

    // Create main container with vertical layout
    const mainContainer = new Container({
      layout: {
        width: this.app.screen.width,
        height: this.app.screen.height,
        flexDirection: "column",
        justifyContent: "space-between", // Distributes space between sections
        alignItems: "center", // Center horizontally
        gap: 0, // No gap between sections
      },
    });
    this.app.stage.addChild(mainContainer);

    // Create the three main sections
    this.topContainer = this.createTopContainer();
    this.reelContainer = this.createGameContainer();
    this.bottomContainer = this.createBottomContainer();

    // Add all sections to the main container
    mainContainer.addChild(this.topContainer);
    mainContainer.addChild(this.reelContainer);
    mainContainer.addChild(this.bottomContainer);

    // Setup resize handler to maintain responsive layout
    window.addEventListener("resize", () => {
      mainContainer.layout = {
        width: this.app.screen.width,
        height: this.app.screen.height,
      };
    });

    // Add ticker update.
    this.app.ticker.add(() => {
      this.reels.forEach((r) => {
        r.updateBlur();
        r.updateSymbols();
      });
    });
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

  private createTopContainer(): LayoutContainer {
    // Create container instead of Graphics
    const container = new LayoutContainer({
      layout: {
        width: "100%", // Full width
        height: "20%", // Fixed height or use percentage like "15%"
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 0x000000f, // Black background
        padding: 0, // Add some padding for better spacing
      },
    });

    // Create gradient fill for text style (keep your existing code)
    const fill = new FillGradient(0, 0, 0, 2);
    const colors = [0xffffff, 0x00ff99].map((c) => Color.shared.setValue(c).toNumber());
    colors.forEach((num, index) => {
      fill.addColorStop(index / colors.length, num);
    });

    // Create text style (keep your existing code)
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
      wordWrap: false,
    });

    // Create header text
    this.headerText = new Text("PIXI MONSTER SLOTS!", style);
    this.headerText.layout = true;
    container.addChild(this.headerText);

    return container;
  }

  private createGameContainer(): Container {
    // Create game container
    const container = new Container({
      layout: {
        width: "100%",
        height: "60%", // Fixed height or use percentage like "70%"
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5, // Small gap between reels for better visibility
      },
    });

    // Build the reels
    for (let i = 0; i < 5; i++) {
      const reel = new Reel(this.slotTextures, this.SYMBOL_SIZE);
      container.addChild(reel.container);
      this.reels.push(reel);
    }

    return container;
  }

  private createBottomContainer(): LayoutContainer {
    // Create container instead of Graphics
    const container = new LayoutContainer({
      layout: {
        width: "100%", // Full width
        height: "20%", // Fixed height or use percentage like "15%"
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 0x000000, // Black background
      },
    });

    // Create play text (using same style as header)
    this.playText = new Text("Spin the wheels!", this.headerText.style);
    this.playText.layout = true;
    container.addChild(this.playText);

    // Set interactivity
    container.interactive = true;
    container.cursor = "pointer";
    container.on("pointerdown", this.startPlay.bind(this));

    return container;
  }
}
