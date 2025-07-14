import "@pixi/layout";
import "@pixi/layout/devtools";
import { initDevtools } from "@pixi/devtools";
import { Application, Assets, Texture } from "pixi.js";

import { GameModel } from "./models/GameModel";
import { ReelModel } from "./models/ReelModel";
import { GameView } from "./views/GameView";
import { SpinService } from "./services/SpinService";
import { ResultService } from "./services/ResultService";

export class Game {
  private app: Application;
  private gameModel: GameModel;
  private gameView!: GameView;
  private spinService!: SpinService;
  private resultService: ResultService;
  private running = false;

  private readonly SYMBOL_SIZE = 150;
  private slotTextures: Texture[] = [];

  constructor() {
    this.app = new Application();
    this.gameModel = new GameModel(5); // 5 reels
    this.resultService = new ResultService();
  }

  public async init(): Promise<void> {
    initDevtools(this.app);
    // Load textures from local assets
    await Assets.load([
      "assets/eggHead.png",
      "assets/flowerTop.png",
      "assets/helmlok.png",
      "assets/skully.png",
    ]);

    this.slotTextures = [
      Texture.from("assets/eggHead.png"),
      Texture.from("assets/flowerTop.png"),
      Texture.from("assets/helmlok.png"),
      Texture.from("assets/skully.png"),
    ];

    // Initialize the Pixi application
    await this.app.init({
      background: "#1099bb",
      resizeTo: window, // Type assertion to bypass type checking
    });
    document.body.appendChild(this.app.canvas as HTMLCanvasElement);

    // Enable automatic layout updates and debug overlay on the renderer’s layout system
    this.app.renderer.layout.autoUpdate = true;
    await this.app.renderer.layout.enableDebug(true);

    // Create reel models
    const reelModels: ReelModel[] = [];
    for (let i = 0; i < this.gameModel.reelCount; i++) {
      const reelModel = new ReelModel(this.slotTextures, 4, i); // 4 symbols per reel
      reelModels.push(reelModel);
    }
    this.gameModel.setReels(reelModels);

    // Create the game view
    this.gameView = new GameView(this.gameModel, this.app, this.SYMBOL_SIZE);

    // Create reel views
    this.gameView.createReelViews(this.SYMBOL_SIZE);

    // Create spin service
    this.spinService = new SpinService(this.gameModel.reels, this.gameView.reelViews);

    // Set up event listeners
    this.setupEventListeners();

    // Add ticker update
    this.app.ticker.add(() => {
      this.spinService.update();
    });
  }

  private setupEventListeners(): void {
    // Set up spin button click handler
    this.gameView.spinButton.on("pointerdown", this.startPlay.bind(this));
  }

  public async startPlay(): Promise<void> {
    if (this.running) return;

    this.running = true;

    // Get results from backend before starting spin
    try {
      const results = await this.resultService.getSpinResults();

      // Start spinning
      this.spinService.spin(() => {
        this.reelsComplete(results);
      });
    } catch (error) {
      console.error("Failed to fetch results:", error);
      this.running = false;
    }
  }

  private reelsComplete(results: any): void {
    this.running = false;

    // Apply the results from the backend
    this.resultService.applyResults(this.gameModel, results);

    // Here you would also handle win animations, etc.
    console.log("Reels complete!");
  }
}
