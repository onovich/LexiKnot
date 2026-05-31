import { createIdFactory } from "../core/id";
import type { Point } from "../core/geometry";
import type { NodeText } from "../i18n";
import { testFullMatch, type RegexMatchResult } from "../parser/matcher";
import { hitTestGraph } from "../render/hitTesting";
import { renderCanvas } from "../render/canvasRenderer";
import { screenToWorld, type Viewport, ZOOM_LIMITS } from "../render/viewModel";
import {
  addNode,
  connectFlow,
  createInitialGraph,
  deleteNode,
  findNode,
  getLinearFlowNodeIds,
  graphToRegex,
  regexToGraph,
  type LexiGraph,
  type LexiEdge,
  type LexiNode,
  type NodeData,
  type NodeType,
  updateNodeData,
  updateNodePosition,
} from "../topology";

type AddableNodeType = Exclude<NodeType, "start" | "end">;

export interface LexiKnotControllerOptions {
  readonly canvas: HTMLCanvasElement;
  readonly nodeText: NodeText;
  readonly onChange: (state: LexiKnotSnapshot) => void;
}

export interface LexiKnotSnapshot {
  readonly graph: LexiGraph;
  readonly regex: string;
  readonly selectedNode: LexiNode | null;
  readonly selectedEdge: LexiEdge | null;
  readonly parseMessage: string | null;
  readonly matchResult: RegexMatchResult | null;
}

interface DragState {
  readonly kind: "node" | "pan" | "connection";
  readonly pointerId: number;
  readonly startScreen: Point;
  readonly startWorld: Point;
  readonly nodeId: string | null;
  readonly nodeStart: Point | null;
  readonly viewportStart: Viewport;
}

export class LexiKnotController {
  private readonly canvas: HTMLCanvasElement;
  private readonly onChange: (state: LexiKnotSnapshot) => void;
  private nodeText: NodeText;
  private readonly createId = createIdFactory();
  private graph = createInitialGraph();
  private selectedNodeId: string | null = null;
  private selectedEdgeId: string | null = null;
  private pendingSourceNodeId: string | null = null;
  private connectionPreviewTarget: Point | null = null;
  private parseMessage: string | null = null;
  private sampleText = "";
  private matchResult: RegexMatchResult | null = null;
  private viewport: Viewport = { offset: { x: -64, y: 32 }, scale: 1 };
  private dragState: DragState | null = null;

  public constructor(options: LexiKnotControllerOptions) {
    this.canvas = options.canvas;
    this.onChange = options.onChange;
    this.nodeText = options.nodeText;
    this.bindEvents();
    this.render();
  }

  public setNodeText(nodeText: NodeText): void {
    this.nodeText = nodeText;
    this.render();
  }

  public addNode(type: AddableNodeType): void {
    const nodeCount = this.graph.nodes.length - 2;
    const result = addNode(
      this.graph,
      {
        type,
        x: 240 + nodeCount * 168,
        y: 160,
      },
      this.createId,
    );

    this.graph = result.graph;
    this.selectedNodeId = result.node.id;
    this.pendingSourceNodeId = null;
    this.parseMessage = null;
    this.updateMatchResult();
    this.render();
  }

  public addNodeAt(type: AddableNodeType, screenPoint: Point): void {
    const worldPoint = screenToWorld(screenPoint, this.viewport);
    const result = addNode(
      this.graph,
      {
        type,
        x: worldPoint.x,
        y: worldPoint.y,
      },
      this.createId,
    );

    this.graph = result.graph;
    this.selectedNodeId = result.node.id;
    this.selectedEdgeId = null;
    this.pendingSourceNodeId = null;
    this.parseMessage = null;
    this.updateMatchResult();
    this.render();
  }

  public canCreateNodeAt(screenPoint: Point): boolean {
    const worldPoint = screenToWorld(screenPoint, this.viewport);
    return hitTestGraph(this.graph, worldPoint) === null;
  }

  public updateSelectedNodeValue(value: string): void {
    const selected = this.getSelectedNode();

    if (selected === null) {
      return;
    }

    const data = getUpdatedNodeData(selected, value);
    if (data === null) {
      return;
    }

    this.graph = updateNodeData(this.graph, selected.id, data);
    this.parseMessage = null;
    this.updateMatchResult();
    this.render();
  }

