export default class Cell {
  constructor(alive) {
    this.alive = alive;
    this.lifeColor = "#000000";
    this.deathColor = "#ffffff";
    this.S_min = 2;
    this.S_max = 3;
    this.B_min = 3;
    this.B_max = 3;

    this.neighbors = [];
    this.nextState = null;
    this.previousState = null;
    this.forceRepaint = true;

    if (this.B_max < this.B_min) {
      this.B_min = this.B_max;
    }
  } // fin del constructor

  prepareUpdate() {
    let sum = 0;
    let nextState = this.alive;

    /* Contamos los vecinos vivos excluyéndome */
    for (let n of this.neighbors) {
      if (n.alive && n !== this) sum++;
    }

    /* Reglas */
    if (nextState && (sum < this.S_min || sum > this.S_max)) {
      nextState = false;
    } else if (!nextState && sum >= this.B_min && sum <= this.B_max) {
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

  getLifeStyle() {
    return this.lifeColor;
  }

  setLifeStyle(color) {
    this.lifeColor = color;
  }

  getDeathStyle() {
    return this.deathColor;
  }

  setDeathStyle(color) {
    this.deathColor = color;
  }

  setPaintStyles(canvasCtx) {
    canvasCtx.fillStyle = this.alive ? this.lifeColor : this.deathColor;
  }
}
