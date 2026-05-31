import type { EdgeMeaning, NodeRole } from "./topology";

export const supportedLanguages = ["en", "zh", "ja", "es", "pt-BR", "ru"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export interface NodeText {
  readonly start: string;
  readonly end: string;
  readonly literal: string;
  readonly characterClass: string;
  readonly anyCharacter: string;
  readonly digitCharacter: string;
  readonly wordCharacter: string;
  readonly whitespaceCharacter: string;
  readonly lineStart: string;
  readonly lineEnd: string;
  readonly sequenceThen: string;
  readonly oneOrMore: string;
  readonly regexFragment: string;
  readonly flowEntry: string;
  readonly flowExit: string;
}

export interface Messages {
  readonly appSubtitle: string;
  readonly nodeTools: string;
  readonly language: string;
  readonly nouns: string;
  readonly verbs: string;
  readonly addLiteral: string;
  readonly addClass: string;
  readonly addAny: string;
  readonly addDigit: string;
  readonly addWord: string;
  readonly addWhitespace: string;
  readonly addLineStart: string;
  readonly addLineEnd: string;
  readonly addThen: string;
  readonly addOneOrMore: string;
  readonly deleteNode: string;
  readonly regexInput: string;
  readonly parseToGraph: string;
  readonly value: string;
  readonly generatedRegex: string;
  readonly testString: string;
  readonly testPlaceholder: string;
  readonly empty: string;
  readonly invalidRegex: string;
  readonly fullMatch: string;
  readonly noFullMatch: string;
  readonly nodeInspector: string;
  readonly graphCanvas: string;
  readonly selectionTitle: string;
  readonly roleLabels: Record<NodeRole, string>;
  readonly edgeLabels: Record<EdgeMeaning, string>;
  readonly nodeHelp: NodeText;
  readonly edgeHelp: Record<EdgeMeaning, string>;
  readonly nodes: NodeText;
}

export interface LanguageOption {
  readonly code: LanguageCode;
  readonly label: string;
}

export const languageOptions: readonly LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "ru", label: "Русский" },
];

const englishNodes: NodeText = {
  start: "Start",
  end: "End",
  literal: "Literal",
  characterClass: "Character Class",
  anyCharacter: "Any Character",
  digitCharacter: "Digit",
  wordCharacter: "Word Character",
  whitespaceCharacter: "Whitespace",
  lineStart: "Line Start",
  lineEnd: "Line End",
  sequenceThen: "Then",
  oneOrMore: "One or More",
  regexFragment: "Fragment",
  flowEntry: "flow entry",
  flowExit: "flow exit",
};

const englishNodeHelp: NodeText = {
  start: "System node: the graph begins here.",
  end: "System node: the graph ends here.",
  literal: "Noun node: matches this exact text, with regex metacharacters escaped.",
  characterClass:
    "Noun node: matches one character from a set, such as [abc] or [a-z]. It is not a literal hyphen or a sequence connector.",
  anyCharacter: "Noun node: matches any single character with dot syntax.",
  digitCharacter: "Noun node: matches one digit with \\d.",
  wordCharacter: "Noun node: matches one word character with \\w.",
  whitespaceCharacter: "Noun node: matches one whitespace character with \\s.",
  lineStart: "Noun-like assertion: matches the start position with ^.",
  lineEnd: "Noun-like assertion: matches the end position with $.",
  sequenceThen:
    "Verb node: connects a previous token to the next token as sequence. It emits no regex text.",
  oneOrMore: "Verb node: repeats the previous noun one or more times and emits +.",
  regexFragment: "Noun node: preserves regex syntax that the editor cannot yet decompose.",
  flowEntry: "System node: the graph begins here.",
  flowExit: "System node: the graph ends here.",
};

