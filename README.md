# LexiKnot

LexiKnot is a lightweight TypeScript engine for bidirectional regex visualization on an infinite Canvas 2D node graph.

Phase 0-1 currently includes:

- Vite + strict TypeScript project setup.
- Layered source directories: `core`, `parser`, `topology`, `render`, and `io`.
- Immutable `LexiGraph` helpers for adding nodes, moving nodes, connecting flow ports, and generating simple regex output.
- Canvas MVP with pan, zoom, node dragging, port connection, and live regex output.
- Vitest coverage for topology, render hit testing, and architecture boundaries.

## Commands

```powershell
cmd /c npm.cmd install
cmd /c npm.cmd run dev
cmd /c npm.cmd run validate
```

Individual checks:

```powershell
cmd /c npm.cmd run lint
cmd /c npm.cmd run typecheck
cmd /c npm.cmd run build
cmd /c npm.cmd run test
cmd /c npm.cmd run format
```

## Architecture

Dependency direction is:

```text
io/app -> render -> topology -> parser -> core
```

Keep parser code free of DOM, Canvas, coordinates, and layout concerns. Keep render code free of regex parsing logic.
