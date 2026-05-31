import type { LexiEdge, LexiGraph, NodeType } from "./types";

export type NodeRole = "system" | "noun" | "verb";
export type EdgeMeaning = "entry" | "subject" | "object" | "exit";

export function getNodeRole(type: NodeType): NodeRole {
  switch (type) {
    case "start":
    case "end":
      return "system";
    case "sequenceThen":
    case "oneOrMore":
      return "verb";
    case "literal":
    case "characterClass":
    case "anyCharacter":
    case "digitCharacter":
    case "wordCharacter":
    case "whitespaceCharacter":
    case "lineStart":
    case "lineEnd":
    case "regexFragment":
      return "noun";
  }
}

export function canConnectNodeTypes(sourceType: NodeType, targetType: NodeType): boolean {
  if (sourceType === targetType || sourceType === "end" || targetType === "start") {
    return false;
  }

  const sourceRole = getNodeRole(sourceType);
  const targetRole = getNodeRole(targetType);

  if (sourceType === "start") {
    return targetRole === "noun" || targetType === "end";
  }

  if (targetType === "end") {
    return sourceRole === "noun" || sourceRole === "verb";
  }

  if (sourceRole === "noun") {
    return targetRole === "verb";
  }

  if (sourceRole === "verb") {
    return targetRole === "noun";
  }

  return false;
}

export function getEdgeMeaning(graph: LexiGraph, edge: LexiEdge): EdgeMeaning {
  const source = graph.nodes.find((node) => node.id === edge.sourceNodeId);
  const target = graph.nodes.find((node) => node.id === edge.targetNodeId);

  if (source?.type === "start") {
    return "entry";
  }

  if (target?.type === "end") {
    return "exit";
  }

  if (source !== undefined && getNodeRole(source.type) === "noun") {
    return "subject";
  }

  return "object";
}
