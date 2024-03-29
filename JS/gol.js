import Cell from "./Cell.js";
import { presets } from "./presets.js";
import { Chart } from "./chartConfig.js";
import { bindMultipleEventListener } from "./utilities.js";

export default class GOL {
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
    /**
     * * Coordenadas de los vecinos respecto de cada célula
     */
    this.adjacentCells = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      //[0, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid.push([]);
      for (let j = 0; j < cols; j++) {
        let alive = Math.random() < initialChanceOfLife;
        this.grid[i].push(new Cell(alive));
      }
    }

    /**
     * * Le asignamos los vecinos a cada celda para optimizar los calculos
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

    // Para la gráfica
    this.chart = new Chart("graph", "Gráfica de densidades");
    this.chart2 = new Chart("graph", "Gráfica de densidades (log10)");
  } // fin del constructor

  start() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
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

    /**
     * * Mundo con bordes muertos
     */
    /* for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i === row && j === col) continue;
        if (this.grid[i] && this.grid[i][j]) {
          neighbors.push(this.grid[i][j]);
        }
      }
    } */

    /**
     * * Mundo toroidal
     */
    for (const pair of this.adjacentCells) {
      const xCoord = (row + pair[0] + this.rows) % this.rows;
      const yCoord = (col + pair[1] + this.rows) % this.rows;

      neighbors.push(this.grid[xCoord][yCoord]);
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
    /* Actualizamos las gráficas en cada ronda/generación */
    this.chart.updateChart(this.generations, this.population);
    this.chart2.updateChart(this.generations, Math.log10(this.population));

    document.querySelector("#generations").innerHTML = this.generations;
    document.querySelector("#population").innerHTML = this.population;
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

        let color = pixel.alive ? pixel.getLifeStyle() : pixel.getDeathStyle();
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
        //this.paintPixel(row, col);
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

  /**
   * * Change the rules to each cell in grid
   */
  setRules(S_min, S_max, B_min, B_max) {
    this.grid.forEach((row) => {
      row.forEach((cell) => {
        cell.S_min = S_min;
        cell.S_max = S_max;
        cell.B_min = B_min;
        cell.B_max = B_max;
      });
    });
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

    if (preset !== 0 || preset !== null || preset !== "empty") {
      console.log("cargando preset");
      const centerX = Math.floor(this.cols / 2);
      const centerY = Math.floor(this.rows / 2);
      presets[preset].forEach((pair) => {
        this.grid[pair[1] + centerY][pair[0] + centerX].alive = true;
      });
    }

    this.repaint();
  }

  setPixelColors(lifeStyle, deathStyle) {
    this.grid.forEach((row) => {
      row.forEach((pixel) => {
        pixel.setLifeStyle(lifeStyle);
        pixel.setDeathStyle(deathStyle);
        pixel.forceRepaint = true;
      });
    });
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

      /* document.querySelector("#xPos").innerHTML = e.offsetX + "";
      document.querySelector("#yPos").innerHTML = e.offsetY + ""; */
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
