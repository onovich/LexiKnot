import type { Point } from "../core/geometry";

export type NodeType =
  | "start"
  | "end"
  | "literal"
  | "characterClass"
  | "anyCharacter"
  | "digitCharacter"
  | "wordCharacter"
  | "whitespaceCharacter"
  | "lineStart"
  | "lineEnd"
  | "sequenceThen"
  | "oneOrMore"
  | "regexFragment";

export type PortType = "flow" | "data";

export interface Port {
  readonly id: string;
  readonly type: PortType;
}

export interface StartNodeData {
  readonly kind: "start";
}

export interface EndNodeData {
  readonly kind: "end";
}

export interface LiteralNodeData {
  readonly kind: "literal";
  readonly value: string;
}

export interface CharacterClassNodeData {
  readonly kind: "characterClass";
  readonly value: string;
}

export interface AnyCharacterNodeData {
  readonly kind: "anyCharacter";
}

export interface DigitCharacterNodeData {
  readonly kind: "digitCharacter";
}

export interface WordCharacterNodeData {
  readonly kind: "wordCharacter";
}

export interface WhitespaceCharacterNodeData {
  readonly kind: "whitespaceCharacter";
}

export interface LineStartNodeData {
  readonly kind: "lineStart";
}

export interface LineEndNodeData {
  readonly kind: "lineEnd";
}

export interface SequenceThenNodeData {
  readonly kind: "sequenceThen";
}

export interface OneOrMoreNodeData {
  readonly kind: "oneOrMore";
}

export interface RegexFragmentNodeData {
  readonly kind: "regexFragment";
  readonly expression: string;
  readonly label: string;
}

export type NodeData =
  | StartNodeData
  | EndNodeData
  | LiteralNodeData
  | CharacterClassNodeData
  | AnyCharacterNodeData
  | DigitCharacterNodeData
  | WordCharacterNodeData
  | WhitespaceCharacterNodeData
  | LineStartNodeData
  | LineEndNodeData
  | SequenceThenNodeData
  | OneOrMoreNodeData
  | RegexFragmentNodeData;

export interface LexiNode<TData extends NodeData = NodeData> {
  readonly id: string;
  readonly type: NodeType;
  readonly position: Point;
  readonly data: TData;
  readonly inputs: readonly Port[];
  readonly outputs: readonly Port[];
}

export interface LexiEdge {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly sourcePortId: string;
  readonly targetNodeId: string;
  readonly targetPortId: string;
}

export interface LexiGraph {
  readonly nodes: readonly LexiNode[];
  readonly edges: readonly LexiEdge[];
}
