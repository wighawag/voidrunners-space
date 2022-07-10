export type Pad = {
  x: number;
  y: number;
};

export type State = {
  pad1: Pad;
  pad2: Pad;
  pointer: Pad;
  button1: number;
  button2: number;
};

export class Controller {
  protected eventHandlers: {
    [name: string]: (event: MouseEvent | KeyboardEvent) => void;
  } = {};

  public readonly state: State;
  constructor(protected domElement?: HTMLElement) {
    this.resetState();
    if (!domElement) {
      this.domElement = document.body;
    }
  }

  resetState() {
    (this.state as any) = {
      pad1: { x: 0, y: 0 },
      pad2: { x: 0, y: 0 },
      pointer: { x: 0, y: 0 },
      button1: 0,
      button2: 0,
    };
  }

  attachEvent(name: string) {
    if (this[`on${name}`]) {
      const handler = this[`on${name}`].bind(this);
      this.eventHandlers[name] = handler;
      this.domElement.addEventListener(name, handler, false);
    } else {
      console.error(`no handler: on${name}`);
    }
  }

  detachEvent(name: string) {
    const handler = this.eventHandlers[name];
    if (handler) {
      this.domElement.removeEventListener(name, handler);
      delete this.eventHandlers[name];
    }
  }

  detachAllEvents() {
    for (const name of Object.keys(this.eventHandlers)) {
      this.detachEvent(name);
    }
  }

  start() {
    // TODO CHECK should we not always listen on the document ?

    this.attachEvent('keydown');
    this.attachEvent('keyup');
    this.attachEvent('mousedown');
  }

  startListeningForMousePosition() {
    this.attachEvent('mousemove');
    this.attachEvent('mouseup');
    this.attachEvent('mouseleave');
    this.attachEvent('mouseout');
  }

  stopListeningForMousePosition() {
    this.state.pointer.x = 0;
    this.state.pointer.y = 0;
    this.detachEvent('mousemove');
    this.detachEvent('mouseup');
    this.detachEvent('mouseleave');
    this.detachEvent('mouseout');
  }

  onmousedown(event: MouseEvent) {
    this.setPointer(event.pageX, event.pageY);
    this.startListeningForMousePosition();
  }

  onmouseup(event: MouseEvent) {
    this.stopListeningForMousePosition();
  }

  onmouseleave(event: MouseEvent) {
    this.stopListeningForMousePosition();
  }
  onmouseout(event: MouseEvent) {
    this.stopListeningForMousePosition();
  }

  onmousemove(event: MouseEvent) {
    this.setPointer(event.pageX, event.pageY);
  }

  setPointer(pageX: number, pageY: number) {
    const x = 2 * (pageX / document.body.clientWidth) - 1;
    const y = -(2 * (pageY / document.body.clientHeight) - 1);
    this.state.pointer.x = x;
    this.state.pointer.y = y;
  }

  onkeydown(event: KeyboardEvent) {
    if (document.activeElement != this.domElement) {
      console.log('DOWN cancelled');
      // we are focusing on a specific element, key should be discarded
      return;
    }
    console.log('DOWN', { code: event.code, key: event.key });
    switch (event.code) {
      case 'KeyW':
        this.state.pad1.y = 1.0;
        break;
      case 'KeyA':
        this.state.pad1.x = -1.0;
        break;
      case 'KeyS':
        this.state.pad1.y = -1.0;
        break;
      case 'KeyD':
        this.state.pad1.x = 1.0;
        break;
      case 'ArrowUp':
        this.state.pad2.y = 1.0;
        break;
      case 'ArrowLeft':
        this.state.pad2.x = -1.0;
        break;
      case 'ArrowDown':
        this.state.pad2.y = -1.0;
        break;
      case 'ArrowRight':
        this.state.pad2.x = 1.0;
        break;
    }
  }

  onkeyup(event: KeyboardEvent) {
    console.log('UP', { code: event.code, key: event.key });
    switch (event.code) {
      case 'KeyW':
        this.state.pad1.y = 0.0;
        break;
      case 'KeyA':
        this.state.pad1.x = 0.0;
        break;
      case 'KeyS':
        this.state.pad1.y = 0.0;
        break;
      case 'KeyD':
        this.state.pad1.x = 0.0;
        break;
      case 'ArrowUp':
        this.state.pad2.y = 0.0;
        break;
      case 'ArrowLeft':
        this.state.pad2.x = 0.0;
        break;
      case 'ArrowDown':
        this.state.pad2.y = 0.0;
        break;
      case 'ArrowRight':
        this.state.pad2.x = 0.0;
        break;
    }
  }

  stop() {
    this.resetState();
    this.detachAllEvents();
  }
}
