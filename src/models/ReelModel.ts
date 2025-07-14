import { Texture } from "pixi.js";
import { SymbolModel } from "./SymbolModel";

export class ReelModel {
  reelId: number = 0;
  position: number = 0;
  previousPosition: number = 0;
  symbols: SymbolModel[] = [];

  constructor(
    public slotTextures: Texture[],
    public symbolCount: number = 4,
    reelId: number
  ) {
    this.initializeSymbols();
    this.reelId = reelId;
  }

  private initializeSymbols(): void {
    for (let i = 0; i < this.symbolCount; i++) {
      this.symbols.push(new SymbolModel(this.getRandomTexture()));
    }
  }

  getRandomTexture(): Texture {
    return this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
  }

  /**
   * Updates the model state based on the current position
   * Handles cycling of symbols and changing textures when needed
   */
  update(): void {
    // Check if we've moved to a new position
    if (Math.floor(this.position) > Math.floor(this.previousPosition)) {
      // When a symbol should move from bottom to top, give it a new texture
      const symbolToUpdate = this.symbols[(Math.floor(this.position) + 3) % 4];
      symbolToUpdate.texture = this.getRandomTexture();
    }

    this.previousPosition = this.position;
  }
}
