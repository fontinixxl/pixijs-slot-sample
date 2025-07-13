import "@pixi/layout";
import { BlurFilter } from "pixi.js";
import { LayoutContainer } from "@pixi/layout/components";
import { ReelModel } from "../models/ReelModel";
import { SymbolView } from "./SymbolView";

export class ReelView {
  container: LayoutContainer;
  symbolViews: SymbolView[] = [];
  blur: BlurFilter;

  constructor(public model: ReelModel, public symbolSize: number) {
    // Use layout for the reel container itself
    this.container = new LayoutContainer({
      layout: {
        width: this.symbolSize,
        height: this.symbolSize * 3,
        alignItems: "center",
        overflow: "hidden",
      },
    });

    this.blur = new BlurFilter();
    this.blur.blurX = 0;
    this.blur.blurY = 0;
    this.container.filters = [this.blur];

    this.createSymbolViews();
  }

  private createSymbolViews(): void {
    // Create views for each symbol model
    this.model.symbols.forEach((symbolModel, index) => {
      const view = new SymbolView(symbolModel, this.symbolSize);
      this.symbolViews.push(view);
      this.container.addChild(view.sprite);

      // Position symbol initially
      this.positionSymbol(view, index);
    });
  }

  private positionSymbol(view: SymbolView, index: number): void {
    const symbolSize = this.symbolSize * 0.9; // 90% of the full size
    const offset = (this.symbolSize - symbolSize) / 2;

    // Position symbols properly:
    // index=0: y=0 (first visible position)
    // index=1: y=SYMBOL_SIZE (second visible position)
    // index=2: y=2*SYMBOL_SIZE (third visible position)
    // index=3: y=-SYMBOL_SIZE (ABOVE visible area, not below)
    if (index === 3) {
      view.sprite.y = -this.symbolSize + offset;
    } else {
      view.sprite.y = index * this.symbolSize + offset;
    }
  }

  updateSymbolPositions(): void {
    // Update each symbol's position based on model
    this.symbolViews.forEach((view, j) => {
      const prevY = view.sprite.y;

      // Calculate position with cycling
      const symbolSize = this.symbolSize * 0.9;
      const offset = (this.symbolSize - symbolSize) / 2;

      // Calculate which position in the cycle this symbol should be
      const cyclePosition = (Math.floor(this.model.position) + j) % 4;

      // Map cycle position to Y coordinate
      let newY;
      if (cyclePosition === 3) {
        // This is the symbol that should be above the visible area
        newY = -this.symbolSize + offset;
      } else {
        // Normal visible symbols
        newY = cyclePosition * this.symbolSize + offset;
      }

      // Add fractional part for smooth animation
      newY += (this.model.position - Math.floor(this.model.position)) * this.symbolSize;

      view.sprite.y = newY;

      // When a symbol moves from visible to hidden (bottom to top),
      // update its view with the new texture from the model
      if (prevY > 2 * this.symbolSize && newY < 0) {
        view.updateTexture();
      }
    });
  }

  updateBlur(): void {
    // Update blur based on movement speed
    const speed = this.model.position - this.model.previousPosition;
    this.blur.blurY = Math.abs(speed) * 20;
  }

  update(): void {
    this.updateSymbolPositions();
    this.updateBlur();
  }
}
