import {
  controller
}
from './Input';

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;
const GO_UP = 0;
const GO_DOWN = 1;
const GO_LEFT = 2;
const GO_RIGHT = 3;
const CELL_SIZE = 20;
const CELL_WIDTH = WINDOW_WIDTH / CELL_SIZE;
const CELL_HEIGHT = WINDOW_HEIGHT / CELL_SIZE;
const START_X = CELL_WIDTH / 2;
const START_Y = CELL_HEIGHT / 2;
const START_LENGTH = 3;

const rand = Math.random;

class SnakeSegment {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Coin {
  constructor() {
    this.respawn();
  }
  respawn() {
    this.x = 1 + rand() * (CELL_WIDTH - 2) | 0;
    this.y = 1 + rand() * (CELL_HEIGHT - 2) | 0;
  }
}

class Snake {
  constructor(headcolor, segmentcolor, coincolor) {
    this._segments = [];
    this._coin = new Coin();
    this._dead = false;
    this._direction = 0;
    this._time = 0;
    this._timeout = 0;
    this._headcolor = headcolor;
    this._segmentcolor = segmentcolor;
    this._coincolor = coincolor;
    this.restart();
  }

  restart() {
    this._segments.length = 0;
    for (let i = 0; i < START_LENGTH; i += 1) {
      this._addSegment(START_X - i, START_Y);
    }
    this._direction = GO_RIGHT;
    this._time = 0;
    this._timeout = 4;
    this._dead = false;
    this._score = 0;
  }

  update(deltaTime) {
    if (this._dead) {
      return;
    }

    this._updateInputControls();

    this._time += 1;
    if (this._time < this._timeout) {
      return;
    }
    this._time = 0;

    if (this._checkForWallCollision() || this._checkForSelfCollision()) {
      this._dead = true;
      return;
    }

    if (this._checkForCoinCollision()) {
      this._score += 5;
      this._coin.respawn();
    }
    else {
      this._segments.pop();
    }
    this._moveSnake(deltaTime);
  }

