import "./styles.css";
import {
  getBrowserLanguage,
  languageOptions,
  messages,
  type LanguageCode,
  type Messages,
} from "./i18n";
import { LexiKnotController, type LexiKnotSnapshot } from "./io/lexiKnotController";
import { getEdgeMeaning, getNodeRole, type NodeType } from "./topology";

const initialPattern = "ab[c].";
type AddableNodeType = Exclude<NodeType, "start" | "end">;

const nounNodeTypes: readonly AddableNodeType[] = [
  "literal",
  "characterClass",
  "excludedCharacterClass",
  "anyCharacter",
  "digitCharacter",
  "nonDigitCharacter",
  "wordCharacter",
  "nonWordCharacter",
  "whitespaceCharacter",
  "nonWhitespaceCharacter",
  "lineStart",
  "lineEnd",
  "wordBoundary",
  "notWordBoundary",
];
const verbNodeTypes: readonly AddableNodeType[] = [
  "sequenceThen",
  "chooseOne",
  "oneOrMore",
  "zeroOrMore",
  "optional",
  "exactCount",
  "repeatAtLeast",
  "repeatBetween",
];

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
    </header>
    <section class="workbench">
      <aside class="node-palette" aria-label="${currentMessages.nodeTools}">
        ${createPaletteSection("nouns-heading", currentMessages.nouns, nounNodeTypes, currentMessages)}
        ${createPaletteSection("verbs-heading", currentMessages.verbs, verbNodeTypes, currentMessages)}
      </aside>
      <div class="canvas-shell">
        <canvas id="lexi-canvas" aria-label="${currentMessages.graphCanvas}"></canvas>
        <div class="selection-note" id="selection-note" hidden>
          <h2 id="selection-title"></h2>
          <p class="selection-meta" id="selection-meta"></p>
          <p id="selection-body"></p>
        </div>
        <div class="context-menu" id="context-menu" hidden>
          ${createPaletteSection("context-nouns-heading", currentMessages.nouns, nounNodeTypes, currentMessages, "context")}
          ${createPaletteSection("context-verbs-heading", currentMessages.verbs, verbNodeTypes, currentMessages, "context")}
        </div>
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

const canvas = query<HTMLCanvasElement>("#lexi-canvas");
const subtitle = query<HTMLParagraphElement>("#app-subtitle");
const nodePalette = query<HTMLElement>(".node-palette");
const languageLabel = query<HTMLSpanElement>("#language-label");
const languageSelect = query<HTMLSelectElement>("#language-select");
const nounsHeading = query<HTMLHeadingElement>("#nouns-heading");
const verbsHeading = query<HTMLHeadingElement>("#verbs-heading");
const contextMenu = query<HTMLDivElement>("#context-menu");
const contextNounsHeading = query<HTMLHeadingElement>("#context-nouns-heading");
const contextVerbsHeading = query<HTMLHeadingElement>("#context-verbs-heading");
const selectionNote = query<HTMLDivElement>("#selection-note");
const selectionTitle = query<HTMLHeadingElement>("#selection-title");
const selectionMeta = query<HTMLParagraphElement>("#selection-meta");
const selectionBody = query<HTMLParagraphElement>("#selection-body");
const regexInput = query<HTMLInputElement>("#regex-input");
const parseButton = query<HTMLButtonElement>("#parse-regex");
const parseMessage = query<HTMLOutputElement>("#parse-message");
const valueInput = query<HTMLInputElement>("#node-value");
const deleteButton = query<HTMLButtonElement>("#delete-node");
const regexOutput = query<HTMLOutputElement>("#regex-output");
const testStringInput = query<HTMLInputElement>("#test-string");
const matchOutput = query<HTMLOutputElement>("#match-output");

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
        selectionNote,
        selectionTitle,
        selectionMeta,
        selectionBody,
      },
      currentMessages,
    ),
});

controller.setRegex(initialPattern);
bindPaletteButtons();

