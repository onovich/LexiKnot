import type { Point } from "../core/geometry";
import {
  getEdgeMeaning,
  getNodeRole,
  type EdgeMeaning,
  type LexiGraph,
  type LexiNode,
} from "../topology";
import {
  getInputPortPosition,
  getOutputPortPosition,
  NODE_SIZE,
  type RenderState,
  worldToScreen,
} from "./viewModel";

const GRID_SIZE = 32;
const PORT_RADIUS = 6;
const NODE_RADIUS = 8;

const NODE_COLORS = {
  system: "#64748b",
  noun: "#2563eb",
  verb: "#d97706",
} as const;

const NODE_FILLS = {
  system: "#f8fafc",
  noun: "#eff6ff",
  verb: "#fff7ed",
} as const;

const EDGE_COLORS: Record<EdgeMeaning, string> = {
  entry: "#64748b",
  subject: "#2563eb",
  object: "#7c3aed",
  exit: "#be123c",
};

export function renderCanvas(canvas: HTMLCanvasElement, state: RenderState): void {
  const context = canvas.getContext("2d");
  if (context === null) {
    return;
  }

  resizeCanvasToDisplaySize(canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(context, canvas, state.viewport);
  drawEdges(context, state.graph, state);
  drawConnectionPreview(context, state.graph, state);
  drawNodes(context, state.graph, state);
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
  const ratio = window.devicePixelRatio || 1;
  const nextWidth = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const nextHeight = Math.max(1, Math.floor(canvas.clientHeight * ratio));

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }
}

function drawGrid(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  viewport: RenderState["viewport"],
): void {
  const ratio = window.devicePixelRatio || 1;
  const spacing = GRID_SIZE * viewport.scale * ratio;
  const offsetX = (viewport.offset.x * ratio) % spacing;
  const offsetY = (viewport.offset.y * ratio) % spacing;

  context.save();
  context.strokeStyle = "#d9e1ea";
  context.lineWidth = 1;

  for (let x = offsetX; x < canvas.width; x += spacing) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let y = offsetY; y < canvas.height; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.restore();
}

function drawEdges(context: CanvasRenderingContext2D, graph: LexiGraph, state: RenderState): void {
  for (const edge of graph.edges) {
    const source = graph.nodes.find((node) => node.id === edge.sourceNodeId);
    const target = graph.nodes.find((node) => node.id === edge.targetNodeId);

    if (source === undefined || target === undefined) {
      continue;
    }

    drawBezierEdge(
      context,
      getOutputPortPosition(source),
      getInputPortPosition(target),
      state,
      EDGE_COLORS[getEdgeMeaning(graph, edge)],
      state.selectedEdgeId === edge.id,
    );
  }

  if (state.pendingSourceNodeId !== null) {
    const source = graph.nodes.find((node) => node.id === state.pendingSourceNodeId);
    if (source !== undefined) {
      drawPortHalo(context, getOutputPortPosition(source), state, NODE_COLORS.verb);
    }
  }
}

function drawConnectionPreview(
  context: CanvasRenderingContext2D,
  graph: LexiGraph,
  state: RenderState,
): void {
  if (state.connectionPreview === null) {
    return;
  }

  const source = graph.nodes.find((node) => node.id === state.connectionPreview?.sourceNodeId);
  if (source === undefined) {
    return;
  }

  drawBezierEdge(
    context,
    getOutputPortPosition(source),
    state.connectionPreview.target,
    state,
    NODE_COLORS.verb,
    false,
    true,
  );
}

function drawNodes(context: CanvasRenderingContext2D, graph: LexiGraph, state: RenderState): void {
  for (const node of graph.nodes) {
    drawNode(context, node, state);
  }
}

function drawNode(context: CanvasRenderingContext2D, node: LexiNode, state: RenderState): void {
  const ratio = window.devicePixelRatio || 1;
  const position = worldToScreen(node.position, state.viewport);
  const width = NODE_SIZE.width * state.viewport.scale * ratio;
  const height = NODE_SIZE.height * state.viewport.scale * ratio;
  const x = position.x * ratio;
  const y = position.y * ratio;
  const isSelected = state.selectedNodeId === node.id;
  const isHighlighted = state.highlightedNodeIds.includes(node.id);
  const zoom = state.viewport.scale;
  const role = getNodeRole(node.type);
  const accentColor = NODE_COLORS[role];

  context.save();
  context.fillStyle = isHighlighted ? "#edf7ed" : NODE_FILLS[role];
  context.strokeStyle = isSelected ? accentColor : "#b9c2cf";
  context.lineWidth = (isSelected ? 2 : 1) * ratio * zoom;
  context.beginPath();
  context.roundRect(x, y, width, height, NODE_RADIUS * ratio * zoom);
  context.fill();
  context.stroke();

  context.fillStyle = accentColor;
  context.fillRect(x, y, 5 * ratio * zoom, height);

  context.fillStyle = "#111827";
  context.font = `${13 * ratio * zoom}px Inter, Segoe UI, sans-serif`;
  context.textBaseline = "top";
  drawFittedText(
    context,
    getNodeTitle(node, state.nodeText),
    x + 16 * ratio * zoom,
    y + 12 * ratio * zoom,
    (NODE_SIZE.width - 28) * ratio * zoom,
  );

  context.fillStyle = "#667085";
  context.font = `${12 * ratio * zoom}px Inter, Segoe UI, sans-serif`;
  drawFittedText(
    context,
    getNodeSubtitle(node, state.nodeText),
    x + 16 * ratio * zoom,
    y + 34 * ratio * zoom,
    (NODE_SIZE.width - 28) * ratio * zoom,
  );

  if (node.inputs.length > 0) {
    drawPort(context, getInputPortPosition(node), state, "#ffffff", accentColor);
  }

  if (node.outputs.length > 0) {
    drawPort(context, getOutputPortPosition(node), state, accentColor, "#ffffff");
  }

  context.restore();
}

