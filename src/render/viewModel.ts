import type { Point } from "../core/geometry";
import type { NodeText } from "../i18n";
import type { LexiGraph, LexiNode } from "../topology";

export interface Viewport {
  readonly offset: Point;
  readonly scale: number;
}

export interface RenderState {
  readonly graph: LexiGraph;
  readonly viewport: Viewport;
  readonly selectedNodeId: string | null;
  readonly pendingSourceNodeId: string | null;
  readonly highlightedNodeIds: readonly string[];
  readonly nodeText: NodeText;
}

export interface HitResult {
  readonly kind: "node" | "inputPort" | "outputPort";
  readonly nodeId: string;
}

export const NODE_SIZE = {
  width: 148,
  height: 64,
} as const;

export const ZOOM_LIMITS = {
  min: 0.65,
  max: 2.4,
} as const;

export function getInputPortPosition(node: LexiNode): Point {
  return {
    x: node.position.x,
    y: node.position.y + NODE_SIZE.height / 2,
  };
}

export function getOutputPortPosition(node: LexiNode): Point {
  return {
    x: node.position.x + NODE_SIZE.width,
    y: node.position.y + NODE_SIZE.height / 2,
  };
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.offset.x) / viewport.scale,
    y: (point.y - viewport.offset.y) / viewport.scale,
  };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.scale + viewport.offset.x,
    y: point.y * viewport.scale + viewport.offset.y,
  };
}
