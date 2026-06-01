import type { IdFactory } from "../core/id";
import { parseRegexPattern, type RegexParseResult, type RegexToken } from "../parser/regexParser";
import {
  escapeLiteral,
  normalizeCharacterClass,
  normalizeExcludedCharacterClass,
} from "../parser/regexEscapes";
import { canConnectNodeTypes } from "./semantics";
import type { LexiEdge, LexiGraph, LexiNode, NodeData, NodeType, Port } from "./types";

const FLOW_INPUT: Port = { id: "in", type: "flow" };
const FLOW_OUTPUT: Port = { id: "out", type: "flow" };

export interface AddNodeRequest {
  readonly type: Exclude<NodeType, "start" | "end">;
  readonly x: number;
  readonly y: number;
}

export interface AddNodeResult {
  readonly graph: LexiGraph;
  readonly node: LexiNode;
}

export interface RegexToGraphSuccess {
  readonly ok: true;
  readonly graph: LexiGraph;
  readonly warnings: readonly string[];
}

export interface RegexToGraphFailure {
  readonly ok: false;
  readonly error: string;
}

export type RegexToGraphResult = RegexToGraphSuccess | RegexToGraphFailure;

export function createInitialGraph(): LexiGraph {
  return {
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 80, y: 160 },
        data: { kind: "start" },
        inputs: [],
        outputs: [FLOW_OUTPUT],
      },
      {
        id: "end",
        type: "end",
        position: { x: 620, y: 160 },
        data: { kind: "end" },
        inputs: [FLOW_INPUT],
        outputs: [],
      },
    ],
    edges: [],
  };
}

export function regexToGraph(pattern: string): RegexToGraphResult {
  const parsed = parseRegexPattern(pattern);
  if (!parsed.ok) {
    return parsed;
  }

  return {
    ok: true,
    graph: createGraphFromRegexTokens(parsed),
    warnings: parsed.warnings,
  };
}

export function addNode(
  graph: LexiGraph,
  request: AddNodeRequest,
  createId: IdFactory,
): AddNodeResult {
  const node = createNode(request, createId);
  return {
    graph: {
      ...graph,
      nodes: [...graph.nodes, node],
    },
    node,
  };
}

export function updateNodePosition(
  graph: LexiGraph,
  nodeId: string,
  x: number,
  y: number,
): LexiGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => (node.id === nodeId ? { ...node, position: { x, y } } : node)),
  };
}

export function updateNodeData(graph: LexiGraph, nodeId: string, data: NodeData): LexiGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => (node.id === nodeId ? { ...node, data } : node)),
  };
}

