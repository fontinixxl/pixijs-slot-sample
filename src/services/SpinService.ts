import { ReelModel } from "../models/ReelModel";
import { ReelView } from "../views/ReelView";
import gsap from "gsap";

export class SpinService {
  constructor(private reelModels: ReelModel[], private reelViews: ReelView[]) {}

  /**
   * Starts the spinning animation for all reels
   * @param onComplete Function to call when all reels have stopped spinning
   */
  spin(onComplete: () => void): void {
    this.reelModels.forEach((model, i) => {
      // Calculate a random number of extra rotations
      const extra = Math.floor(Math.random() * 3);

      // Target position is current position plus 10 rotations plus
      // extra rotations based on reel index (first reel stops sooner)
      const target = model.position + 10 + i * 5 + extra;

      // Duration increases for each reel
      const time = (2500 + i * 600 + extra * 600) / 1000;

      // Animate using GSAP
      gsap.to(model, {
        position: target,
        duration: time,
        ease: "back.out(0.5)",
        onUpdate: () => {
          // Update the model state during animation
          model.update();
        },
        onComplete: i === this.reelModels.length - 1 ? onComplete : undefined,
      });
    });
  }

  /**
   * Updates all reel views based on their models
   * Called by the game loop
   */
  update(): void {
    this.reelViews.forEach((view) => {
      view.update();
    });
  }
}
