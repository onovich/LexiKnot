import type { Point } from "../core/geometry";

export type NodeType =
  | "start"
  | "end"
  | "literal"
  | "characterClass"
  | "excludedCharacterClass"
  | "anyCharacter"
  | "digitCharacter"
  | "nonDigitCharacter"
  | "wordCharacter"
  | "nonWordCharacter"
  | "whitespaceCharacter"
  | "nonWhitespaceCharacter"
  | "lineStart"
  | "lineEnd"
  | "wordBoundary"
  | "notWordBoundary"
  | "sequenceThen"
  | "chooseOne"
  | "oneOrMore"
  | "zeroOrMore"
  | "optional"
  | "exactCount"
  | "repeatAtLeast"
  | "repeatBetween"
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

export interface ExcludedCharacterClassNodeData {
  readonly kind: "excludedCharacterClass";
  readonly value: string;
}

export interface AnyCharacterNodeData {
  readonly kind: "anyCharacter";
}

export interface DigitCharacterNodeData {
  readonly kind: "digitCharacter";
}

export interface NonDigitCharacterNodeData {
  readonly kind: "nonDigitCharacter";
}

export interface WordCharacterNodeData {
  readonly kind: "wordCharacter";
}

export interface NonWordCharacterNodeData {
  readonly kind: "nonWordCharacter";
}

export interface WhitespaceCharacterNodeData {
  readonly kind: "whitespaceCharacter";
}

export interface NonWhitespaceCharacterNodeData {
  readonly kind: "nonWhitespaceCharacter";
}

export interface LineStartNodeData {
  readonly kind: "lineStart";
}

export interface LineEndNodeData {
  readonly kind: "lineEnd";
}

export interface WordBoundaryNodeData {
  readonly kind: "wordBoundary";
}

export interface NotWordBoundaryNodeData {
  readonly kind: "notWordBoundary";
}

export interface SequenceThenNodeData {
  readonly kind: "sequenceThen";
}

export interface ChooseOneNodeData {
  readonly kind: "chooseOne";
}

export interface OneOrMoreNodeData {
  readonly kind: "oneOrMore";
}

export interface ZeroOrMoreNodeData {
  readonly kind: "zeroOrMore";
}

export interface OptionalNodeData {
  readonly kind: "optional";
}

export interface ExactCountNodeData {
  readonly kind: "exactCount";
  readonly count: string;
}

export interface RepeatAtLeastNodeData {
  readonly kind: "repeatAtLeast";
  readonly min: string;
}

export interface RepeatBetweenNodeData {
  readonly kind: "repeatBetween";
  readonly min: string;
  readonly max: string;
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
  | ExcludedCharacterClassNodeData
  | AnyCharacterNodeData
  | DigitCharacterNodeData
  | NonDigitCharacterNodeData
  | WordCharacterNodeData
  | NonWordCharacterNodeData
  | WhitespaceCharacterNodeData
  | NonWhitespaceCharacterNodeData
  | LineStartNodeData
  | LineEndNodeData
  | WordBoundaryNodeData
  | NotWordBoundaryNodeData
  | SequenceThenNodeData
  | ChooseOneNodeData
  | OneOrMoreNodeData
  | ZeroOrMoreNodeData
  | OptionalNodeData
  | ExactCountNodeData
  | RepeatAtLeastNodeData
  | RepeatBetweenNodeData
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
