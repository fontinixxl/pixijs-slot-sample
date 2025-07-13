import { Sprite } from "pixi.js";
import { SymbolModel } from "../models/SymbolModel";

export class SymbolView {
  sprite: Sprite;

  constructor(public model: SymbolModel, public symbolSize: number) {
    this.sprite = new Sprite(model.texture);
    this.updateScale();
    this.centerHorizontally();
  }

  updateTexture(): void {
    this.sprite.texture = this.model.texture;
    this.updateScale();
    this.centerHorizontally();
  }

  updateScale(): void {
    // Make symbols slightly smaller (90% of the full size)
    const symbolSize = this.symbolSize * 0.9;

    // Set width/height while maintaining aspect ratio
    const scale = Math.min(
      symbolSize / this.sprite.texture.width,
      symbolSize / this.sprite.texture.height
    );
    this.sprite.scale.set(scale);
  }

  centerHorizontally(): void {
    this.sprite.x = (this.symbolSize - this.sprite.width) / 2;
  }
}
