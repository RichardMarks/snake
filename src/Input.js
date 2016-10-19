class Keyboard {
  constructor({ blacklist }) {
    this._state = {
      mods: {
      	alt: false,
      	shift: false,
     	 	ctrl: false,
      },
      keysDown: { },
    };
    this._blacklist = blacklist;
  }

  init() {
    const blacklist = this._blacklist;
    const onKeyDown = keyEvent => {
      blacklist && blacklist.indexOf(keyEvent.key) !== -1 && keyEvent.preventDefault();
      this._updateState({
        down: true,
        key: keyEvent.key,
        alt: keyEvent.altKey,
        shift: keyEvent.shiftKey,
        ctrl: keyEvent.ctrlKey,
      });
    };
    const onKeyUp = keyEvent => {
      this._updateState({
        down: false,
        key: keyEvent.key,
        alt: keyEvent.altKey,
        shift: keyEvent.shiftKey,
        ctrl: keyEvent.ctrlKey,
      });
    };
    
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
  }

  get state() { return this._state; }
  
  isDown(key) { return this._state.keysDown[key]; }

  _updateState(nextState) {
    const state = this._state;
    Object.keys(state.mods).forEach(mod => (state.mods[mod] = nextState[mod]));
    state.keysDown[nextState.key] = nextState.down;  
  }
}

const keyboard = new Keyboard({ });
const KEY_UP = 'ArrowUp';
const KEY_DOWN = 'ArrowDown';
const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';
const KEY_ENTER = 'Enter';

const controller = {
  get left() { return keyboard.isDown(KEY_LEFT); },
  get right() { return keyboard.isDown(KEY_RIGHT); },
  get up() { return keyboard.isDown(KEY_UP); },
  get down() { return keyboard.isDown(KEY_DOWN); },
  get start() { return keyboard.isDown(KEY_ENTER); },
};

export {
  keyboard,
  controller,
}
