import "./styles.css";
import { LexiKnotController, type LexiKnotSnapshot } from "./io/lexiKnotController";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Missing app root.");
}

app.innerHTML = `
  <section class="workspace">
    <header class="topbar">
      <div>
        <h1>LexiKnot</h1>
        <p>Forward regex graph MVP</p>
      </div>
      <div class="toolbar" aria-label="Node tools">
        <button type="button" data-add-node="literal" title="Add literal node">Literal</button>
        <button type="button" data-add-node="characterClass" title="Add character class node">Class</button>
        <button type="button" data-add-node="anyCharacter" title="Add any character node">Any</button>
      </div>
    </header>
    <section class="workbench">
      <div class="canvas-shell">
        <canvas id="lexi-canvas" aria-label="LexiKnot graph canvas"></canvas>
      </div>
      <aside class="inspector" aria-label="Node inspector">
        <label class="field">
          <span>Value</span>
          <input id="node-value" type="text" disabled />
        </label>
        <label class="field">
          <span>Regex</span>
          <output id="regex-output"></output>
        </label>
      </aside>
    </section>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#lexi-canvas");
const valueInput = document.querySelector<HTMLInputElement>("#node-value");
const regexOutput = document.querySelector<HTMLOutputElement>("#regex-output");
const addNodeButtons = document.querySelectorAll<HTMLButtonElement>("[data-add-node]");

if (canvas === null || valueInput === null || regexOutput === null) {
  throw new Error("Missing LexiKnot UI elements.");
}

const controller = new LexiKnotController({
  canvas,
  onChange: (snapshot) => updateInspector(snapshot, valueInput, regexOutput),
});

for (const button of addNodeButtons) {
  button.addEventListener("click", () => {
    const type = button.dataset.addNode;
    if (type === "literal" || type === "characterClass" || type === "anyCharacter") {
      controller.addNode(type);
    }
  });
}

valueInput.addEventListener("input", () => {
  controller.updateSelectedNodeValue(valueInput.value);
});

function updateInspector(
  snapshot: LexiKnotSnapshot,
  input: HTMLInputElement,
  output: HTMLOutputElement,
): void {
  output.value = snapshot.regex || "(empty)";

  const selected = snapshot.selectedNode;
  if (selected?.data.kind === "literal" || selected?.data.kind === "characterClass") {
    input.disabled = false;
    input.value = selected.data.value;
    return;
  }

  input.disabled = true;
  input.value = "";
}
