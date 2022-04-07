export default class Cell {
  constructor(alive) {
    this.alive = alive;
    this.lifeStyle = "#000000";
    this.deathStyle = "#fff";
    this.underpopulation = 2;
    this.overpopulation = 3;

    this.neighbors = [];
    this.nextState = null;
    this.previousState = null;
    this.forceRepaint = true;
  } // fin del constructor

  prepareUpdate() {
    let sum = 0;
    let nextState = this.alive;

    /* Contamos los vecinos vivos excluyéndome */
    for (let n of this.neighbors) {
      if (n.alive && n !== this) sum++;
    }

    /* Reglas */
    if (nextState && sum < this.underpopulation) {
      nextState = false;
    } else if (nextState && sum > this.overpopulation) {
      nextState = false;
    } else if (!nextState && sum == this.overpopulation) {
      nextState = true;
    }

    this.nextState = nextState;
  }

  update() {
    this.previousState = this.alive;
    this.alive = this.nextState;
    this.nextState = null;
  }

  handleClick() {
    this.alive = !this.alive;
  }

  setPaintStyles(canvasCtx) {
    canvasCtx.fillStyle = this.alive ? this.lifeStyle : this.deathStyle;
  }
}
