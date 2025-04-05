import { Container, Sprite, BlurFilter, Texture } from "pixi.js";

export class Reel {
  container: Container;
  symbols: Sprite[];
  position: number = 0;
  previousPosition: number = 0;
  blur: BlurFilter;

  constructor(public slotTextures: Texture[], public SYMBOL_SIZE: number) {
    this.container = new Container();
    this.symbols = [];
    this.blur = new BlurFilter();
    this.blur.blurX = 0;
    this.blur.blurY = 0;
    this.container.filters = [this.blur];
    this.buildSymbols();
  }

  private buildSymbols() {
    // For a fixed number of symbols (we use 4 as in your original code)
    for (let j = 0; j < 4; j++) {
      const randomTexture = this.randomTexture();
      const symbol = new Sprite(randomTexture);
      symbol.y = j * this.SYMBOL_SIZE;
      const scale = Math.min(
        this.SYMBOL_SIZE / symbol.width,
        this.SYMBOL_SIZE / symbol.height
      );
      symbol.scale.set(scale);
      symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 2);
      this.symbols.push(symbol);
      this.container.addChild(symbol);
    }
  }

  updateSymbols() {
    // Update each symbol's position and swap texture if needed.
    this.symbols.forEach((s, j) => {
      const prevY = s.y;
      s.y =
        ((this.position + j) % this.symbols.length) * this.SYMBOL_SIZE - this.SYMBOL_SIZE;
      if (s.y < 0 && prevY > this.SYMBOL_SIZE) {
        s.texture = this.randomTexture();
        const scale = Math.min(
          this.SYMBOL_SIZE / s.texture.width,
          this.SYMBOL_SIZE / s.texture.height
        );
        s.scale.set(scale);
        s.x = Math.round((this.SYMBOL_SIZE - s.width) / 2);
      }
    });
  }

  updateBlur() {
    this.blur.blurY = (this.position - this.previousPosition) * 8;
    this.previousPosition = this.position;
  }

  private randomTexture() {
    return this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
  }
}
