import type { Point } from "../core/geometry";
import { isPointInRect } from "../core/geometry";
import type { LexiGraph } from "../topology";
import {
  getInputPortPosition,
  getOutputPortPosition,
  type HitResult,
  NODE_SIZE,
} from "./viewModel";

const PORT_RADIUS = 9;
const EDGE_HIT_DISTANCE = 8;

export function hitTestGraph(graph: LexiGraph, point: Point): HitResult | null {
  for (const node of [...graph.nodes].reverse()) {
    if (node.inputs.length > 0 && isNear(point, getInputPortPosition(node), PORT_RADIUS)) {
      return { kind: "inputPort", nodeId: node.id };
    }

    if (node.outputs.length > 0 && isNear(point, getOutputPortPosition(node), PORT_RADIUS)) {
      return { kind: "outputPort", nodeId: node.id };
    }

    if (
      isPointInRect(point, {
        x: node.position.x,
        y: node.position.y,
        width: NODE_SIZE.width,
        height: NODE_SIZE.height,
      })
    ) {
      return { kind: "node", nodeId: node.id };
    }
  }

  for (const edge of [...graph.edges].reverse()) {
    const source = graph.nodes.find((node) => node.id === edge.sourceNodeId);
    const target = graph.nodes.find((node) => node.id === edge.targetNodeId);
    if (source === undefined || target === undefined) {
      continue;
    }

    if (
      distanceToSegment(point, getOutputPortPosition(source), getInputPortPosition(target)) <=
      EDGE_HIT_DISTANCE
    ) {
      return { kind: "edge", edgeId: edge.id };
    }
  }

  return null;
}

function isNear(point: Point, center: Point, radius: number): boolean {
  return Math.hypot(point.x - center.x, point.y - center.y) <= radius;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}
