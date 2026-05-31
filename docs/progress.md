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
- Reverse parsing now supports linear literal, character class, wildcard, and fragment fallback nodes.
- Quantifiers, groups, assertions, and alternation are currently preserved as fragment nodes instead of first-class editable structures.
- Match highlighting currently highlights the linear graph path on full-string match.

Continued Phase 2-3 progress:

- Added `regexpp` parser integration in `src/parser`.
- Added `regexToGraph()` to map parsed regex tokens into an auto-spaced graph.
- Added parser, matcher, topology, render, and architecture tests.
- Added UI controls for regex input, parsing, test string evaluation, and match feedback.
