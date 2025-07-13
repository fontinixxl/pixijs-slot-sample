import "@pixi/layout";
import { Application, Container, Text, TextStyle } from "pixi.js";
import { LayoutContainer } from "@pixi/layout/components";
import { FillGradient } from "pixi.js";
import { Color } from "pixi.js";
import { GameModel } from "../models/GameModel";
import { ReelView } from "./ReelView";

export class GameView {
  private app: Application;
  private mainContainer!: LayoutContainer;
  private topContainer!: LayoutContainer;
  private gameContainer!: LayoutContainer;
  private bottomContainer!: LayoutContainer;

  headerText!: Text;
  spinButton!: Container;
  spinText!: Text;

  reelViews: ReelView[] = [];

  constructor(public model: GameModel, app: Application, public symbolSize: number) {
    this.app = app;

    // Create main layout containers
    this.createMainContainer();
    this.topContainer = this.createTopContainer();
    this.gameContainer = this.createGameContainer();
    this.bottomContainer = this.createBottomContainer();

    // Add containers to main container
    this.mainContainer.addChild(this.topContainer);
    this.mainContainer.addChild(this.gameContainer);
    this.mainContainer.addChild(this.bottomContainer);

    // Add main container to stage
    this.app.stage.addChild(this.mainContainer);

    // Setup resize handler
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private createMainContainer(): void {
    this.mainContainer = new LayoutContainer({
      layout: {
        width: this.app.screen.width,
        height: this.app.screen.height,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 0,
        padding: 0,
      },
    });
  }

  private createTopContainer(): LayoutContainer {
    // Create container
    const container = new LayoutContainer({
      layout: {
        width: "100%",
        height: "15%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 0x000000,
        padding: 0,
      },
    });

    // Create gradient fill for text
    const fill = new FillGradient(0, 0, 0, 2);
    const colors = [0xffffff, 0x00ff99].map((c) => Color.shared.setValue(c).toNumber());
    colors.forEach((num, index) => {
      fill.addColorStop(index / colors.length, num);
    });

    // Create text style
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

  private createGameContainer(): LayoutContainer {
    // Create game container
    const container = new LayoutContainer({
      layout: {
        width: "100%",
        height: "70%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        overflow: "hidden",
      },
    });

    return container;
  }

  private createBottomContainer(): LayoutContainer {
    // Create container
    const container = new LayoutContainer({
      layout: {
        width: "100%",
        height: "15%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 0x000000,
        padding: 0,
      },
    });

    // Create spin button text using same style as header
    this.spinText = new Text("Spin the wheels!", this.headerText.style);
    this.spinText.layout = true;
    container.addChild(this.spinText);

    // Set interactivity
    container.interactive = true;
    container.cursor = "pointer";

    // Store reference to spin button
    this.spinButton = container;

    return container;
  }

  /**
   * Creates the reel views based on the reel models
   */
  createReelViews(symbolSize: number): void {
    this.model.reels.forEach((reelModel) => {
      const reelView = new ReelView(reelModel, symbolSize);
      this.reelViews.push(reelView);
      this.gameContainer.addChild(reelView.container);
    });
  }

  handleResize(): void {
    // Update main container dimensions
    if (this.mainContainer.layout) {
      this.mainContainer.layout = {
        ...this.mainContainer.layout,
        width: this.app.screen.width,
        height: this.app.screen.height,
      };
    }
  }

  update(): void {
    // Update all reel views
    this.reelViews.forEach((reelView) => {
      reelView.update();
    });
  }
}
