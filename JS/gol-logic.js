class GOL {
  constructor(rows, cols, pixelSize, interRoundDelay, initialChanceOfLife) {
    this.rows = rows;
    this.cols = cols;
    this.pixelSize = pixelSize;
    this.interRoundDelay = interRoundDelay;
    this.mouseIsDown = false;
    this.paused = false;
    this.intervalId = 1;
    this.generations = 0;
    this.population = 0;

    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid.push([]);
      for (let j = 0; j < cols; j++) {
        let alive = Math.random() < initialChanceOfLife;
        this.grid[i].push(new Cell(alive));
      }
    }

    /**
     * Le asignamos los vecinos a cada celda para optimizar los calculos
     */
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].neighbors = this.getNeighbors(i, j);
      }
    }

    // Configuración del canvas
    let width = this.pixelSize * this.cols;
    let height = this.pixelSize * this.rows;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasCtx = this.canvas.getContext("2d", { alpha: false });

    this.registerMouseListeners();

    /* Para la gráfica */
    this.data = [];
    /* this.chart = new CanvasJS.Chart("chart", {
      title: {
        text: "Valores X vs. Valores Y",
      },
      axisX: {
        title: "Valores X",
      },
      axisY: {
        title: "Valores Y",
      },
      data: [{ type: "line", dataPoints: this.data }],
    }); */
  } // fin del constructor

  crearGrafica() {}

  updateChart() {
    this.data.push({
      x: CURRENT_SIM.getGenerations(),
      y: CURRENT_SIM.getPopulation(),
    });
    this.chart.render();
    console.log(this.data);
  }

  start() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      //this.updateChart();
      this.advanceRound();
      this.repaint();
    }, this.interRoundDelay);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getNeighbors(row, col) {
    let neighbors = [];
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i === row && j === col) continue;
        if (this.grid[i] && this.grid[i][j]) {
          neighbors.push(this.grid[i][j]);
        }
      }
    }

    return neighbors;
  }

  advanceRound() {
    if (this.mouseIsDown) return;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].prepareUpdate();
      }
    }

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].update();
      }
    }

    this.generations++;
    this.population = this.grid
      .flat()
      .filter((cell) => cell.alive === true).length;

    document.querySelector("#generations").innerHTML =
      this.getGenerations() + "";
    document.querySelector("#population").innerHTML = this.getPopulation() + "";
  }

  getGenerations() {
    return this.generations;
  }

  getPopulation() {
    return this.population;
  }

  repaint(force = false) {
    if (this.mouseIsDown && !force) return;

    let byColor = {};
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let pixel = this.grid[i][j];

        if (
          !force &&
          !pixel.forceRepaint &&
          pixel.alive === pixel.previousState
        ) {
          continue; // No se repinta si no cambió su estado
        }

        let color = pixel.alive ? pixel.lifeStyle : pixel.deathStyle;
        if (byColor[color] === undefined) {
          byColor[color] = [];
        }

        byColor[color].push([i, j]);
        pixel.forceRepaint = false;
      }
    }

    for (let color in byColor) {
      this.canvasCtx.fillStyle = color;

      for (let [row, col] of byColor[color]) {
        this.canvasCtx.fillRect(
          col * this.pixelSize,
          row * this.pixelSize,
          this.pixelSize,
          this.pixelSize
        );
      }
    }
  }

  paintPixel(row, col) {
    this.grid[row][col].setPaintStyles(this.canvasCtx);
    this.canvasCtx.fillRect(
      col * this.pixelSize,
      row * this.pixelSize,
      this.pixelSize,
      this.pixelSize
    );
  }

  resetLife(preset = "empty", chanceOfLife = 0.005) {
    this.generations = 0;

    console.log(preset);

    this.grid.forEach((row) => {
      row.forEach((pixel) => {
        pixel.previousState = pixel.alive;
        pixel.alive = Math.random() < chanceOfLife;
      });
    });

    if (preset !== 0 || preset !== null) {
      console.log("chinga tu madre");
      const centerX = Math.floor(this.cols / 2);
      const centerY = Math.floor(this.rows / 2);
      presets[preset].forEach((pair) => {
        this.grid[pair[1] + centerY][pair[0] + centerX].alive = true;
      });
    }

    this.repaint();
  }

  registerMouseListeners() {
    bindMultipleEventListener(this.canvas, ["mousemove", "touchmove"], (e) => {
      e.preventDefault();

      /**
       * * getBoundingClientRect -> devuelve el tamaño del elemento y su posición relativa respecto al viewport
       */
      if (this.mouseIsDown) {
        let x, y;
        if (e.touches) {
          let rect = e.target.getBoundingClientRect();
          x = Math.floor((e.touches[0].pageX - rect.left) / this.pixelSize);
          y = Math.floor((e.touches[0].pageY - rect.top) / this.pixelSize);
        } else {
          x = Math.floor(e.offsetX / this.pixelSize);
          y = Math.floor(e.offsetY / this.pixelSize);
        }

        this.grid[y][x].handleClick();
        this.paintPixel(y, x);
      }

      document.querySelector("#xPos").innerHTML = e.offsetX + "";
      document.querySelector("#yPos").innerHTML = e.offsetY + "";
    });

    bindMultipleEventListener(this.canvas, ["mousedown", "touchstart"], (e) => {
      e.preventDefault();

      let x, y;
      if (e.touches) {
        let rect = e.target.getBoundingClientRect();
        x = Math.floor((e.touches[0].pageX - rect.left) / this.pixelSize);
        y = Math.floor((e.touches[0].pageY - rect.top) / this.pixelSize);
      } else {
        x = Math.floor(e.offsetX / this.pixelSize);
        y = Math.floor(e.offsetY / this.pixelSize);
      }

      this.grid[y][x].handleClick();
      this.paintPixel(y, x);
      this.mouseIsDown = true;
    });

    bindMultipleEventListener(this.canvas, ["mouseup", "touchend"], (e) => {
      e.preventDefault();
      this.mouseIsDown = false;
    });
  }
}

class Cell {
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
