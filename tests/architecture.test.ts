import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const layerRules = [
  {
    file: "src/parser/regexParser.ts",
    forbidden: ["../topology", "../render", "../io", "canvas", "document", "window"],
  },
  {
    file: "src/parser/regexEscapes.ts",
    forbidden: ["../topology", "../render", "../io", "canvas", "document", "window"],
  },
  {
    file: "src/topology/graph.ts",
    forbidden: ["../render", "../io", "canvas", "document", "window"],
  },
  {
    file: "src/render/canvasRenderer.ts",
    forbidden: ["../parser", "../io"],
  },
];

describe("architecture boundaries", () => {
  it.each(layerRules)("keeps $file inside its dependency boundary", ({ file, forbidden }) => {
    const absolutePath = resolve(projectRoot, file);
    const source = readFileSync(absolutePath, "utf8");
    const violations = forbidden.filter((token) => source.includes(token));

    expect(
      violations,
      `${relative(projectRoot, absolutePath)} imports or references ${violations.join(", ")}`,
    ).toEqual([]);
  });
});
