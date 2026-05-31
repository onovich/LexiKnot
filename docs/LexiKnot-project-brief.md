# LexiKnot Project Brief

Source: https://docs.google.com/document/d/1ZAo411XMh4_Q2dDD44bLsMVSgHZUua13YDHj3xrMdbM/edit?usp=sharing
Synced at: 2026-05-31T19:59:33.5097331+08:00
Google Doc ID: 1ZAo411XMh4_Q2dDD44bLsMVSgHZUua13YDHj3xrMdbM

---

LexiKnot (词法结) - 研发选型、架构设计与 Roadmap
1. 项目概述
LexiKnot 是一款基于无限画布的双向正则可视化引擎。它通过空间拓扑图（节点连线）将极其抽象的正则表达式具象化，支持通过拖拽节点生成正则（正向构建），同时也支持将现有的正则表达式解析并渲染为易读的节点流程图（反向解析）。
核心定位： 自研产品矩阵的基础设施（服务于批量重命名工具、游戏引擎逻辑模块），以及抹平跨角色沟通鸿沟的图形化 DSL。
2. 研发选型 (Tech Stack Selection)
为了满足“轻量化”、“极易嵌入（游戏引擎/工具矩阵）”和“高性能”的需求，技术选型应避免绑定过重的 UI 框架，倾向于底层与标准。
2.1 核心渲染层 (Canvas Engine)
* 推荐方案：Vanilla TypeScript + Native Canvas 2D API (或基于轻量级库如 PixiJS / ZRender)
* 原因： 作为引擎的底层模块，零依赖（Zero-dependency）或极少依赖是最高优先级。不建议使用 React Flow 或 Vue Flow，因为它们会强绑定前端框架。手写 Canvas 2D 或使用 PixiJS 可以保证以 Web Component 形式被任何环境完美集成。
2.2 正则解析引擎 (Regex AST Parser)
* 推荐方案：regexpp (ESLint 团队维护的正则解析器) 或 ret.js (Regular Expression Tokenizer)
* 原因： 反向解析是本项目的最大难点，不需要从零手写正则 Tokenizer。regexpp 可以将正则表达式完美解析为 AST（抽象语法树），我们只需要将 AST 节点映射为画布节点即可。
2.3 自动布局算法 (Auto Layout)
* 推荐方案：dagre (或 elkjs)
* 原因： 当输入一段正则生成节点图时，节点需要自动排版。正则的 AST 结构本质上是有向无环图（DAG），利用 Dagre 可以快速计算节点的 X/Y 坐标，避免节点堆叠。
2.4 构建与打包
* 推荐方案：Vite + Rollup
* 原因： 极致的打包速度。最终输出两种格式：ESM (供现代前端项目引入) 和 IIFE / Web Component (供游戏编辑器等传统或跨语言环境直接挂载)。
3. 技术文档 (核心架构设计)
3.1 模块划分 (Architecture Layers)
LexiKnot 遵循严格的数据与视图分离（MVC / MVP 模型）。
1. Lexer Layer (语法层): 负责 Regex String 与 AST 之间的互相转换。
2. Topology Layer (拓扑层): 负责 AST 与 Node Graph Data（节点数据结构）的映射。
3. Render Layer (渲染层): 负责在无限画布上绘制 Node、连线、交互状态（高亮、选中、拖拽）。
4. IO Layer (输入输出层): 提供标准 API 供外部系统（如重命名工具）调用和事件订阅。
3.2 核心数据结构设计 (TypeScript Interfaces)
// 节点的通用接口定义
interface LexiNode {
 id: string;          // 唯一标识
 type: NodeType;      // 节点类型：Start, End, Literal, CharacterClass, Quantifier, Group...
 position: { x: number, y: number }; // 画布坐标
 data: any;           // 节点配置数据（如匹配的具体字符、量词区间等）
 inputs: Port[];      // 输入端口
 outputs: Port[];     // 输出端口
}

interface Port {
 id: string;
 type: 'flow' | 'data'; // 逻辑流或数据流
}

interface LexiEdge {
 id: string;
 sourceNodeId: string;
 sourcePortId: string;
 targetNodeId: string;
 targetPortId: string;
}

// 拓扑图整体数据结构
interface LexiGraph {
 nodes: LexiNode[];
 edges: LexiEdge[];
}


3.3 数据流转机制 (Data Flow)
* 正向构建 (Node -> Regex): UI Canvas 事件触发 -> 更新 LexiGraph 数据 -> 遍历有向无环图生成 AST -> AST 序列化为 Regex 字符串。
* 反向解析 (Regex -> Node):
接收 Regex 字符串 -> regexpp 生成 AST -> AST 映射算法转换为 LexiGraph -> Dagre 算法计算 Position -> Canvas 渲染。
4. 发展路线图 (Roadmap)
Phase 1: MVP 构建 (0到1) —— 画布基建与正向生成
目标：跑通核心逻辑，能在画布上拖拽节点并生成简单的正则。
   * [ ] 搭建 TypeScript + Vite 工程，配置 Canvas 渲染基座。
   * [ ] 实现无限画布基础交互（缩放、平移、网格背景）。
   * [ ] 设计并绘制基础节点 UI（起始节点、文本节点、字符集节点、任意字符节点）。
   * [ ] 实现节点连线逻辑（贝塞尔曲线绘制，端口吸附）。
   * [ ] 编写正向解析器：将画布中的连线关系拼接成合法的正则字符串。
