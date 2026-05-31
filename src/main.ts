import "./styles.css";
import { LexiKnotController, type LexiKnotSnapshot } from "./io/lexiKnotController";

const initialPattern = "ab[c].";
const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Missing app root.");
}

app.innerHTML = `
  <section class="workspace">
    <header class="topbar">
      <div>
        <h1>LexiKnot</h1>
        <p>Bidirectional regex graph test UI</p>
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
          <span>Regex input</span>
          <input id="regex-input" type="text" value="${initialPattern}" />
        </label>
        <button class="primary-action" id="parse-regex" type="button">Parse to graph</button>
        <output class="message" id="parse-message"></output>
        <label class="field">
          <span>Value</span>
          <input id="node-value" type="text" disabled />
        </label>
        <label class="field">
          <span>Generated regex</span>
          <output id="regex-output"></output>
        </label>
        <label class="field">
          <span>Test string</span>
          <input id="test-string" type="text" placeholder="Try a full-match sample" />
        </label>
        <output class="match-result" id="match-output"></output>
      </aside>
    </section>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#lexi-canvas");
const regexInput = document.querySelector<HTMLInputElement>("#regex-input");
const parseButton = document.querySelector<HTMLButtonElement>("#parse-regex");
const parseMessage = document.querySelector<HTMLOutputElement>("#parse-message");
const valueInput = document.querySelector<HTMLInputElement>("#node-value");
const regexOutput = document.querySelector<HTMLOutputElement>("#regex-output");
const testStringInput = document.querySelector<HTMLInputElement>("#test-string");
const matchOutput = document.querySelector<HTMLOutputElement>("#match-output");
const addNodeButtons = document.querySelectorAll<HTMLButtonElement>("[data-add-node]");

if (
  canvas === null ||
  regexInput === null ||
  parseButton === null ||
  parseMessage === null ||
  valueInput === null ||
  regexOutput === null ||
  testStringInput === null ||
  matchOutput === null
) {
  throw new Error("Missing LexiKnot UI elements.");
}

const controller = new LexiKnotController({
  canvas,
  onChange: (snapshot) =>
    updateInspector(snapshot, {
      regexInput,
      parseMessage,
      valueInput,
      regexOutput,
      matchOutput,
    }),
});

controller.setRegex(initialPattern);

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

parseButton.addEventListener("click", () => {
  controller.setRegex(regexInput.value);
});

regexInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    controller.setRegex(regexInput.value);
  }
});

testStringInput.addEventListener("input", () => {
  controller.setSampleText(testStringInput.value);
});

interface InspectorElements {
  readonly regexInput: HTMLInputElement;
  readonly parseMessage: HTMLOutputElement;
  readonly valueInput: HTMLInputElement;
  readonly regexOutput: HTMLOutputElement;
  readonly matchOutput: HTMLOutputElement;
}

function updateInspector(snapshot: LexiKnotSnapshot, elements: InspectorElements): void {
  elements.regexOutput.value = snapshot.regex || "(empty)";

  if (document.activeElement !== elements.regexInput) {
    elements.regexInput.value = snapshot.regex;
  }

  elements.parseMessage.value = snapshot.parseMessage ?? "";

  const selected = snapshot.selectedNode;
  if (
    selected?.data.kind === "literal" ||
    selected?.data.kind === "characterClass" ||
    selected?.data.kind === "regexFragment"
  ) {
    elements.valueInput.disabled = false;
    elements.valueInput.value =
      selected.data.kind === "regexFragment" ? selected.data.expression : selected.data.value;
  } else {
    elements.valueInput.disabled = true;
    elements.valueInput.value = "";
  }

  if (snapshot.matchResult === null) {
    elements.matchOutput.value = "";
    elements.matchOutput.dataset.state = "empty";
  } else if (!snapshot.matchResult.isValid) {
    elements.matchOutput.value = snapshot.matchResult.error ?? "Invalid regex";
    elements.matchOutput.dataset.state = "error";
  } else {
    elements.matchOutput.value = snapshot.matchResult.isMatch ? "Full match" : "No full match";
    elements.matchOutput.dataset.state = snapshot.matchResult.isMatch ? "match" : "miss";
  }
}
