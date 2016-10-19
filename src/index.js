import { Game } from './Snake';

function boot() {
  const game = new Game();
  game.loadHighScore && game.loadHighScore();
  game.init && game.init();
}

document.addEventListener('DOMContentLoaded', boot, false);
