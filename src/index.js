import { Snake } from './Snake';

function boot() {
  const game = new Snake();
  game.loadHighScore && game.loadHighScore();
  game.init && game.init();
}

document.addEventListener('DOMContentLoaded', boot, false);