const zhNodes: NodeText = {
  start: "开始",
  end: "结束",
  literal: "文本",
  characterClass: "字符集",
  anyCharacter: "任意字符",
  digitCharacter: "数字",
  wordCharacter: "单词字符",
  whitespaceCharacter: "空白符",
  lineStart: "行首",
  lineEnd: "行尾",
  sequenceThen: "然后",
  oneOrMore: "加上",
  regexFragment: "片段",
  flowEntry: "入口",
  flowExit: "出口",
};

const zhNodeHelp: NodeText = {
  start: "系统节点：正则从这里开始。",
  end: "系统节点：正则在这里结束。",
  literal: "名词节点：匹配这段确切文本，正则特殊字符会被转义。",
  characterClass:
    "名词节点：从一组字符里匹配一个字符，例如 [abc] 或 [a-z]。它不是把字符连起来，也不是字面量连字符。",
  anyCharacter: "名词节点：用点号匹配任意单个字符。",
  digitCharacter: "名词节点：用 \\d 匹配一个数字。",
  wordCharacter: "名词节点：用 \\w 匹配一个单词字符。",
  whitespaceCharacter: "名词节点：用 \\s 匹配一个空白字符。",
  lineStart: "类名词断言：用 ^ 匹配行首位置。",
  lineEnd: "类名词断言：用 $ 匹配行尾位置。",
  sequenceThen: "动词节点：表达“前一个规则之后再匹配下一个规则”，自身不生成正则字符。",
  oneOrMore: "动词节点：表达“前一个名词出现一次或多次”，生成 +。",
  regexFragment: "名词节点：保留当前编辑器还不能拆解的正则片段。",
  flowEntry: "系统节点：正则从这里开始。",
  flowExit: "系统节点：正则在这里结束。",
};

const jaNodes: NodeText = {
  ...englishNodes,
  start: "開始",
  end: "終了",
  literal: "文字列",
  characterClass: "文字クラス",
  sequenceThen: "次に",
  oneOrMore: "1回以上",
};

const esNodes: NodeText = {
  ...englishNodes,
  start: "Inicio",
  end: "Fin",
  literal: "Literal",
  characterClass: "Clase",
  anyCharacter: "Cualquiera",
  sequenceThen: "Luego",
  oneOrMore: "Uno o más",
};

const ptNodes: NodeText = {
  ...englishNodes,
  start: "Início",
  end: "Fim",
  literal: "Literal",
  characterClass: "Classe",
  anyCharacter: "Qualquer",
  sequenceThen: "Depois",
  oneOrMore: "Um ou mais",
};

const ruNodes: NodeText = {
  ...englishNodes,
  start: "Старт",
  end: "Конец",
  literal: "Литерал",
  characterClass: "Класс",
  anyCharacter: "Любой",
  sequenceThen: "Затем",
  oneOrMore: "Один+",
};

function createMessages(overrides: Partial<Messages> & Pick<Messages, "nodes">): Messages {
  return {
    appSubtitle: "Bidirectional regex graph test UI",
    nodeTools: "Node tools",
    language: "Language",
    nouns: "Nouns",
    verbs: "Verbs",
    addLiteral: "Literal",
    addClass: "Class",
    addAny: "Any",
    addDigit: "Digit",
    addWord: "Word",
    addWhitespace: "Space",
    addLineStart: "^",
    addLineEnd: "$",
    addThen: "Then",
    addOneOrMore: "One+",
    deleteNode: "Delete node",
    regexInput: "Regex input",
    parseToGraph: "Parse to graph",
    value: "Value",
    generatedRegex: "Generated regex",
    testString: "Test string",
    testPlaceholder: "Try a full-match sample",
    empty: "(empty)",
    invalidRegex: "Invalid regex",
    fullMatch: "Full match",
    noFullMatch: "No full match",
    nodeInspector: "Node inspector",
    graphCanvas: "LexiKnot graph canvas",
    selectionTitle: "Selection",
    roleLabels: {
      system: "System",
      noun: "Noun",
      verb: "Verb",
    },
    edgeLabels: {
      entry: "Entry",
      subject: "Subject",
      object: "Object",
      exit: "Exit",
    },
    nodeHelp: englishNodeHelp,
    edgeHelp: {
      entry: "Entry edge: starts the regex expression.",
      subject: "Subject edge: a noun feeds into a verb such as Then or One+.",
      object: "Object edge: a verb points to the noun it acts on next.",
      exit: "Exit edge: ends the regex expression.",
    },
    ...overrides,
  };
}

