import { createIdFactory } from "../core/id";
import type { Point } from "../core/geometry";
import { testFullMatch, type RegexMatchResult } from "../parser/matcher";
import { hitTestGraph } from "../render/hitTesting";
import { renderCanvas } from "../render/canvasRenderer";
import { screenToWorld, type Viewport } from "../render/viewModel";
import {
  addNode,
  connectFlow,
  createInitialGraph,
  findNode,
  getLinearFlowNodeIds,
  graphToRegex,
  regexToGraph,
  type LexiGraph,
  type LexiNode,
  type NodeData,
  type NodeType,
  updateNodeData,
  updateNodePosition,
} from "../topology";

type AddableNodeType = Exclude<NodeType, "start" | "end">;

export interface LexiKnotControllerOptions {
  readonly canvas: HTMLCanvasElement;
  readonly onChange: (state: LexiKnotSnapshot) => void;
}

export interface LexiKnotSnapshot {
  readonly graph: LexiGraph;
  readonly regex: string;
  readonly selectedNode: LexiNode | null;
  readonly parseMessage: string | null;
  readonly matchResult: RegexMatchResult | null;
}

interface DragState {
  readonly kind: "node" | "pan";
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
  private readonly createId = createIdFactory();
  private graph = createInitialGraph();
  private selectedNodeId: string | null = null;
  private pendingSourceNodeId: string | null = null;
  private parseMessage: string | null = null;
  private sampleText = "";
  private matchResult: RegexMatchResult | null = null;
  private viewport: Viewport = { offset: { x: -64, y: 32 }, scale: 1 };
  private dragState: DragState | null = null;

  public constructor(options: LexiKnotControllerOptions) {
    this.canvas = options.canvas;
    this.onChange = options.onChange;
    this.bindEvents();
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

  public getSnapshot(): LexiKnotSnapshot {
    return {
      graph: this.graph,
      regex: graphToRegex(this.graph),
      selectedNode: this.getSelectedNode(),
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
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    const screenPoint = getCanvasPoint(this.canvas, event);
    const worldPoint = screenToWorld(screenPoint, this.viewport);
    const hit = hitTestGraph(this.graph, worldPoint);

    if (hit?.kind === "outputPort") {
      this.pendingSourceNodeId = hit.nodeId;
      this.selectedNodeId = hit.nodeId;
      this.render();
      return;
    }

    if (hit?.kind === "inputPort" && this.pendingSourceNodeId !== null) {
      this.graph = connectFlow(this.graph, this.pendingSourceNodeId, hit.nodeId);
      this.selectedNodeId = hit.nodeId;
      this.pendingSourceNodeId = null;
      this.parseMessage = null;
      this.updateMatchResult();
      this.render();
      return;
    }

    if (hit?.kind === "node") {
      const node = findNode(this.graph, hit.nodeId);
      if (node === undefined) {
        return;
      }

      this.canvas.setPointerCapture(event.pointerId);
      this.selectedNodeId = node.id;
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

    this.canvas.setPointerCapture(event.pointerId);
    this.selectedNodeId = null;
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
      this.dragState = null;
    }
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const screenPoint = getCanvasPoint(this.canvas, event);
    const worldBefore = screenToWorld(screenPoint, this.viewport);
    const nextScale = clamp(this.viewport.scale * (event.deltaY > 0 ? 0.92 : 1.08), 0.45, 2.2);

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
      pendingSourceNodeId: this.pendingSourceNodeId,
      highlightedNodeIds: this.getHighlightedNodeIds(),
    });
    this.onChange(this.getSnapshot());
  };

  private getSelectedNode(): LexiNode | null {
    return this.selectedNodeId === null
      ? null
      : (findNode(this.graph, this.selectedNodeId) ?? null);
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
    case "start":
    case "end":
      return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
