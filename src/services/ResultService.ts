import { GameModel } from "../models/GameModel";
import { ReelModel } from "../models/ReelModel";

// Define the result interface from backend
export interface SpinResult {
  reels: number[][]; // Array of arrays of symbol indices
  winAmount: number;
  winLines: number[];
}

export class ResultService {
  /**
   * Fetches spin results from the backend
   * In a real implementation, this would make an API call
   */
  async getSpinResults(): Promise<SpinResult> {
    // Mock implementation - in real app, would call an API
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve({
          reels: [
            [1, 2, 0], // First reel symbols (top to bottom)
            [3, 0, 2], // Second reel
            [2, 1, 3], // Third reel
            [0, 3, 1], // Fourth reel
            [1, 0, 2], // Fifth reel
          ],
          winAmount: 100,
          winLines: [1, 3],
        });
      }, 500);
    });
  }

  /**
   * Applies the backend results to the game model
   * @param gameModel The game model to update
   * @param results The results from the backend
   */
  applyResults(gameModel: GameModel, results: SpinResult): void {
    // Apply the results to each reel
    gameModel.reels.forEach((reel, reelIndex) => {
      if (reelIndex < results.reels.length) {
        this.applyReelResult(reel, results.reels[reelIndex]);
      }
    });

    // Here you would also handle win animations, etc.
    console.log(`Win amount: ${results.winAmount}`);
    console.log(`Win lines: ${results.winLines}`);
  }

  /**
   * Sets the final symbols for a specific reel
   * @param reelModel The reel model to update
   * @param symbolIndices Array of symbol indices for this reel
   */
  private applyReelResult(reelModel: ReelModel, symbolIndices: number[]): void {
    // Ensure we have the right number of indices
    if (symbolIndices.length !== 3) {
      // We expect 3 visible symbols
      console.error("Invalid number of symbols in result");
      return;
    }

    // Set the visible symbols in the reel
    // We need to map the backend indices to the actual symbols in the reel
    symbolIndices.forEach((index, position) => {
      if (index >= 0 && index < reelModel.slotTextures.length) {
        // Skip the hidden symbol (position 3)
        const modelIndex = position < 3 ? position : position;
        reelModel.symbols[modelIndex].texture = reelModel.slotTextures[index];
      } else {
        console.error(`Invalid symbol index: ${index}`);
      }
    });
  }
}