  public setRegex(pattern: string): void {
    const result = regexToGraph(pattern);
    if (!result.ok) {
      this.parseMessage = result.error;
      this.render();
      return;
    }

    this.graph = result.graph;
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.pendingSourceNodeId = null;
    this.parseMessage = result.warnings.length > 0 ? result.warnings.join(" ") : null;
    this.updateMatchResult();
    this.render();
  }

  public setSampleText(sampleText: string): void {
    this.sampleText = sampleText;
    this.updateMatchResult();
    this.render();
  }

  public deleteSelectedNode(): void {
    if (
      this.selectedNodeId === null ||
      this.selectedNodeId === "start" ||
      this.selectedNodeId === "end"
    ) {
      return;
    }

    this.graph = deleteNode(this.graph, this.selectedNodeId);
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.pendingSourceNodeId = null;
    this.connectionPreviewTarget = null;
    this.parseMessage = null;
    this.updateMatchResult();
    this.render();
  }

  public getSnapshot(): LexiKnotSnapshot {
    return {
      graph: this.graph,
      regex: graphToRegex(this.graph),
      selectedNode: this.getSelectedNode(),
      selectedEdge: this.getSelectedEdge(),
      parseMessage: this.parseMessage,
      matchResult: this.matchResult,
    };
  }

  private bindEvents(): void {
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerUp);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("resize", this.render);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    const screenPoint = getCanvasPoint(this.canvas, event);
    const worldPoint = screenToWorld(screenPoint, this.viewport);
    const hit = hitTestGraph(this.graph, worldPoint);

    if (hit?.kind === "outputPort") {
      if (hit.nodeId === undefined) {
        return;
      }

      this.canvas.setPointerCapture(event.pointerId);
      this.pendingSourceNodeId = hit.nodeId;
      this.selectedNodeId = hit.nodeId;
      this.selectedEdgeId = null;
      this.connectionPreviewTarget = worldPoint;
      this.dragState = {
        kind: "connection",
        pointerId: event.pointerId,
        startScreen: screenPoint,
        startWorld: worldPoint,
        nodeId: hit.nodeId,
        nodeStart: null,
        viewportStart: this.viewport,
      };
      this.render();
      return;
    }

    if (hit?.kind === "node") {
      if (hit.nodeId === undefined) {
        return;
      }

      const node = findNode(this.graph, hit.nodeId);
      if (node === undefined) {
        return;
      }

      this.canvas.setPointerCapture(event.pointerId);
      this.selectedNodeId = node.id;
      this.selectedEdgeId = null;
      this.pendingSourceNodeId = null;
      this.dragState = {
        kind: "node",
        pointerId: event.pointerId,
        startScreen: screenPoint,
        startWorld: worldPoint,
        nodeId: node.id,
        nodeStart: node.position,
        viewportStart: this.viewport,
      };
      this.render();
      return;
    }

    if (hit?.kind === "edge") {
      this.selectedEdgeId = hit.edgeId ?? null;
      this.selectedNodeId = null;
      this.pendingSourceNodeId = null;
      this.dragState = null;
      this.render();
      return;
    }

