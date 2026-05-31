import type { IdFactory } from "../core/id";
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
    case "start":
    case "end":
      return "";
  }
}