function drawBezierEdge(
  context: CanvasRenderingContext2D,
  source: Point,
  target: Point,
  state: RenderState,
  color: string,
  isSelected = false,
  isDashed = false,
): void {
  const ratio = window.devicePixelRatio || 1;
  const start = worldToScreen(source, state.viewport);
  const end = worldToScreen(target, state.viewport);
  const curve = Math.max(48 * state.viewport.scale, Math.abs(end.x - start.x) * 0.45);

  context.save();
  context.strokeStyle = color;
  context.lineWidth = (isSelected ? 4 : 2) * ratio * state.viewport.scale;
  if (isDashed) {
    context.setLineDash([8 * ratio * state.viewport.scale, 6 * ratio * state.viewport.scale]);
  }
  context.beginPath();
  context.moveTo(start.x * ratio, start.y * ratio);
  context.bezierCurveTo(
    (start.x + curve) * ratio,
    start.y * ratio,
    (end.x - curve) * ratio,
    end.y * ratio,
    end.x * ratio,
    end.y * ratio,
  );
  context.stroke();
  context.restore();
}

function drawPort(
  context: CanvasRenderingContext2D,
  point: Point,
  state: RenderState,
  fill: string,
  stroke: string,
): void {
  const ratio = window.devicePixelRatio || 1;
  const screen = worldToScreen(point, state.viewport);

  context.save();
  context.fillStyle = fill;
  context.strokeStyle = stroke;
  context.lineWidth = 2 * ratio * state.viewport.scale;
  context.beginPath();
  context.arc(
    screen.x * ratio,
    screen.y * ratio,
    PORT_RADIUS * ratio * state.viewport.scale,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.stroke();
  context.restore();
}

function drawPortHalo(
  context: CanvasRenderingContext2D,
  point: Point,
  state: RenderState,
  color: string,
): void {
  const ratio = window.devicePixelRatio || 1;
  const screen = worldToScreen(point, state.viewport);

  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2 * ratio * state.viewport.scale;
  context.beginPath();
  context.arc(
    screen.x * ratio,
    screen.y * ratio,
    13 * ratio * state.viewport.scale,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.restore();
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
): void {
  if (context.measureText(text).width <= maxWidth) {
    context.fillText(text, x, y);
    return;
  }

  const ellipsis = "...";
  let fitted = text;

  while (fitted.length > 0 && context.measureText(`${fitted}${ellipsis}`).width > maxWidth) {
    fitted = fitted.slice(0, -1);
  }

  context.fillText(fitted.length > 0 ? `${fitted}${ellipsis}` : ellipsis, x, y);
}

function getNodeTitle(node: LexiNode, text: RenderState["nodeText"]): string {
  switch (node.type) {
    case "start":
      return text.start;
    case "end":
      return text.end;
    case "literal":
      return text.literal;
    case "characterClass":
      return text.characterClass;
    case "anyCharacter":
      return text.anyCharacter;
    case "digitCharacter":
      return text.digitCharacter;
    case "wordCharacter":
      return text.wordCharacter;
    case "whitespaceCharacter":
      return text.whitespaceCharacter;
    case "lineStart":
      return text.lineStart;
    case "lineEnd":
      return text.lineEnd;
    case "sequenceThen":
      return text.sequenceThen;
    case "oneOrMore":
      return text.oneOrMore;
    case "regexFragment":
      return text.regexFragment;
  }
}

function getNodeSubtitle(node: LexiNode, text: RenderState["nodeText"]): string {
  switch (node.data.kind) {
    case "literal":
      return node.data.value;
    case "characterClass":
      return `[${node.data.value}]`;
    case "anyCharacter":
      return ".";
    case "digitCharacter":
      return "\\d";
    case "wordCharacter":
      return "\\w";
    case "whitespaceCharacter":
      return "\\s";
    case "lineStart":
      return "^";
    case "lineEnd":
      return "$";
    case "sequenceThen":
      return "then";
    case "oneOrMore":
      return "+";
    case "regexFragment":
      return node.data.expression;
    case "start":
      return text.flowEntry;
    case "end":
      return text.flowExit;
  }
}
