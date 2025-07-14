import { Game } from "./Game";
// import the library before creating your pixi application to ensure all mixins are applied

(async () => {
  const game = new Game();
  await game.init();
})();
