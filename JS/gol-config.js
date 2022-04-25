import GOL from "./gol.js";
import { loadPresets } from "./presets.js";

let CURRENT_SIM = null;
let preset = null;

document.addEventListener("DOMContentLoaded", function () {
  const roundDelay = 20;
  const pixelSize = 4;
  const canvasSize = 800;
  const rules = [2, 3, 3, 3];

  resetSimulation(pixelSize, canvasSize, rules, roundDelay, 0.05);
  setupEventListeners(canvasSize, pixelSize, rules, 0.05, roundDelay);
  loadPresets();
});

function resetSimulation(
  pixelSize,
  canvasSize,
  rules,
  roundDelay,
  initialChanceOfLife = 0.05
) {
  const containerCanvas = document.getElementById("canvas");
  const previousCanvas = containerCanvas.querySelector("canvas");

  const chart = document.querySelector("#chart");
  const previousGraph = document.querySelector("#graph");

  if (previousCanvas) containerCanvas.removeChild(previousCanvas);

  if (previousGraph) {
    chart.removeChild(previousGraph);
    const newGraph = document.createElement("div");
    newGraph.setAttribute("id", "graph");
    newGraph.style.width = "100%";
    newGraph.style.height = "50%";
    chart.appendChild(newGraph);
  }

  //const canvasSize = 800;
  const cols = parseInt(canvasSize / pixelSize);
  const rows = parseInt(canvasSize / pixelSize);

  CURRENT_SIM = new GOL(rows, cols, pixelSize, roundDelay, initialChanceOfLife);

  CURRENT_SIM.setRules(...rules);
  CURRENT_SIM.canvas.style.height = canvasSize + "px";
  CURRENT_SIM.canvas.style.width = canvasSize + "px";
  containerCanvas.append(CURRENT_SIM.canvas);
  CURRENT_SIM.repaint();
  CURRENT_SIM.start();

  window.CURRENT_SIM = CURRENT_SIM;
}

function setupEventListeners(
  initialCanvasSize,
  initialCellSize,
  initialRules,
  initialChanceOfLife,
  initialRoundDelay
) {
  const rulesForm = document.querySelector("#parameters-section");

  rulesForm.querySelector("#canvasSize").value = initialCanvasSize;
  rulesForm.querySelector("#cellSize").value = initialCellSize;
  rulesForm.querySelector("#S_min").value = initialRules[0];
  rulesForm.querySelector("#S_max").value = initialRules[1];
  rulesForm.querySelector("#B_min").value = initialRules[2];
  rulesForm.querySelector("#B_max").value = initialRules[3];
  rulesForm.querySelector("#percent-life-reset").value = initialChanceOfLife;
  rulesForm.querySelector("#frame-rate").value = initialRoundDelay;

  const pause = () => {
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
    .querySelector("#update-rules-button")
    .addEventListener("click", (e) => {
      let rules = [
        parseInt(rulesForm.querySelector("#S_min").value, 10),
        parseInt(rulesForm.querySelector("#S_max").value, 10),
        parseInt(rulesForm.querySelector("#B_min").value, 10),
        parseInt(rulesForm.querySelector("#B_max").value, 10),
      ];

      CURRENT_SIM.setRules(...rules);
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
      const canvasSize = rulesForm.querySelector("#canvasSize").value;
      const cellSize = rulesForm.querySelector("#cellSize").value;
      const rules = [];
      rules.push(rulesForm.querySelector("#S_min").value);
      rules.push(rulesForm.querySelector("#S_max").value);
      rules.push(rulesForm.querySelector("#B_min").value);
      rules.push(rulesForm.querySelector("#B_max").value);
      const chanceOfLife = rulesForm.querySelector("#percent-life-reset").value;
      const roundDelay = rulesForm.querySelector("#frame-rate").value;

      resetSimulation(cellSize, canvasSize, rules, roundDelay, chanceOfLife);
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
