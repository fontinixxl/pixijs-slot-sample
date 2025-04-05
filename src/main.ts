import { Game } from "./Game";
import { initDevtools } from "@pixi/devtools";

(async () => {
  const game = new Game();
  await game.init();
})();
