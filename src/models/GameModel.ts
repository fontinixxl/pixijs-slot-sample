import { ReelModel } from "./ReelModel";

export class GameModel {
  reels: ReelModel[] = [];
  isSpinning: boolean = false;

  constructor(public reelCount: number = 5) {}

  setReels(reels: ReelModel[]): void {
    this.reels = reels;
  }
}
