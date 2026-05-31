import type { IdFactory } from "../core/id";
import { parseRegexPattern, type RegexParseResult, type RegexToken } from "../parser/regexParser";
import { escapeLiteral, normalizeCharacterClass } from "../parser/regexEscapes";
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
    targetPort === undefined
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
    case "anyCharacter":
      return { kind: "anyCharacter" };
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
    case "anyCharacter":
      return ".";
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

  parsed.tokens.forEach((token, index) => {
    const node = createNodeFromRegexToken(token, index);
    nodes.push(node);
    edges.push(createFlowEdge(previousNodeId, node.id));
    previousNodeId = node.id;
  });

  const endX = 240 + parsed.tokens.length * 168;
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
    case "anyCharacter":
      return {
        id: `anyCharacter-${index + 1}`,
        type: "anyCharacter",
        position,
        data: { kind: "anyCharacter" },
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

function createFlowEdge(sourceNodeId: string, targetNodeId: string): LexiEdge {
  return {
    id: `${sourceNodeId}-to-${targetNodeId}`,
    sourceNodeId,
    sourcePortId: "out",
    targetNodeId,
    targetPortId: "in",
  };
}
