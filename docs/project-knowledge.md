# LexiKnot Project Knowledge

Source mirror: [LexiKnot Project Brief](./LexiKnot-project-brief.md)

## Product Positioning

LexiKnot is a bidirectional regex visualization engine built around an infinite canvas and node graph. It should support both forward construction from canvas nodes to a regex string, and reverse parsing from an existing regex string to a readable node flow.

The project is intended as lightweight infrastructure for the author's tool matrix, including batch rename tooling, game-engine logic modules, and graphical DSL workflows that reduce cross-role communication cost.

## Technical Direction

- Core stack: Vanilla TypeScript, Vite, Rollup, and Native Canvas 2D by default.
- Rendering should stay framework-agnostic and embeddable, with future outputs for ESM and IIFE/Web Component usage.
- Reverse parsing should rely on an established regex AST parser such as `regexpp` or `ret.js`, rather than a handwritten tokenizer.
- Auto layout should use `dagre` or `elkjs` when turning AST data into graph positions.

## Architecture Boundaries

Keep strict separation between data and view:

- `src/core`: pure utilities, math, event bus, and shared primitives.
- `src/parser`: regex string and AST conversion only. No canvas, DOM, coordinates, or node layout concepts.
- `src/topology`: graph, node, edge data structures and AST-to-graph mapping. No Canvas or DOM imports.
- `src/render`: Canvas drawing, coordinate transforms, pointer/touch interaction, and visual state rendering.
- `src/io`: public API and Web Component wrapper.

Dependency direction should remain one-way: `io/app -> render -> topology -> parser -> core`.

Lower layers must not import higher layers. Use callbacks or events when lower layers need to notify upper layers.

## Data Model Notes

Primary concepts from the source document:

- `LexiNode`: id, node type, position, typed data payload, inputs, and outputs.
- `Port`: id plus `flow` or `data` type.
- `LexiEdge`: source and target node/port references.
- `LexiGraph`: nodes and edges as the canvas-independent topology model.

Avoid `any` in TypeScript. Use precise types, generics, or `unknown` with narrowing.

## Roadmap

Phase 1: MVP canvas and forward generation.

- Create a TypeScript + Vite project.
- Build infinite canvas interactions: zoom, pan, grid background.
- Draw basic nodes: start, text/literal, character class, any-character.
- Implement node connection rendering and port snapping.
- Generate simple valid regex strings from connected canvas graphs.

Phase 2: reverse engineering.

- Add `regexpp` parsing for common regex expressions.
- Map AST nodes into `LexiGraph`.
- Add `dagre` or equivalent auto layout.
- Add a live testing panel that highlights matched paths in the graph.

Phase 3: packaging and matrix integration.

- Package as a standard Web Component, likely `<lexi-knot>`.
- Add advanced regex nodes such as zero-width assertions, non-capturing groups, greediness/laziness toggles.
- Integrate with the batch rename tool.
- Support light/dark themes and crisp Retina canvas rendering.

Phase 4: generalized logic engine.

- Decouple the Canvas node engine from regex-specific logic.
- Integrate as a game-engine submodule for state-machine node configuration.
- Add a custom node registration API.

## Coding Guardrails

- Use strict TypeScript.
- Prefer immutable updates for graph and AST data to make undo/redo practical.
- Keep core parser and topology algorithms pure where possible.
- Use PascalCase for types/classes, camelCase verb-object names for functions, `is/has/should/can` prefixes for booleans, and UPPER_SNAKE_CASE for constants.
- Do not put regex parsing logic under `src/render`.
- Do not put screen coordinates or canvas dimensions under `src/parser`.
