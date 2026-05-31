import type { Point } from "../core/geometry";

export type NodeType =
  | "start"
  | "end"
  | "literal"
  | "characterClass"
  | "anyCharacter"
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