    this.canvas.setPointerCapture(event.pointerId);
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.pendingSourceNodeId = null;
    this.dragState = {
      kind: "pan",
      pointerId: event.pointerId,
      startScreen: screenPoint,
      startWorld: worldPoint,
      nodeId: null,
      nodeStart: null,
      viewportStart: this.viewport,
    };
    this.render();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.dragState === null || this.dragState.pointerId !== event.pointerId) {
      return;
    }

    const screenPoint = getCanvasPoint(this.canvas, event);
    const delta = {
      x: screenPoint.x - this.dragState.startScreen.x,
      y: screenPoint.y - this.dragState.startScreen.y,
    };

    if (this.dragState.kind === "pan") {
      this.viewport = {
        ...this.viewport,
        offset: {
          x: this.dragState.viewportStart.offset.x + delta.x,
          y: this.dragState.viewportStart.offset.y + delta.y,
        },
      };
      this.render();
      return;
    }

    if (this.dragState.kind === "connection") {
      this.connectionPreviewTarget = screenToWorld(screenPoint, this.viewport);
      this.render();
      return;
    }

    if (this.dragState.nodeId !== null && this.dragState.nodeStart !== null) {
      this.graph = updateNodePosition(
        this.graph,
        this.dragState.nodeId,
        this.dragState.nodeStart.x + delta.x / this.viewport.scale,
        this.dragState.nodeStart.y + delta.y / this.viewport.scale,
      );
      this.render();
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.dragState?.pointerId === event.pointerId) {
      if (this.dragState.kind === "connection" && this.pendingSourceNodeId !== null) {
        const worldPoint = screenToWorld(getCanvasPoint(this.canvas, event), this.viewport);
        const hit = hitTestGraph(this.graph, worldPoint);
        if (hit?.kind === "inputPort" && hit.nodeId !== undefined) {
          const nextGraph = connectFlow(this.graph, this.pendingSourceNodeId, hit.nodeId);
          if (nextGraph !== this.graph) {
            this.graph = nextGraph;
            this.selectedNodeId = null;
            this.selectedEdgeId = `${this.pendingSourceNodeId}-to-${hit.nodeId}`;
            this.parseMessage = null;
            this.updateMatchResult();
          }
        }

        this.pendingSourceNodeId = null;
        this.connectionPreviewTarget = null;
      }

      this.dragState = null;
      this.render();
    }
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      this.deleteSelectedNode();
    }
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const screenPoint = getCanvasPoint(this.canvas, event);
    const worldBefore = screenToWorld(screenPoint, this.viewport);
    const nextScale = clamp(
      this.viewport.scale * (event.deltaY > 0 ? 0.92 : 1.08),
      ZOOM_LIMITS.min,
      ZOOM_LIMITS.max,
    );

    this.viewport = {
      scale: nextScale,
      offset: {
        x: screenPoint.x - worldBefore.x * nextScale,
        y: screenPoint.y - worldBefore.y * nextScale,
      },
    };
    this.render();
  };

  private readonly render = (): void => {
    renderCanvas(this.canvas, {
      graph: this.graph,
      viewport: this.viewport,
      selectedNodeId: this.selectedNodeId,
      selectedEdgeId: this.selectedEdgeId,
      pendingSourceNodeId: this.pendingSourceNodeId,
      highlightedNodeIds: this.getHighlightedNodeIds(),
      nodeText: this.nodeText,
      connectionPreview:
        this.pendingSourceNodeId === null || this.connectionPreviewTarget === null
          ? null
          : {
              sourceNodeId: this.pendingSourceNodeId,
              target: this.connectionPreviewTarget,
            },
    });
    this.onChange(this.getSnapshot());
  };

  private getSelectedNode(): LexiNode | null {
    return this.selectedNodeId === null
      ? null
      : (findNode(this.graph, this.selectedNodeId) ?? null);
  }

  private getSelectedEdge(): LexiEdge | null {
    return this.selectedEdgeId === null
      ? null
      : (this.graph.edges.find((edge) => edge.id === this.selectedEdgeId) ?? null);
  }

  private updateMatchResult(): void {
    this.matchResult =
      this.sampleText === "" ? null : testFullMatch(graphToRegex(this.graph), this.sampleText);
  }

  private getHighlightedNodeIds(): readonly string[] {
    if (this.matchResult?.isMatch !== true) {
      return [];
    }

    return getLinearFlowNodeIds(this.graph).filter(
      (nodeId) => nodeId !== "start" && nodeId !== "end",
    );
  }
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: PointerEvent | WheelEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getUpdatedNodeData(node: LexiNode, value: string): NodeData | null {
  switch (node.data.kind) {
    case "literal":
      return { ...node.data, value };
    case "characterClass":
      return { ...node.data, value };
    case "regexFragment":
      return { ...node.data, expression: value };
    case "anyCharacter":
    case "digitCharacter":
    case "wordCharacter":
    case "whitespaceCharacter":
    case "lineStart":
    case "lineEnd":
    case "sequenceThen":
    case "oneOrMore":
    case "start":
    case "end":
      return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