export const messages: Record<LanguageCode, Messages> = {
  en: createMessages({ nodes: englishNodes }),
  zh: createMessages({
    appSubtitle: "双向正则图测试界面",
    nodeTools: "节点工具",
    language: "语言",
    nouns: "名词",
    verbs: "动词",
    addLiteral: "文本",
    addClass: "字符集",
    addAny: "任意",
    addDigit: "数字",
    addWord: "单词",
    addWhitespace: "空白",
    addThen: "然后",
    addOneOrMore: "加上",
    deleteNode: "删除节点",
    regexInput: "正则输入",
    parseToGraph: "解析为图",
    value: "值",
    generatedRegex: "生成的正则",
    testString: "测试字符串",
    testPlaceholder: "输入完整匹配样例",
    empty: "（空）",
    invalidRegex: "正则无效",
    fullMatch: "完整匹配",
    noFullMatch: "未完整匹配",
    nodeInspector: "节点检查器",
    graphCanvas: "LexiKnot 图画布",
    selectionTitle: "选中项",
    roleLabels: {
      system: "系统",
      noun: "名词",
      verb: "动词",
    },
    edgeLabels: {
      entry: "入口",
      subject: "主语",
      object: "宾语",
      exit: "出口",
    },
    nodeHelp: zhNodeHelp,
    edgeHelp: {
      entry: "入口连线：从开始节点进入正则表达式。",
      subject: "主语连线：名词指向动词，表示这个动词作用在前一个规则上。",
      object: "宾语连线：动词指向下一个名词，表示接下来要匹配的规则。",
      exit: "出口连线：当前规则之后结束表达式。",
    },
    nodes: zhNodes,
  }),
  ja: createMessages({
    language: "言語",
    nouns: "名詞",
    verbs: "動詞",
    deleteNode: "ノード削除",
    selectionTitle: "選択",
    nodes: jaNodes,
  }),
  es: createMessages({
    language: "Idioma",
    nouns: "Sustantivos",
    verbs: "Verbos",
    deleteNode: "Eliminar nodo",
    selectionTitle: "Selección",
    nodes: esNodes,
  }),
  "pt-BR": createMessages({
    language: "Idioma",
    nouns: "Substantivos",
    verbs: "Verbos",
    deleteNode: "Excluir nó",
    selectionTitle: "Seleção",
    nodes: ptNodes,
  }),
  ru: createMessages({
    language: "Язык",
    nouns: "Сущ.",
    verbs: "Глаг.",
    deleteNode: "Удалить узел",
    selectionTitle: "Выбор",
    nodes: ruNodes,
  }),
};

export function resolveLanguage(preferences: readonly string[]): LanguageCode {
  for (const preference of preferences) {
    const normalized = preference.trim().toLowerCase();
    const exact = languageOptions.find((option) => option.code.toLowerCase() === normalized);
    if (exact !== undefined) {
      return exact.code;
    }

    if (normalized.startsWith("zh")) {
      return "zh";
    }

    if (normalized.startsWith("ja")) {
      return "ja";
    }

    if (normalized.startsWith("es")) {
      return "es";
    }

    if (normalized.startsWith("pt")) {
      return "pt-BR";
    }

    if (normalized.startsWith("ru")) {
      return "ru";
    }

    if (normalized.startsWith("en")) {
      return "en";
    }
  }

  return "en";
}

export function getBrowserLanguage(): LanguageCode {
  return resolveLanguage(
    navigator.languages.length > 0 ? navigator.languages : [navigator.language],
  );
}