  render(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WINDOW_WIDTH, CELL_SIZE);
    ctx.fillRect(0, WINDOW_HEIGHT - CELL_SIZE, WINDOW_WIDTH, CELL_SIZE);
    ctx.fillRect(0, 0, CELL_SIZE, WINDOW_HEIGHT);
    ctx.fillRect(WINDOW_WIDTH - CELL_SIZE, 0, CELL_SIZE, WINDOW_HEIGHT);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.font = `${CELL_SIZE - 4}px monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${this._score}`, WINDOW_WIDTH * 0.5, 2);
    ctx.restore();
    if (this._dead) {
      return;
    }
    this._renderCoin(ctx);
    this._renderSnake(ctx);
  }
  
  get score() {
    return this._score;
  }

  get isDead() {
    return this._dead;
  }

  _updateInputControls() {
    if (controller.up && this._direction !== GO_DOWN) {
      this._direction = GO_UP;
    } else if (controller.down && this._direction !== GO_UP) {
      this._direction = GO_DOWN;
    } else if (controller.left && this._direction !== GO_RIGHT) {
      this._direction = GO_LEFT;
    } else if (controller.right && this._direction !== GO_LEFT) {
      this._direction = GO_RIGHT;
    }
  }

  _renderSnake(ctx) {
    this._segments.forEach((segment, index) => {
      ctx.save();
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      if (index > 0) {
        ctx.fillStyle = this._segmentcolor;
        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      } else {
        ctx.fillStyle = this._headcolor;
        ctx.beginPath();
        const RADIUS = CELL_SIZE * 0.5 | 0;
        ctx.arc(x + RADIUS, y + RADIUS, RADIUS, 0, Math.PI * 360);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  _renderCoin(ctx) {
    ctx.save();
    ctx.fillStyle = this._coincolor;
    const x = this._coin.x * CELL_SIZE;
    const y = this._coin.y * CELL_SIZE;
    ctx.beginPath();
    const RADIUS = CELL_SIZE * 0.5 | 0;
    ctx.arc(x + RADIUS, y + RADIUS, RADIUS, 0, Math.PI * 360);
    ctx.fill();
    ctx.restore();
  }

  _addSegment(x, y) {
    this._segments.push(new SnakeSegment(x, y));
  }

  _moveSnake() {
    const movex = [0, 0, -1, 1];
    const movey = [-1, 1, 0, 0];
    const x = this._segments[0].x + movex[this._direction];
    const y = this._segments[0].y + movey[this._direction];
    this._segments.unshift(new SnakeSegment(x, y));
  }

  _checkForWallCollision() {
    const segments = this._segments;
    const headx = segments[0].x;
    const heady = segments[0].y;
    return ((headx === 0) || (heady === 0) || (headx === CELL_WIDTH) || (heady === CELL_HEIGHT));
  }

  _checkForSelfCollision() {
    const segments = this._segments;
    const headx = segments[0].x;
    const heady = segments[0].y;
    return this._segments.filter((segment, index) => index > 0 && segment.x === headx && segment.y === heady).length > 0;
  }

  _checkForCoinCollision() {
    return this._segments[0].x === this._coin.x && this._segments[0].y === this._coin.y;
  }
}

export class Game {
  constructor() {
    this._highscore = 100;
  }
  
  init() {
    const game = this;
    const canvas = document.createElement('canvas');
    canvas.width = WINDOW_WIDTH;
    canvas.height = WINDOW_HEIGHT;
    canvas.style.imageRendering = 'pixelated';
    document.title = 'Snake';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');
    
    function aspectScale() {
      const portrait = window.innerWidth > window.innerHeight;
      let aspectRatio = WINDOW_WIDTH / WINDOW_HEIGHT;
      if (portrait) {
        aspectRatio = WINDOW_HEIGHT / WINDOW_WIDTH;
      }
      const invAspect = 1.0 / aspectRatio;
      game.size = { width: 0, height: 0 };
      if (portrait) {
        game.size.height = window.innerHeight;
        game.size.width = window.innerHeight * invAspect;
      } else {
        game.size.width = window.innerWidth;
        game.size.height = window.innerWidth * invAspect;
      }
      canvas.style.width = game.size.width + 'px';
      canvas.style.height = game.size.height + 'px';

      game.scale = {
        x: game.size.width / WINDOW_WIDTH,
        y: game.size.height / WINDOW_HEIGHT,
      };
    }

    function resize() {
      aspectScale();
      const left = (((window.innerWidth - game.size.width) * 0.5) | 0);
      const top = (((window.innerHeight - game.size.height) * 0.5) | 0);
      Object.assign(canvas.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
      });
    }
    window.addEventListener('resize', resize, false);
    resize();
    
    const backgroundcolor = 'rgb(0, 64, 0)';
    const snakeheadcolor = 'rgb(255, 0, 0)';
    const snakebodycolor = 'rgb(0, 255, 0)';
    const coincolor = 'rgb(255, 255, 0)';

    const snake = new Snake(snakeheadcolor, snakebodycolor, coincolor);
    
    let state = 'preplay';
    
    controller.init();
    
    const states = {
      preplay(deltaTime) {
        ctx.save();
        if (controller.start) {
          snake.restart();
          state = 'play';
        }
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '24px monospace';
        ctx.fillText(`HISCORE ${game._highscore}`, WINDOW_WIDTH * 0.5, (WINDOW_HEIGHT * 0.15));
        ctx.font = '48px monospace';
        ctx.fillText('SNAKE', WINDOW_WIDTH * 0.5, WINDOW_HEIGHT * 0.33);
        ctx.font = '24px monospace';
        ctx.fillText('PRESS ENTER TO PLAY', WINDOW_WIDTH * 0.5, 2 * (WINDOW_HEIGHT * 0.33));
        ctx.restore();
      },
      play(deltaTime) {
        ctx.save();
        if (snake.isDead) {
          state = 'preplay';
          game.checkHighScore(snake.score);
        }
        snake.update(deltaTime);
        ctx.fillStyle = backgroundcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        snake.render(ctx);
        ctx.restore();
      },
    };

    setInterval(() => states[state](0.033), 33);
  }
  
  loadHighScore() {
    const highscore = window.localStorage.getItem('highscore');
    if (highscore) {
      this._highscore = parseInt(highscore, 10);
    } else {
      window.localStorage.setItem('highscore', `${this._highscore}`);
    }
  }
  
  checkHighScore(score) {
    if (score > this._highscore) {
      this._highscore = score;
      window.localStorage.setItem('highscore', `${this._highscore}`);
      return true;
    }
    return false;
  }
}