export function deleteNode(graph: LexiGraph, nodeId: string): LexiGraph {
  if (nodeId === "start" || nodeId === "end") {
    return graph;
  }

  return {
    nodes: graph.nodes.filter((node) => node.id !== nodeId),
    edges: graph.edges.filter(
      (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId,
    ),
  };
}

export function connectFlow(
  graph: LexiGraph,
  sourceNodeId: string,
  targetNodeId: string,
): LexiGraph {
  if (sourceNodeId === targetNodeId) {
    return graph;
  }

  const source = findNode(graph, sourceNodeId);
  const target = findNode(graph, targetNodeId);
  const sourcePort = source?.outputs.find((port) => port.type === "flow");
  const targetPort = target?.inputs.find((port) => port.type === "flow");

  if (
    source === undefined ||
    target === undefined ||
    sourcePort === undefined ||
    targetPort === undefined ||
    !canConnectNodeTypes(source.type, target.type)
  ) {
    return graph;
  }

  const nextEdges = graph.edges.filter(
    (edge) => edge.sourceNodeId !== sourceNodeId && edge.targetNodeId !== targetNodeId,
  );

  const edge: LexiEdge = {
    id: `${sourceNodeId}-to-${targetNodeId}`,
    sourceNodeId,
    sourcePortId: sourcePort.id,
    targetNodeId,
    targetPortId: targetPort.id,
  };

  return {
    ...graph,
    edges: [...nextEdges, edge],
  };
}

export function graphToRegex(graph: LexiGraph): string {
  const visited = new Set<string>();
  const segments: string[] = [];
  let current = findNode(graph, "start");

  while (current !== undefined && !visited.has(current.id)) {
    visited.add(current.id);

    if (current.type !== "start" && current.type !== "end") {
      segments.push(nodeToRegexSegment(current));
    }

    const nextEdge = graph.edges.find((edge) => edge.sourceNodeId === current?.id);
    current = nextEdge === undefined ? undefined : findNode(graph, nextEdge.targetNodeId);
  }

  return segments.join("");
}

export function getLinearFlowNodeIds(graph: LexiGraph): readonly string[] {
  const visited = new Set<string>();
  const ids: string[] = [];
  let current = findNode(graph, "start");

  while (current !== undefined && !visited.has(current.id)) {
    visited.add(current.id);
    ids.push(current.id);

    const nextEdge = graph.edges.find((edge) => edge.sourceNodeId === current?.id);
    current = nextEdge === undefined ? undefined : findNode(graph, nextEdge.targetNodeId);
  }

  return ids;
}

export function findNode(graph: LexiGraph, nodeId: string): LexiNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

function createNode(request: AddNodeRequest, createId: IdFactory): LexiNode {
  const id = createId(request.type);
  return {
    id,
    type: request.type,
    position: { x: request.x, y: request.y },
    data: createDefaultData(request.type),
    inputs: [FLOW_INPUT],
    outputs: [FLOW_OUTPUT],
  };
}

function createDefaultData(type: AddNodeRequest["type"]): NodeData {
  switch (type) {
    case "literal":
      return { kind: "literal", value: "text" };
    case "characterClass":
      return { kind: "characterClass", value: "a-z" };
    case "excludedCharacterClass":
      return { kind: "excludedCharacterClass", value: "0-9" };
    case "anyCharacter":
      return { kind: "anyCharacter" };
    case "digitCharacter":
      return { kind: "digitCharacter" };
    case "nonDigitCharacter":
      return { kind: "nonDigitCharacter" };
    case "wordCharacter":
      return { kind: "wordCharacter" };
    case "nonWordCharacter":
      return { kind: "nonWordCharacter" };
    case "whitespaceCharacter":
      return { kind: "whitespaceCharacter" };
    case "nonWhitespaceCharacter":
      return { kind: "nonWhitespaceCharacter" };
    case "lineStart":
      return { kind: "lineStart" };
    case "lineEnd":
      return { kind: "lineEnd" };
    case "wordBoundary":
      return { kind: "wordBoundary" };
    case "notWordBoundary":
      return { kind: "notWordBoundary" };
    case "sequenceThen":
      return { kind: "sequenceThen" };
    case "chooseOne":
      return { kind: "chooseOne" };
    case "oneOrMore":
      return { kind: "oneOrMore" };
    case "zeroOrMore":
      return { kind: "zeroOrMore" };
    case "optional":
      return { kind: "optional" };
    case "exactCount":
      return { kind: "exactCount", count: "3" };
    case "repeatAtLeast":
      return { kind: "repeatAtLeast", min: "2" };
    case "repeatBetween":
      return { kind: "repeatBetween", min: "2", max: "5" };
    case "regexFragment":
      return { kind: "regexFragment", expression: "", label: "Fragment" };
  }
}

function nodeToRegexSegment(node: LexiNode): string {
  switch (node.data.kind) {
    case "literal":
      return escapeLiteral(node.data.value);
    case "characterClass":
      return normalizeCharacterClass(node.data.value);
    case "excludedCharacterClass":
      return normalizeExcludedCharacterClass(node.data.value);
    case "anyCharacter":
      return ".";
    case "digitCharacter":
      return "\\d";
    case "nonDigitCharacter":
      return "\\D";
    case "wordCharacter":
      return "\\w";
    case "nonWordCharacter":
      return "\\W";
    case "whitespaceCharacter":
      return "\\s";
    case "nonWhitespaceCharacter":
      return "\\S";
    case "lineStart":
      return "^";
    case "lineEnd":
      return "$";
    case "wordBoundary":
      return "\\b";
    case "notWordBoundary":
      return "\\B";
    case "sequenceThen":
      return "";
    case "chooseOne":
      return "|";
    case "oneOrMore":
      return "+";
    case "zeroOrMore":
      return "*";
    case "optional":
      return "?";
    case "exactCount":
      return `{${normalizeCount(node.data.count)}}`;
    case "repeatAtLeast":
      return `{${normalizeCount(node.data.min)},}`;
    case "repeatBetween":
      return `{${normalizeCount(node.data.min)},${normalizeMaxCount(
        node.data.min,
        node.data.max,
      )}}`;
    case "regexFragment":
      return node.data.expression;
    case "start":
    case "end":
      return "";
  }
}

function createGraphFromRegexTokens(parsed: Extract<RegexParseResult, { ok: true }>): LexiGraph {
  const nodes: LexiNode[] = [
    {
      id: "start",
      type: "start",
      position: { x: 80, y: 160 },
      data: { kind: "start" },
      inputs: [],
      outputs: [FLOW_OUTPUT],
    },
  ];
  const edges: LexiEdge[] = [];
  let previousNodeId = "start";

  const tokens = insertSequenceOperators(parsed.tokens);

  tokens.forEach((token, index) => {
    const node = createNodeFromRegexToken(token, index);
    nodes.push(node);
    edges.push(createFlowEdge(previousNodeId, node.id));
    previousNodeId = node.id;
  });

  const endX = 240 + tokens.length * 168;
  nodes.push({
    id: "end",
    type: "end",
    position: { x: endX, y: 160 },
    data: { kind: "end" },
    inputs: [FLOW_INPUT],
    outputs: [],
  });
  edges.push(createFlowEdge(previousNodeId, "end"));

  return { nodes, edges };
}

function createNodeFromRegexToken(token: RegexToken, index: number): LexiNode {
  const position = { x: 240 + index * 168, y: 160 };

  switch (token.kind) {
    case "literal":
      return {
        id: `literal-${index + 1}`,
        type: "literal",
        position,
        data: { kind: "literal", value: token.value },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "characterClass":
      return {
        id: `characterClass-${index + 1}`,
        type: "characterClass",
        position,
        data: { kind: "characterClass", value: token.value },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "excludedCharacterClass":
      return {
        id: `excludedCharacterClass-${index + 1}`,
        type: "excludedCharacterClass",
        position,
        data: { kind: "excludedCharacterClass", value: token.value },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "anyCharacter":
      return {
        id: `anyCharacter-${index + 1}`,
        type: "anyCharacter",
        position,
        data: { kind: "anyCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "digitCharacter":
      return {
        id: `digitCharacter-${index + 1}`,
        type: "digitCharacter",
        position,
        data: { kind: "digitCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "nonDigitCharacter":
      return {
        id: `nonDigitCharacter-${index + 1}`,
        type: "nonDigitCharacter",
        position,
        data: { kind: "nonDigitCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "wordCharacter":
      return {
        id: `wordCharacter-${index + 1}`,
        type: "wordCharacter",
        position,
        data: { kind: "wordCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "nonWordCharacter":
      return {
        id: `nonWordCharacter-${index + 1}`,
        type: "nonWordCharacter",
        position,
        data: { kind: "nonWordCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "whitespaceCharacter":
      return {
        id: `whitespaceCharacter-${index + 1}`,
        type: "whitespaceCharacter",
        position,
        data: { kind: "whitespaceCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "nonWhitespaceCharacter":
      return {
        id: `nonWhitespaceCharacter-${index + 1}`,
        type: "nonWhitespaceCharacter",
        position,
        data: { kind: "nonWhitespaceCharacter" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "lineStart":
      return {
        id: `lineStart-${index + 1}`,
        type: "lineStart",
        position,
        data: { kind: "lineStart" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "lineEnd":
      return {
        id: `lineEnd-${index + 1}`,
        type: "lineEnd",
        position,
        data: { kind: "lineEnd" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "wordBoundary":
      return {
        id: `wordBoundary-${index + 1}`,
        type: "wordBoundary",
        position,
        data: { kind: "wordBoundary" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "notWordBoundary":
      return {
        id: `notWordBoundary-${index + 1}`,
        type: "notWordBoundary",
        position,
        data: { kind: "notWordBoundary" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "sequenceThen":
      return {
        id: `sequenceThen-${index + 1}`,
        type: "sequenceThen",
        position,
        data: { kind: "sequenceThen" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "chooseOne":
      return {
        id: `chooseOne-${index + 1}`,
        type: "chooseOne",
        position,
        data: { kind: "chooseOne" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "oneOrMore":
      return {
        id: `oneOrMore-${index + 1}`,
        type: "oneOrMore",
        position,
        data: { kind: "oneOrMore" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "zeroOrMore":
      return {
        id: `zeroOrMore-${index + 1}`,
        type: "zeroOrMore",
        position,
        data: { kind: "zeroOrMore" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "optional":
      return {
        id: `optional-${index + 1}`,
        type: "optional",
        position,
        data: { kind: "optional" },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "exactCount":
      return {
        id: `exactCount-${index + 1}`,
        type: "exactCount",
        position,
        data: { kind: "exactCount", count: token.count },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "repeatAtLeast":
      return {
        id: `repeatAtLeast-${index + 1}`,
        type: "repeatAtLeast",
        position,
        data: { kind: "repeatAtLeast", min: token.min },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "repeatBetween":
      return {
        id: `repeatBetween-${index + 1}`,
        type: "repeatBetween",
        position,
        data: { kind: "repeatBetween", min: token.min, max: token.max },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
    case "regexFragment":
      return {
        id: `regexFragment-${index + 1}`,
        type: "regexFragment",
        position,
        data: {
          kind: "regexFragment",
          expression: token.expression,
          label: token.label,
        },
        inputs: [FLOW_INPUT],
        outputs: [FLOW_OUTPUT],
      };
  }
}

function insertSequenceOperators(tokens: readonly RegexToken[]): readonly RegexToken[] {
  const nextTokens: RegexToken[] = [];

  tokens.forEach((token) => {
    const previous = nextTokens.at(-1);
    if (previous !== undefined && needsSequenceOperator(previous, token)) {
      nextTokens.push({ kind: "sequenceThen", raw: "" });
    }

    nextTokens.push(token);
  });

  return nextTokens;
}

function needsSequenceOperator(previous: RegexToken, next: RegexToken): boolean {
  return isNounToken(previous) && isNounToken(next);
}

function isNounToken(token: RegexToken): boolean {
  switch (token.kind) {
    case "literal":
    case "characterClass":
    case "excludedCharacterClass":
    case "anyCharacter":
    case "digitCharacter":
    case "nonDigitCharacter":
    case "wordCharacter":
    case "nonWordCharacter":
    case "whitespaceCharacter":
    case "nonWhitespaceCharacter":
    case "lineStart":
    case "lineEnd":
    case "wordBoundary":
    case "notWordBoundary":
    case "regexFragment":
      return true;
    case "sequenceThen":
    case "chooseOne":
    case "oneOrMore":
    case "zeroOrMore":
    case "optional":
    case "exactCount":
    case "repeatAtLeast":
    case "repeatBetween":
      return false;
  }
}

function normalizeCount(count: string): string {
  const parsed = Number.parseInt(count, 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "1";
}

function normalizeMaxCount(min: string, max: string): string {
  const normalizedMin = Number.parseInt(normalizeCount(min), 10);
  const parsedMax = Number.parseInt(max, 10);
  return Number.isFinite(parsedMax) && parsedMax >= normalizedMin
    ? String(parsedMax)
    : String(normalizedMin);
}

function createFlowEdge(sourceNodeId: string, targetNodeId: string): LexiEdge {
  return {
    id: `${sourceNodeId}-to-${targetNodeId}`,
    sourceNodeId,
    sourcePortId: "out",
    targetNodeId,
    targetPortId: "in",
  };
}
