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

  return null;
}

function isNear(point: Point, center: Point, radius: number): boolean {
  return Math.hypot(point.x - center.x, point.y - center.y) <= radius;
}
