import { describe, expect, it } from "vitest";
import { createIdFactory } from "../src/core/id";
import {
  addNode,
  connectFlow,
  createInitialGraph,
  graphToRegex,
  updateNodeData,
} from "../src/topology";

describe("LexiGraph forward projection", () => {
  it("generates a simple literal regex from connected graph nodes", () => {
    const createId = createIdFactory();
    const literalResult = addNode(
      createInitialGraph(),
      { type: "literal", x: 240, y: 160 },
      createId,
    );
    const literal = literalResult.node;
    const graphWithText = updateNodeData(literalResult.graph, literal.id, {
      kind: "literal",
      value: "a.c",
    });
    const connected = connectFlow(
      connectFlow(graphWithText, "start", literal.id),
      literal.id,
      "end",
    );

    expect(graphToRegex(connected)).toBe("a\\.c");
  });

  it("supports character classes and wildcard nodes", () => {
    const createId = createIdFactory();
    const classResult = addNode(
      createInitialGraph(),
      { type: "characterClass", x: 240, y: 160 },
      createId,
    );
    const wildcardResult = addNode(
      classResult.graph,
      { type: "anyCharacter", x: 400, y: 160 },
      createId,
    );
    const graphWithClass = updateNodeData(classResult.graph, classResult.node.id, {
      kind: "characterClass",
      value: "a-z",
    });
    const graphWithWildcard = {
      ...graphWithClass,
      nodes: [...graphWithClass.nodes, wildcardResult.node],
    };
    const connected = connectFlow(
      connectFlow(
        connectFlow(graphWithWildcard, "start", classResult.node.id),
        classResult.node.id,
        wildcardResult.node.id,
      ),
      wildcardResult.node.id,
      "end",
    );

    expect(graphToRegex(connected)).toBe("[a-z].");
  });
});
