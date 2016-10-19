import { controller } from './Input';

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
  constructor() { this.respawn(); }
	respawn() {
    this.x = 1 + rand() % (CELL_WIDTH - 2);
    this.y = 1 + rand() % (CELL_HEIGHT - 2);
  }
}

export class Snake {
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
  
  init() {
    const canvas = document.createElement('canvas');
    canvas.width = WINDOW_WIDTH;
    canvas.height = WINDOW_HEIGHT;
    document.insertBefore(canvas, document.firstChild);
    const ctx = canvas.getContext('2d');
  	const backgroundcolor = 'rgb(0, 64, 0)';
    const snakeheadcolor = 'rgb(255, 0, 0)';
    const snakebodycolor = 'rgb(0, 255, 0)';
    const coincolor = 'rgb(255, 255, 0)';
  
  	const snake = new Snake(snakeheadcolor, snakebodycolor, coincolor);
  	
    setInterval(() => {
   	  if (snake.isDead && controller.start) {
      	snake.restart();
      }
      snake.update(0.033);
      ctx.fillStyle = backgroundcolor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      snake.render(ctx);
    }, 33);
  }

  restart() {
    this._segments.length = 0;
    for (let i = 0; i < START_LENGTH; i += 1) {
      this._addSegment(START_X - i, START_Y);
    }
    this._direction = GO_RIGHT;
    this._time = 0;
    this._timeout = 6;
    this._dead = false;
  }

  update(deltaTime) {
    if (this._dead) { return; }

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
      this._coin.Respawn();
    } else {
      this._segments.pop();
    }
    this._moveSnake(deltaTime);
  }

  render(ctx) {
    if (this._dead) { return; }
    this._renderCoin(ctx);
    this._renderSnake(ctx);
  }

  get isDead() { return this._dead; }

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
      ctx.fillStyle = index > 0 ? this._segmentcolor : this._headcolor;
      ctx.translate(segment.x * CELL_SIZE, segment.y * CELL_SIZE);
      ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
      ctx.restore();
    });
  }

  _renderCoin(ctx) {
    ctx.save();
    ctx.fillStyle = this._coincolor;
    ctx.translate(this._coin.x * CELL_SIZE, this._coin.y * CELL_SIZE);
    ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
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
    return this._segments.filter(segment => segment.x === headx && segment.y === heady).length > 0;
  }

  _checkForCoinCollision() {
    return this._segments[0].x === this._coin.x && this._segments[0].y === this._coin.y;
  }
}
