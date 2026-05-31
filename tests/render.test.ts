import { describe, expect, it } from "vitest";
import { createInitialGraph } from "../src/topology";
import { hitTestGraph } from "../src/render/hitTesting";

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
});
