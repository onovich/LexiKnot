import "./styles.css";
import {
  getBrowserLanguage,
  languageOptions,
  messages,
  type LanguageCode,
  type Messages,
} from "./i18n";
import { LexiKnotController, type LexiKnotSnapshot } from "./io/lexiKnotController";

const initialPattern = "ab[c].";
let currentLanguage: LanguageCode = getBrowserLanguage();
let currentMessages = messages[currentLanguage];
const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Missing app root.");
}

document.documentElement.lang = currentLanguage;

app.innerHTML = `
  <section class="workspace">
    <header class="topbar">
      <div>
        <h1>LexiKnot</h1>
        <p id="app-subtitle">${currentMessages.appSubtitle}</p>
      </div>
      <div class="toolbar" aria-label="${currentMessages.nodeTools}">
        <label class="language-switch">
          <span id="language-label">${currentMessages.language}</span>
          <select id="language-select">
            ${languageOptions
              .map(
                (option) =>
                  `<option value="${option.code}" ${option.code === currentLanguage ? "selected" : ""}>${option.label}</option>`,
              )
              .join("")}
          </select>
        </label>
        <button type="button" data-add-node="literal">${currentMessages.addLiteral}</button>
        <button type="button" data-add-node="characterClass">${currentMessages.addClass}</button>
        <button type="button" data-add-node="anyCharacter">${currentMessages.addAny}</button>
        <button type="button" data-add-node="digitCharacter">${currentMessages.addDigit}</button>
        <button type="button" data-add-node="wordCharacter">${currentMessages.addWord}</button>
        <button type="button" data-add-node="whitespaceCharacter">${currentMessages.addWhitespace}</button>
        <button type="button" data-add-node="lineStart">${currentMessages.addLineStart}</button>
        <button type="button" data-add-node="lineEnd">${currentMessages.addLineEnd}</button>
      </div>
    </header>
    <section class="workbench">
      <div class="canvas-shell">
        <canvas id="lexi-canvas" aria-label="${currentMessages.graphCanvas}"></canvas>
      </div>
      <aside class="inspector" aria-label="${currentMessages.nodeInspector}">
        <label class="field">
          <span data-i18n="regexInput">${currentMessages.regexInput}</span>
          <input id="regex-input" type="text" value="${initialPattern}" />
        </label>
        <button class="primary-action" id="parse-regex" type="button">${currentMessages.parseToGraph}</button>
        <output class="message" id="parse-message"></output>
        <label class="field">
          <span data-i18n="value">${currentMessages.value}</span>
          <input id="node-value" type="text" disabled />
        </label>
        <button class="secondary-action" id="delete-node" type="button" disabled>${currentMessages.deleteNode}</button>
        <p class="help-text" id="character-class-help">${currentMessages.characterClassHelp}</p>
        <label class="field">
          <span data-i18n="generatedRegex">${currentMessages.generatedRegex}</span>
          <output id="regex-output"></output>
        </label>
        <label class="field">
          <span data-i18n="testString">${currentMessages.testString}</span>
          <input id="test-string" type="text" placeholder="${currentMessages.testPlaceholder}" />
        </label>
        <output class="match-result" id="match-output"></output>
      </aside>
    </section>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#lexi-canvas");
const subtitle = document.querySelector<HTMLParagraphElement>("#app-subtitle");
const toolbar = document.querySelector<HTMLElement>(".toolbar");
const languageLabel = document.querySelector<HTMLSpanElement>("#language-label");
const languageSelect = document.querySelector<HTMLSelectElement>("#language-select");
const regexInput = document.querySelector<HTMLInputElement>("#regex-input");
const parseButton = document.querySelector<HTMLButtonElement>("#parse-regex");
const parseMessage = document.querySelector<HTMLOutputElement>("#parse-message");
const valueInput = document.querySelector<HTMLInputElement>("#node-value");
const deleteButton = document.querySelector<HTMLButtonElement>("#delete-node");
const characterClassHelp = document.querySelector<HTMLParagraphElement>("#character-class-help");
const regexOutput = document.querySelector<HTMLOutputElement>("#regex-output");
const testStringInput = document.querySelector<HTMLInputElement>("#test-string");
const matchOutput = document.querySelector<HTMLOutputElement>("#match-output");
const addNodeButtons = document.querySelectorAll<HTMLButtonElement>("[data-add-node]");

if (
  canvas === null ||
  subtitle === null ||
  toolbar === null ||
  languageLabel === null ||
  languageSelect === null ||
  regexInput === null ||
  parseButton === null ||
  parseMessage === null ||
  valueInput === null ||
  deleteButton === null ||
  characterClassHelp === null ||
  regexOutput === null ||
  testStringInput === null ||
  matchOutput === null
) {
  throw new Error("Missing LexiKnot UI elements.");
}

const controller = new LexiKnotController({
  canvas,
  nodeText: currentMessages.nodes,
  onChange: (snapshot) =>
    updateInspector(
      snapshot,
      {
        regexInput,
        parseMessage,
        valueInput,
        deleteButton,
        regexOutput,
        matchOutput,
      },
      currentMessages,
    ),
});

controller.setRegex(initialPattern);

for (const button of addNodeButtons) {
  button.addEventListener("click", () => {
    const type = button.dataset.addNode;
    if (
      type === "literal" ||
      type === "characterClass" ||
      type === "anyCharacter" ||
      type === "digitCharacter" ||
      type === "wordCharacter" ||
      type === "whitespaceCharacter" ||
      type === "lineStart" ||
      type === "lineEnd"
    ) {
      controller.addNode(type);
    }
  });
}

languageSelect.addEventListener("change", () => {
  const nextLanguage = languageSelect.value as LanguageCode;
  if (!(nextLanguage in messages)) {
    return;
  }

  currentLanguage = nextLanguage;
  currentMessages = messages[currentLanguage];
  document.documentElement.lang = currentLanguage;
  controller.setNodeText(currentMessages.nodes);
  updateStaticText(
    {
      subtitle,
      toolbar,
      languageLabel,
      parseButton,
      deleteButton,
      characterClassHelp,
      testStringInput,
      canvas,
    },
    currentMessages,
  );
  updateInspector(
    controller.getSnapshot(),
    {
      regexInput,
      parseMessage,
      valueInput,
      deleteButton,
      regexOutput,
      matchOutput,
    },
    currentMessages,
  );
});

valueInput.addEventListener("input", () => {
  controller.updateSelectedNodeValue(valueInput.value);
});

deleteButton.addEventListener("click", () => {
  controller.deleteSelectedNode();
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
  readonly deleteButton: HTMLButtonElement;
  readonly regexOutput: HTMLOutputElement;
  readonly matchOutput: HTMLOutputElement;
}

function updateInspector(
  snapshot: LexiKnotSnapshot,
  elements: InspectorElements,
  text: Messages,
): void {
  elements.regexOutput.value = snapshot.regex || text.empty;

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

  elements.deleteButton.disabled =
    selected === null || selected.data.kind === "start" || selected.data.kind === "end";

  if (snapshot.matchResult === null) {
    elements.matchOutput.value = "";
    elements.matchOutput.dataset.state = "empty";
  } else if (!snapshot.matchResult.isValid) {
    elements.matchOutput.value = snapshot.matchResult.error ?? text.invalidRegex;
    elements.matchOutput.dataset.state = "error";
  } else {
    elements.matchOutput.value = snapshot.matchResult.isMatch ? text.fullMatch : text.noFullMatch;
    elements.matchOutput.dataset.state = snapshot.matchResult.isMatch ? "match" : "miss";
  }
}

interface StaticTextElements {
  readonly subtitle: HTMLParagraphElement;
  readonly toolbar: HTMLElement;
  readonly languageLabel: HTMLSpanElement;
  readonly parseButton: HTMLButtonElement;
  readonly deleteButton: HTMLButtonElement;
  readonly characterClassHelp: HTMLParagraphElement;
  readonly testStringInput: HTMLInputElement;
  readonly canvas: HTMLCanvasElement;
}

function updateStaticText(elements: StaticTextElements, text: Messages): void {
  elements.subtitle.textContent = text.appSubtitle;
  elements.toolbar.setAttribute("aria-label", text.nodeTools);
  elements.languageLabel.textContent = text.language;
  elements.parseButton.textContent = text.parseToGraph;
  elements.deleteButton.textContent = text.deleteNode;
  elements.characterClassHelp.textContent = text.characterClassHelp;
  elements.testStringInput.placeholder = text.testPlaceholder;
  elements.canvas.setAttribute("aria-label", text.graphCanvas);

  setText("regexInput", text.regexInput);
  setText("value", text.value);
  setText("generatedRegex", text.generatedRegex);
  setText("testString", text.testString);

  setButtonText("literal", text.addLiteral);
  setButtonText("characterClass", text.addClass);
  setButtonText("anyCharacter", text.addAny);
  setButtonText("digitCharacter", text.addDigit);
  setButtonText("wordCharacter", text.addWord);
  setButtonText("whitespaceCharacter", text.addWhitespace);
  setButtonText("lineStart", text.addLineStart);
  setButtonText("lineEnd", text.addLineEnd);
}

function setText(key: string, value: string): void {
  const element = document.querySelector<HTMLElement>(`[data-i18n="${key}"]`);
  if (element !== null) {
    element.textContent = value;
  }
}

function setButtonText(nodeType: string, value: string): void {
  const element = document.querySelector<HTMLButtonElement>(`[data-add-node="${nodeType}"]`);
  if (element !== null) {
    element.textContent = value;
  }
}
