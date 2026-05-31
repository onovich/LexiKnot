import { describe, expect, it } from "vitest";
import { createInitialGraph } from "../src/topology";
import { hitTestGraph } from "../src/render/hitTesting";
import { ZOOM_LIMITS } from "../src/render/viewModel";

describe("render hit testing", () => {
  it("detects nodes and ports without mutating graph state", () => {
    const graph = createInitialGraph();

    expect(hitTestGraph(graph, { x: 100, y: 180 })).toEqual({
      kind: "node",
      nodeId: "start",
    });
    expect(hitTestGraph(graph, { x: 228, y: 192 })).toEqual({
      kind: "outputPort",
      nodeId: "start",
    });
  });

  it("keeps the minimum zoom readable enough for node text", () => {
    expect(ZOOM_LIMITS.min).toBeGreaterThanOrEqual(0.65);
    expect(ZOOM_LIMITS.max).toBeGreaterThan(ZOOM_LIMITS.min);
  });
});