Phase 2: 反向工程 (1到10) —— 核心壁垒建立
目标：让工具具备“读懂”已有正则的能力，实现双向闭环。
   * [ ] 引入 regexpp，解析常见正则表达式为 AST。
   * [ ] 编写 AST to Graph 的转换映射规则。
   * [ ] 引入 dagre 自动布局算法，解决反向生成时节点的排版问题。
   * [ ] 实现实时测试面板：输入测试字符串，能在节点图上高亮匹配路径（白盒调试雏形）。
Phase 3: 工程化与矩阵集成 (10到50) —— 跨工具赋能
目标：将其封装为标准组件，并应用到实际生产管线中。
   * [ ] 封装为标准的 Web Component (<lexi-knot>)，暴露配置 API。
   * [ ] 增加高级正则特性节点（零宽断言、非捕获分组、贪婪/懒惰模式切换）。
   * [ ] 实战接入 1： 接入自研“批量重命名工具”，提供可视化命名规则配置界面。
   * [ ] 完善深色/浅色主题支持，优化高分屏 (Retina) 下的 Canvas 渲染清晰度。
Phase 4: 逻辑引擎泛化 (50到100) —— 游戏引擎生态
目标：跳出单一“正则”场景，沉淀出一套通用的节点逻辑框架。
   * [ ] 将 Canvas 节点引擎与 Regex 解析逻辑完全解耦。
   * [ ] 实战接入 2： 作为游戏引擎的子模块，支持状态机 (State Machine) 节点配置。
   * [ ] 支持自定义节点注册 API，允许其他开发者或项目组根据需求编写特定的处理节点。
5. 严格架构与编码规范指南 (Strict Guidelines)
为了保证 LexiKnot 作为底层设施的稳定性与可扩展性，研发过程中必须严格遵守以下架构准则。
5.1 控制流分层约束 (Control Flow)
   * 严格的单向数据流 (Unidirectional Data Flow)： 用户输入 (UI) -> Action 派发 -> 更新 Topology Graph 数据 -> 触发 Canvas 重新渲染。
   * 隔离视图与数据： Render 层的逻辑严禁直接修改 AST 或 Graph 数据，它只能作为 Graph 状态的“快照”呈现器。所有的修改必须通过暴漏的 API (如 GraphManager.addNode()) 进行。
5.2 程序集与模块依赖顺序 (Dependency Order)
系统依赖方向必须单向向下，严禁反向依赖与循环依赖。
   * 依赖层级 (自上而下)： IO/App -> Render (Canvas) -> Topology (Graph Mapping) -> Parser (Regex AST) -> Core/Utils。
   * 依赖倒置原则 (DIP)： 底层模块（如 Topology）如果需要通知上层模块（如 Render 需要重绘），严禁直接 Import 上层模块的类或方法。必须通过事件总线 (EventEmitter) 或回调函数注入的方式向外派发事件。
5.3 代码的目录归属原则 (Directory Ownership)
目录结构必须严格反映架构分层，代码必须归属到职责最清晰的物理目录。
src/
├─ core/       # 纯数学计算、工具类、EventBus（不得依赖 src 下的其他目录）
├─ parser/     # 仅处理 Regex string 与 AST 的双向转换（不得涉及任何坐标或节点概念）
├─ topology/   # 管理 Graph/Node/Edge 数据结构，以及 AST 到 Graph 的映射（不得引入 Canvas/DOM）
├─ render/     # 仅处理 Canvas 绘制、坐标系转换、鼠标/触摸事件（依赖 topology 获取渲染数据）
└─ io/         # 对外暴露的顶级 Web Component 包装与 API 出口

   * 约束： 严禁在 render/ 文件夹下出现任何关于正则语法解析的逻辑；严禁在 parser/ 文件夹下出现与屏幕坐标、宽高相关的数据。
5.4 严格代码命名 (Naming Conventions)
   * 类型与接口 (Types & Interfaces)： PascalCase（如 LexiNode, RegexGraph）。严禁使用 I 前缀（如 ILexiNode 是被禁止的）。
   * 类 (Classes)： PascalCase（如 CanvasRenderer, AstMapper）。
   * 函数与方法 (Functions & Methods)： camelCase，必须是“动宾结构”短语。
   * 正确： parseRegex(), drawNode(), calculateLayout()
   * 错误： regexParse(), nodeDraw()
   * 布尔变量 (Booleans)： 必须以 is, has, should, can 开头（如 isDraggable, hasChildren）。
   * 常量 (Constants)： UPPER_SNAKE_CASE（如 DEFAULT_NODE_WIDTH, MAX_ZOOM_LEVEL）。
5.5 编码风格与类型准则 (Coding Style)
   * TypeScript 严格模式： 必须在 tsconfig.json 中开启 "strict": true。
   * 零 any 容忍： 全局严禁使用 any 类型。如遇暂且不明确的类型，必须使用 unknown 并在后续流程中进行类型收窄 (Type Narrowing) 或使用泛型 T。
   * 数据不可变性优先 (Immutability)： 在操作核心业务数据（Graph, AST）时，优先返回新对象，尽量避免原地修改 (Mutate)。这有利于实现后续的“撤销/重做 (Undo/Redo)”栈。
   * 函数纯度要求： parser/ 和 topology/ 目录下的核心算法方法必须是纯函数 (Pure Functions)，即相同的输入永远得到相同的输出，且不产生任何外部副作用。
