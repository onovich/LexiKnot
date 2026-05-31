# LexiKnot Progress

## 2026-05-31

Completed Phase 0-1 foundation:

- Created Vite + strict TypeScript scaffold.
- Added lint, typecheck, build, test, format, and validate scripts.
- Implemented core graph model and simple forward regex generation.
- Added Canvas 2D rendering, grid, pan, zoom, node dragging, flow ports, and live regex output.
- Added architecture boundary tests for parser, topology, and render layers.
- Documented commands and architecture in README.

Current MVP limitations:

- Regex generation follows one linear flow path from `start`.
- Node insertion is toolbar-driven; connecting is done by selecting an output port then an input port.
- Reverse parsing, auto layout, quantifiers, groups, and match-path highlighting are reserved for later phases.
