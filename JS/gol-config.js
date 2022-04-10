import GOL from "./gol.js";
import { loadPresets } from "./presets.js";

let CURRENT_SIM = null;
let preset = null;

document.addEventListener("DOMContentLoaded", function () {
  let pixelSize = 4;
  let roundDelay = 20;

  resetSimulation(pixelSize, roundDelay, 0.5);
  setupEventListeners(roundDelay);
  loadPresets();
});

function resetSimulation(pixelSize, roundDelay, initialChanceOfLife = 0.005) {
  let containerCanvas = document.getElementById("canvas");
  let previousCanvas = containerCanvas.querySelector("canvas");

  if (previousCanvas) containerCanvas.removeChild(previousCanvas);

  /* let canvasWidth = window.innerWidth * 0.78;
  let canvasHeight = window.innerHeight * 0.99; */
  const canvasSize = 800;
  let cols = canvasSize / pixelSize;
  let rows = canvasSize / pixelSize;

  CURRENT_SIM = new GOL(rows, cols, pixelSize, roundDelay, initialChanceOfLife);

  CURRENT_SIM.canvas.style.height = canvasSize + "px";
  CURRENT_SIM.canvas.style.width = canvasSize + "px";
  containerCanvas.append(CURRENT_SIM.canvas);
  CURRENT_SIM.repaint();
  CURRENT_SIM.start();

  window.CURRENT_SIM = CURRENT_SIM;
}

function setupEventListeners(initialRoundDelay) {
  let rulesForm = document.querySelector("#info-controls");
  rulesForm.querySelector("#frame-rate").value = initialRoundDelay;

  rulesForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  let pause = () => {
    if (CURRENT_SIM.paused) {
      CURRENT_SIM.start();
    } else {
      CURRENT_SIM.stop();
    }

    CURRENT_SIM.paused = !CURRENT_SIM.paused;
  };

  window.addEventListener("keydown", (e) => {
    if (e.which === 90) {
      pause();
    }
  });

  document.querySelector("#presets").addEventListener("change", (e) => {
    preset = e.target.value;
  });

  document
    .querySelector("#load-preset-button")
    .addEventListener("click", (e) => {
      CURRENT_SIM.resetLife(preset, 0.0);
    });

  document
    .querySelector("#pause-play-button")
    .addEventListener("click", (e) => {
      pause();
    });

  document.querySelector("#next-generation").addEventListener("click", (e) => {
    CURRENT_SIM.advanceRound();
    CURRENT_SIM.repaint(true);
  });

  document
    .querySelector("#reset-life-button")
    .addEventListener("click", (e) => {
      let chanceOfLife = 0.05;
      CURRENT_SIM.resetLife("empty", chanceOfLife);
    });

  document.querySelector("#frame-rate").addEventListener("change", (e) => {
    CURRENT_SIM.stop();
    CURRENT_SIM.interRoundDelay = Math.floor(Math.pow(e.target.value, 1.3));
    CURRENT_SIM.start();
  });

  document.querySelector("#btnColors").addEventListener("click", (e) => {
    const newLifeColor = document.querySelector("#lifeStyle").value;
    const newDeathColor = document.querySelector("#deathStyle").value;

    CURRENT_SIM.stop();
    CURRENT_SIM.setPixelColors(newLifeColor, newDeathColor);
    CURRENT_SIM.start();
  });
}