let contextMenuPoint: { x: number; y: number } | null = null;

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const canvasPoint = getCanvasPoint(canvas, event);
  if (!controller.canCreateNodeAt(canvasPoint)) {
    hideContextMenu();
    return;
  }

  contextMenuPoint = canvasPoint;
  contextMenu.hidden = false;
  const menuWidth = 200;
  const menuHeight = 520;
  contextMenu.style.left = `${Math.max(
    8,
    Math.min(event.clientX, window.innerWidth - menuWidth - 8),
  )}px`;
  contextMenu.style.top = `${Math.max(
    8,
    Math.min(event.clientY, window.innerHeight - menuHeight - 8),
  )}px`;
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLElement) || !contextMenu.contains(event.target)) {
    hideContextMenu();
  }
});

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
      nodePalette,
      languageLabel,
      nounsHeading,
      verbsHeading,
      contextNounsHeading,
      contextVerbsHeading,
      parseButton,
      deleteButton,
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
      selectionNote,
      selectionTitle,
      selectionMeta,
      selectionBody,
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
  readonly selectionNote: HTMLDivElement;
  readonly selectionTitle: HTMLHeadingElement;
  readonly selectionMeta: HTMLParagraphElement;
  readonly selectionBody: HTMLParagraphElement;
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
    selected?.data.kind === "excludedCharacterClass" ||
    selected?.data.kind === "exactCount" ||
    selected?.data.kind === "repeatAtLeast" ||
    selected?.data.kind === "repeatBetween" ||
    selected?.data.kind === "regexFragment"
  ) {
    elements.valueInput.disabled = false;
    elements.valueInput.value =
      selected.data.kind === "regexFragment"
        ? selected.data.expression
        : selected.data.kind === "exactCount"
          ? selected.data.count
          : selected.data.kind === "repeatAtLeast"
            ? selected.data.min
            : selected.data.kind === "repeatBetween"
              ? `${selected.data.min},${selected.data.max}`
              : selected.data.value;
  } else {
    elements.valueInput.disabled = true;
    elements.valueInput.value = "";
  }

  elements.deleteButton.disabled =
    selected === null || selected.data.kind === "start" || selected.data.kind === "end";
  updateSelectionNote(snapshot, elements, text);

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
  readonly nodePalette: HTMLElement;
  readonly languageLabel: HTMLSpanElement;
  readonly nounsHeading: HTMLHeadingElement;
  readonly verbsHeading: HTMLHeadingElement;
  readonly contextNounsHeading: HTMLHeadingElement;
  readonly contextVerbsHeading: HTMLHeadingElement;
  readonly parseButton: HTMLButtonElement;
  readonly deleteButton: HTMLButtonElement;
  readonly testStringInput: HTMLInputElement;
  readonly canvas: HTMLCanvasElement;
}

function updateStaticText(elements: StaticTextElements, text: Messages): void {
  elements.subtitle.textContent = text.appSubtitle;
  elements.nodePalette.setAttribute("aria-label", text.nodeTools);
  elements.languageLabel.textContent = text.language;
  elements.nounsHeading.textContent = text.nouns;
  elements.verbsHeading.textContent = text.verbs;
  elements.contextNounsHeading.textContent = text.nouns;
  elements.contextVerbsHeading.textContent = text.verbs;
  elements.parseButton.textContent = text.parseToGraph;
  elements.deleteButton.textContent = text.deleteNode;
  elements.testStringInput.placeholder = text.testPlaceholder;
  elements.canvas.setAttribute("aria-label", text.graphCanvas);

  setText("regexInput", text.regexInput);
  setText("value", text.value);
  setText("generatedRegex", text.generatedRegex);
  setText("testString", text.testString);

  for (const type of [...nounNodeTypes, ...verbNodeTypes]) {
    setButtonText(type, getNodeButtonLabel(type, text));
  }
}

function updateSelectionNote(
  snapshot: LexiKnotSnapshot,
  elements: Pick<
    InspectorElements,
    "selectionNote" | "selectionTitle" | "selectionMeta" | "selectionBody"
  >,
  text: Messages,
): void {
  if (snapshot.selectedNode !== null) {
    const role = getNodeRole(snapshot.selectedNode.type);
    elements.selectionNote.hidden = false;
    elements.selectionTitle.textContent = text.nodes[snapshot.selectedNode.data.kind];
    elements.selectionMeta.textContent = text.roleLabels[role];
    elements.selectionBody.textContent = text.nodeHelp[snapshot.selectedNode.data.kind];
    return;
  }

  if (snapshot.selectedEdge !== null) {
    const meaning = getEdgeMeaning(snapshot.graph, snapshot.selectedEdge);
    elements.selectionNote.hidden = false;
    elements.selectionTitle.textContent = text.edgeLabels[meaning];
    elements.selectionMeta.textContent = text.edgeLabels[meaning];
    elements.selectionBody.textContent = text.edgeHelp[meaning];
    return;
  }

  elements.selectionNote.hidden = true;
}

function bindPaletteButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-add-node]")) {
    button.addEventListener("click", () => {
      const type = button.dataset.addNode;
      if (isAddableNodeType(type)) {
        controller.addNode(type);
      }
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-context-add-node]")) {
    button.addEventListener("click", () => {
      const type = button.dataset.contextAddNode;
      if (contextMenuPoint !== null && isAddableNodeType(type)) {
        controller.addNodeAt(type, contextMenuPoint);
      }
      hideContextMenu();
    });
  }
}

function setText(key: string, value: string): void {
  const element = document.querySelector<HTMLElement>(`[data-i18n="${key}"]`);
  if (element !== null) {
    element.textContent = value;
  }
}

function setButtonText(nodeType: string, value: string): void {
  const elements = document.querySelectorAll<HTMLButtonElement>(
    `[data-add-node="${nodeType}"], [data-context-add-node="${nodeType}"]`,
  );
  for (const element of elements) {
    element.textContent = value;
  }
}

function createPaletteSection(
  id: string,
  title: string,
  nodeTypes: readonly AddableNodeType[],
  text: Messages,
  variant = "palette",
): string {
  return `
    <section>
      <h2 id="${id}">${title}</h2>
      <div class="node-list">
        ${nodeTypes.map((type) => createNodeButton(type, text, variant)).join("")}
      </div>
    </section>
  `;
}

function createNodeButton(type: AddableNodeType, text: Messages, variant: string): string {
  const label = getNodeButtonLabel(type, text);
  const role = getNodeRole(type);
  const attribute = variant === "context" ? "data-context-add-node" : "data-add-node";
  return `<button class="node-tool node-tool-${role}" type="button" ${attribute}="${type}">${label}</button>`;
}

function getNodeButtonLabel(type: AddableNodeType, text: Messages): string {
  switch (type) {
    case "literal":
      return text.addLiteral;
    case "characterClass":
      return text.addClass;
    case "excludedCharacterClass":
      return text.addExcludedClass;
    case "anyCharacter":
      return text.addAny;
    case "digitCharacter":
      return text.addDigit;
    case "nonDigitCharacter":
      return text.addNonDigit;
    case "wordCharacter":
      return text.addWord;
    case "nonWordCharacter":
      return text.addNonWord;
    case "whitespaceCharacter":
      return text.addWhitespace;
    case "nonWhitespaceCharacter":
      return text.addNonWhitespace;
    case "lineStart":
      return text.addLineStart;
    case "lineEnd":
      return text.addLineEnd;
    case "wordBoundary":
      return text.addWordBoundary;
    case "notWordBoundary":
      return text.addNotWordBoundary;
    case "sequenceThen":
      return text.addThen;
    case "chooseOne":
      return text.addChooseOne;
    case "oneOrMore":
      return text.addOneOrMore;
    case "zeroOrMore":
      return text.addZeroOrMore;
    case "optional":
      return text.addOptional;
    case "exactCount":
      return text.addExactCount;
    case "repeatAtLeast":
      return text.addRepeatAtLeast;
    case "repeatBetween":
      return text.addRepeatBetween;
    case "regexFragment":
      return text.nodes.regexFragment;
  }
}

function isAddableNodeType(value: string | undefined): value is AddableNodeType {
  return [...nounNodeTypes, ...verbNodeTypes].includes(value as AddableNodeType);
}

function getCanvasPoint(
  canvasElement: HTMLCanvasElement,
  event: MouseEvent,
): { x: number; y: number } {
  const rect = canvasElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function hideContextMenu(): void {
  contextMenu.hidden = true;
  contextMenuPoint = null;
}

function query<TElement extends Element>(selector: string): TElement {
  const element = document.querySelector<TElement>(selector);
  if (element === null) {
    throw new Error(`Missing LexiKnot UI element: ${selector}`);
  }

  return element;
}
