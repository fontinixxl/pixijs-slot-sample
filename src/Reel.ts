import "@pixi/layout";
import { LayoutContainer } from "@pixi/layout/components";
import { Sprite, BlurFilter, Texture } from "pixi.js";

export class Reel {
  container: LayoutContainer;
  symbols: Sprite[];
  position: number = 0;
  previousPosition: number = 0;
  blur: BlurFilter;

  constructor(public slotTextures: Texture[], public SYMBOL_SIZE: number) {
    // Use layout for the reel container itself - this allows proper positioning
    // within the parent container in Game.ts
    this.container = new LayoutContainer({
      layout: {
        width: this.SYMBOL_SIZE, // Fixed width for the reel
        height: this.SYMBOL_SIZE * 3, // Height to show 3 symbols
        alignItems: "center", // Center symbols horizontally
        overflow: "hidden", // Mask the reel area to prevent overflow
      },
    });

    this.symbols = [];
    this.blur = new BlurFilter();
    this.blur.blurX = 0;
    this.blur.blurY = 0;
    this.container.filters = [this.blur];
    this.buildSymbols();
  }

  /**
   * Initializes the reel's symbols.
   *
   * Creates 4 symbols with random textures, scales them to fit `SYMBOL_SIZE`,
   * positions them vertically, centers them horizontally, and adds them to
   * the reel's container and tracking array.
   */
  private buildSymbols() {
    // Make symbols slightly smaller
    const symbolSize = this.SYMBOL_SIZE * 0.9; // 90% of the full size
    // Create 4 symbols (one extra for smooth scrolling)
    for (let j = 0; j < 4; j++) {
      const randomTexture = this.randomTexture();
      const symbol = new Sprite(randomTexture);

      // Set width/height while maintaining aspect ratio
      const scale = Math.min(
        symbolSize / randomTexture.width,
        symbolSize / randomTexture.height
      );
      symbol.scale.set(scale);

      // Center horizontally
      symbol.x = (this.SYMBOL_SIZE - symbol.width) / 2;

      // Position symbols properly:
      // j=0: y=0 (first visible position)
      // j=1: y=SYMBOL_SIZE (second visible position)
      // j=2: y=2*SYMBOL_SIZE (third visible position)
      // j=3: y=-SYMBOL_SIZE (ABOVE visible area, not below)
      if (j === 3) {
        symbol.y = -this.SYMBOL_SIZE + (this.SYMBOL_SIZE - symbolSize) / 2;
      } else {
        symbol.y = j * this.SYMBOL_SIZE + (this.SYMBOL_SIZE - symbolSize) / 2;
      }

      this.symbols.push(symbol);
      this.container.addChild(symbol);
    }
  }

  updateSymbols() {
    // Update each symbol's position and swap texture if needed
    this.symbols.forEach((symbol, j) => {
      const prevY = symbol.y;

      // Calculate position with cycling
      const symbolSize = this.SYMBOL_SIZE * 0.9; // Match the same size as in buildSymbols
      const offset = (this.SYMBOL_SIZE - symbolSize) / 2;

      // Calculate which position in the cycle this symbol should be
      const cyclePosition = (Math.floor(this.position) + j) % 4;

      // Map cycle position to Y coordinate
      let newY;
      if (cyclePosition === 3) {
        // This is the symbol that should be above the visible area
        newY = -this.SYMBOL_SIZE + offset;
      } else {
        // Normal visible symbols
        newY = cyclePosition * this.SYMBOL_SIZE + offset;
      }

      // Add fractional part for smooth animation
      newY += (this.position - Math.floor(this.position)) * this.SYMBOL_SIZE;

      symbol.y = newY;

      // When a symbol moves from visible to hidden (bottom to top),
      // give it a new texture
      if (prevY > 2 * this.SYMBOL_SIZE && newY < 0) {
        symbol.texture = this.randomTexture();

        // Recalculate scale for new texture
        const scale = Math.min(
          symbolSize / symbol.texture.width,
          symbolSize / symbol.texture.height
        );
        symbol.scale.set(scale);

        // Recenter horizontally
        symbol.x = (this.SYMBOL_SIZE - symbol.width) / 2;
      }
    });

    // Update blur effect
    this.updateBlur();
  }

  updateBlur() {
    // Update blur based on movement speed
    const speed = this.position - this.previousPosition;
    this.blur.blurY = Math.abs(speed) * 20;
    this.previousPosition = this.position;
  }

  private randomTexture() {
    return this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
  }
}
