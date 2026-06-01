import type { EdgeMeaning, NodeRole } from "./topology";

export const supportedLanguages = ["en", "zh", "ja", "es", "pt-BR", "ru"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export interface NodeText {
  readonly start: string;
  readonly end: string;
  readonly literal: string;
  readonly characterClass: string;
  readonly excludedCharacterClass: string;
  readonly anyCharacter: string;
  readonly digitCharacter: string;
  readonly nonDigitCharacter: string;
  readonly wordCharacter: string;
  readonly nonWordCharacter: string;
  readonly whitespaceCharacter: string;
  readonly nonWhitespaceCharacter: string;
  readonly lineStart: string;
  readonly lineEnd: string;
  readonly wordBoundary: string;
  readonly notWordBoundary: string;
  readonly sequenceThen: string;
  readonly chooseOne: string;
  readonly oneOrMore: string;
  readonly zeroOrMore: string;
  readonly optional: string;
  readonly exactCount: string;
  readonly repeatAtLeast: string;
  readonly repeatBetween: string;
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
  readonly addExcludedClass: string;
  readonly addAny: string;
  readonly addDigit: string;
  readonly addNonDigit: string;
  readonly addWord: string;
  readonly addNonWord: string;
  readonly addWhitespace: string;
  readonly addNonWhitespace: string;
  readonly addLineStart: string;
  readonly addLineEnd: string;
  readonly addWordBoundary: string;
  readonly addNotWordBoundary: string;
  readonly addThen: string;
  readonly addChooseOne: string;
  readonly addOneOrMore: string;
  readonly addZeroOrMore: string;
  readonly addOptional: string;
  readonly addExactCount: string;
  readonly addRepeatAtLeast: string;
  readonly addRepeatBetween: string;
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
  literal: "Exact Text",
  characterClass: "One Of These Characters",
  excludedCharacterClass: "Not These Characters",
  anyCharacter: "Any Single Character",
  digitCharacter: "Any Digit",
  nonDigitCharacter: "Any Non-Digit",
  wordCharacter: "Any Letter, Digit, or Underscore",
  nonWordCharacter: "Anything Except Letter, Digit, or Underscore",
  whitespaceCharacter: "Any Whitespace",
  nonWhitespaceCharacter: "Any Non-Whitespace",
  lineStart: "Start of Text",
  lineEnd: "End of Text",
  wordBoundary: "Word Boundary",
  notWordBoundary: "Not a Word Boundary",
  sequenceThen: "Then Match",
  chooseOne: "Or Match",
  oneOrMore: "One or More Times",
  zeroOrMore: "Zero or More Times",
  optional: "May Appear Once",
  exactCount: "Repeat Exact Times",
  repeatAtLeast: "Repeat At Least",
  repeatBetween: "Repeat Between",
  regexFragment: "Unsupported Regex Fragment",
  flowEntry: "entry",
  flowExit: "exit",
};

const englishNodeHelp: NodeText = {
  start: "System node: the graph begins here.",
  end: "System node: the graph ends here.",
  literal: "Matches this exact text. Regex metacharacters are escaped automatically.",
  characterClass: "Matches one character from a set, such as abc or a-z.",
  excludedCharacterClass: "Matches one character that is not in the listed set.",
  anyCharacter: "Matches any single character.",
  digitCharacter: "Matches one digit.",
  nonDigitCharacter: "Matches one character that is not a digit.",
  wordCharacter: "Matches one letter, digit, or underscore.",
  nonWordCharacter: "Matches one character that is not a letter, digit, or underscore.",
  whitespaceCharacter: "Matches one whitespace character.",
  nonWhitespaceCharacter: "Matches one character that is not whitespace.",
  lineStart: "Requires the match to be at the start of the text.",
  lineEnd: "Requires the match to be at the end of the text.",
  wordBoundary: "Requires the current position to be at a word boundary.",
  notWordBoundary: "Requires the current position not to be at a word boundary.",
  sequenceThen:
    "Connects two rules in order. This is the natural-language replacement for bare adjacency.",
  chooseOne: "Creates a choice: match the previous rule or the next rule.",
  oneOrMore: "Repeats the previous rule one or more times.",
  zeroOrMore: "Repeats the previous rule zero or more times.",
  optional: "Makes the previous rule optional.",
  exactCount: "Repeats the previous rule exactly the number of times in Value.",
  repeatAtLeast: "Repeats the previous rule at least the number of times in Value.",
  repeatBetween: "Repeats the previous rule from min to max times. Use Value like 2,5.",
  regexFragment:
    "Internal fallback for syntax that has not been decomposed into natural-language nodes yet.",
  flowEntry: "System node: the graph begins here.",
  flowExit: "System node: the graph ends here.",
};

const zhNodes: NodeText = {
  start: "开始",
  end: "结束",
  literal: "精确文本",
  characterClass: "这些字符之一",
  excludedCharacterClass: "不是这些字符",
  anyCharacter: "任意单个字符",
  digitCharacter: "任意数字",
  nonDigitCharacter: "任意非数字",
  wordCharacter: "任意字母数字或下划线",
  nonWordCharacter: "非字母数字下划线",
  whitespaceCharacter: "任意空白",
  nonWhitespaceCharacter: "任意非空白",
  lineStart: "从文本开头开始",
  lineEnd: "到文本结尾结束",
  wordBoundary: "词语边界",
  notWordBoundary: "不是词语边界",
  sequenceThen: "按顺序接着",
  chooseOne: "或者匹配",
  oneOrMore: "出现一次或多次",
  zeroOrMore: "出现零次或多次",
  optional: "可以出现一次",
  exactCount: "重复指定次数",
  repeatAtLeast: "至少重复次数",
  repeatBetween: "重复次数范围",
  regexFragment: "暂未拆解的正则片段",
  flowEntry: "入口",
  flowExit: "出口",
};

const zhNodeHelp: NodeText = {
  start: "系统节点：正则从这里开始。",
  end: "系统节点：正则在这里结束。",
  literal: "匹配一段精确文本。正则特殊字符会自动转义。",
  characterClass: "从一组字符里匹配一个字符，例如 abc 或 a-z。",
  excludedCharacterClass: "匹配一个不在这组字符里的字符。",
  anyCharacter: "匹配任意一个字符。",
  digitCharacter: "匹配任意一个数字。",
  nonDigitCharacter: "匹配任意一个不是数字的字符。",
  wordCharacter: "匹配任意一个字母、数字或下划线。",
  nonWordCharacter: "匹配任意一个不是字母、数字或下划线的字符。",
  whitespaceCharacter: "匹配任意一个空白字符。",
  nonWhitespaceCharacter: "匹配任意一个不是空白的字符。",
  lineStart: "要求匹配发生在文本开头。",
  lineEnd: "要求匹配结束在文本结尾。",
  wordBoundary: "要求当前位置处在词语边界上。",
  notWordBoundary: "要求当前位置不在词语边界上。",
  sequenceThen: "把两个规则按顺序连接起来，是裸连线邻接的自然语言表达。",
  chooseOne: "创建选择关系：匹配前一个规则，或者匹配下一个规则。",
  oneOrMore: "让前一个规则出现一次或多次。",
  zeroOrMore: "让前一个规则出现零次或多次。",
  optional: "让前一个规则可有可无，最多出现一次。",
  exactCount: "让前一个规则重复指定次数，次数填写在“值”里。",
  repeatAtLeast: "让前一个规则至少重复指定次数，最小次数填写在“值”里。",
  repeatBetween: "让前一个规则重复 N 到 M 次，值用 2,5 这样的格式填写。",
  regexFragment: "内部兜底节点：表示当前还没有拆成自然语言语法的正则片段。",
  flowEntry: "系统节点：正则从这里开始。",
  flowExit: "系统节点：正则在这里结束。",
};

function createMessages(
  overrides: Partial<Messages> & Pick<Messages, "nodes">,
  nodeHelp: NodeText = englishNodeHelp,
): Messages {
  return {
    appSubtitle: "Bidirectional regex graph test UI",
    nodeTools: "Node tools",
    language: "Language",
    nouns: "Things to Match",
    verbs: "Ways to Combine or Repeat",
    addLiteral: "Exact Text",
    addClass: "One Of",
    addExcludedClass: "Not These",
    addAny: "Any Character",
    addDigit: "Any Digit",
    addNonDigit: "Non-Digit",
    addWord: "Letter/Digit/_",
    addNonWord: "Not Letter/Digit/_",
    addWhitespace: "Whitespace",
    addNonWhitespace: "Non-Whitespace",
    addLineStart: "Start of Text",
    addLineEnd: "End of Text",
    addWordBoundary: "Word Boundary",
    addNotWordBoundary: "Not Word Boundary",
    addThen: "Then",
    addChooseOne: "Or",
    addOneOrMore: "One+",
    addZeroOrMore: "Zero+",
    addOptional: "Optional",
    addExactCount: "Repeat N",
    addRepeatAtLeast: "Repeat N+",
    addRepeatBetween: "Repeat N-M",
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
      noun: "Thing to match",
      verb: "Combiner or repeater",
    },
    edgeLabels: {
      entry: "Entry",
      subject: "Subject",
      object: "Object",
      exit: "Exit",
    },
    nodeHelp,
    edgeHelp: {
      entry: "Entry edge: starts the regex expression.",
      subject: "Subject edge: a matchable thing feeds into a combiner or repeater.",
      object: "Object edge: a combiner points to the next matchable thing.",
      exit: "Exit edge: ends the regex expression.",
    },
    ...overrides,
  };
}

export const messages: Record<LanguageCode, Messages> = {
  en: createMessages({ nodes: englishNodes }),
  zh: createMessages(
    {
      appSubtitle: "双向正则图测试界面",
      nodeTools: "节点工具",
      language: "语言",
      nouns: "要匹配的内容",
      verbs: "组合或重复方式",
      addLiteral: "精确文本",
      addClass: "这些之一",
      addExcludedClass: "排除这些",
      addAny: "任意字符",
      addDigit: "任意数字",
      addNonDigit: "非数字",
      addWord: "字母数字下划线",
      addNonWord: "非字母数字下划线",
      addWhitespace: "空白",
      addNonWhitespace: "非空白",
      addLineStart: "文本开头",
      addLineEnd: "文本结尾",
      addWordBoundary: "词语边界",
      addNotWordBoundary: "非词语边界",
      addThen: "接着",
      addChooseOne: "或者",
      addOneOrMore: "一次或多次",
      addZeroOrMore: "零次或多次",
      addOptional: "可有可无",
      addExactCount: "重复 N 次",
      addRepeatAtLeast: "至少重复 N 次",
      addRepeatBetween: "重复 N 到 M 次",
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
        noun: "要匹配的内容",
        verb: "组合或重复方式",
      },
      edgeLabels: {
        entry: "入口",
        subject: "主语",
        object: "宾语",
        exit: "出口",
      },
      edgeHelp: {
        entry: "入口连线：从开始节点进入正则表达式。",
        subject: "主语连线：要匹配的内容指向组合或重复方式。",
        object: "宾语连线：组合方式指向下一个要匹配的内容。",
        exit: "出口连线：当前规则之后结束表达式。",
      },
      nodes: zhNodes,
    },
    zhNodeHelp,
  ),
  ja: createMessages({
    language: "言語",
    nouns: "一致させるもの",
    verbs: "組み合わせ",
    addLiteral: "正確な文字列",
    addClass: "この文字のどれか",
    addExcludedClass: "この文字以外",
    addAny: "任意の文字",
    addDigit: "数字",
    addNonDigit: "数字以外",
    addWord: "英数字/_",
    addNonWord: "英数字/_以外",
    addWhitespace: "空白",
    addNonWhitespace: "空白以外",
    addLineStart: "テキスト先頭",
    addLineEnd: "テキスト末尾",
    addWordBoundary: "単語境界",
    addNotWordBoundary: "非単語境界",
    addThen: "次に",
    addChooseOne: "または",
    addOneOrMore: "1回以上",
    addZeroOrMore: "0回以上",
    addOptional: "任意",
    addExactCount: "N回繰り返す",
    addRepeatAtLeast: "N回以上",
    addRepeatBetween: "N-M回",
    deleteNode: "ノード削除",
    selectionTitle: "選択",
    nodes: {
      ...englishNodes,
      start: "開始",
      end: "終了",
      literal: "正確な文字列",
      characterClass: "この文字のどれか",
      excludedCharacterClass: "この文字以外",
      nonDigitCharacter: "数字以外",
      nonWordCharacter: "英数字/_以外",
      nonWhitespaceCharacter: "空白以外",
      wordBoundary: "単語境界",
      notWordBoundary: "非単語境界",
      sequenceThen: "次に",
      chooseOne: "または",
      repeatAtLeast: "N回以上",
      repeatBetween: "N-M回",
    },
  }),
  es: createMessages({
    language: "Idioma",
    nouns: "Qué coincidir",
    verbs: "Cómo combinar",
    addLiteral: "Texto exacto",
    addClass: "Uno de estos",
    addExcludedClass: "No estos",
    addAny: "Cualquier carácter",
    addDigit: "Dígito",
    addNonDigit: "No dígito",
    addWord: "Letra/dígito/_",
    addNonWord: "No letra/dígito/_",
    addWhitespace: "Espacio",
    addNonWhitespace: "No espacio",
    addLineStart: "Inicio del texto",
    addLineEnd: "Fin del texto",
    addWordBoundary: "Límite de palabra",
    addNotWordBoundary: "No límite",
    addThen: "Luego",
    addChooseOne: "O",
    addOneOrMore: "Una o más",
    addZeroOrMore: "Cero o más",
    addOptional: "Opcional",
    addExactCount: "Repetir N",
    addRepeatAtLeast: "Repetir N+",
    addRepeatBetween: "Repetir N-M",
    deleteNode: "Eliminar nodo",
    selectionTitle: "Selección",
    nodes: {
      ...englishNodes,
      start: "Inicio",
      end: "Fin",
      literal: "Texto exacto",
      characterClass: "Uno de estos",
      excludedCharacterClass: "No estos",
      nonDigitCharacter: "No dígito",
      nonWordCharacter: "No letra/dígito/_",
      nonWhitespaceCharacter: "No espacio",
      wordBoundary: "Límite de palabra",
      notWordBoundary: "No límite de palabra",
      sequenceThen: "Luego",
      chooseOne: "O",
      repeatAtLeast: "Repetir al menos",
      repeatBetween: "Repetir entre",
    },
  }),
  "pt-BR": createMessages({
    language: "Idioma",
    nouns: "O que combinar",
    verbs: "Como combinar",
    addLiteral: "Texto exato",
    addClass: "Um destes",
    addExcludedClass: "Não estes",
    addAny: "Qualquer caractere",
    addDigit: "Dígito",
    addNonDigit: "Não dígito",
    addWord: "Letra/dígito/_",
    addNonWord: "Não letra/dígito/_",
    addWhitespace: "Espaço",
    addNonWhitespace: "Não espaço",
    addLineStart: "Início do texto",
    addLineEnd: "Fim do texto",
    addWordBoundary: "Limite de palavra",
    addNotWordBoundary: "Não limite",
    addThen: "Depois",
    addChooseOne: "Ou",
    addOneOrMore: "Uma ou mais",
    addZeroOrMore: "Zero ou mais",
    addOptional: "Opcional",
    addExactCount: "Repetir N",
    addRepeatAtLeast: "Repetir N+",
    addRepeatBetween: "Repetir N-M",
    deleteNode: "Excluir nó",
    selectionTitle: "Seleção",
    nodes: {
      ...englishNodes,
      start: "Início",
      end: "Fim",
      literal: "Texto exato",
      characterClass: "Um destes",
      excludedCharacterClass: "Não estes",
      nonDigitCharacter: "Não dígito",
      nonWordCharacter: "Não letra/dígito/_",
      nonWhitespaceCharacter: "Não espaço",
      wordBoundary: "Limite de palavra",
      notWordBoundary: "Não limite de palavra",
      sequenceThen: "Depois",
      chooseOne: "Ou",
      repeatAtLeast: "Repetir ao menos",
      repeatBetween: "Repetir entre",
    },
  }),
  ru: createMessages({
    language: "Язык",
    nouns: "Что искать",
    verbs: "Как связать",
    addLiteral: "Точный текст",
    addClass: "Один из этих",
    addExcludedClass: "Не эти",
    addAny: "Любой символ",
    addDigit: "Цифра",
    addNonDigit: "Не цифра",
    addWord: "Буква/цифра/_",
    addNonWord: "Не буква/цифра/_",
    addWhitespace: "Пробел",
    addNonWhitespace: "Не пробел",
    addLineStart: "Начало текста",
    addLineEnd: "Конец текста",
    addWordBoundary: "Граница слова",
    addNotWordBoundary: "Не граница",
    addThen: "Затем",
    addChooseOne: "Или",
    addOneOrMore: "Один+",
    addZeroOrMore: "Ноль+",
    addOptional: "Необязательно",
    addExactCount: "Повтор N",
    addRepeatAtLeast: "Повтор N+",
    addRepeatBetween: "Повтор N-M",
    deleteNode: "Удалить узел",
    selectionTitle: "Выбор",
    nodes: {
      ...englishNodes,
      start: "Старт",
      end: "Конец",
      literal: "Точный текст",
      characterClass: "Один из этих",
      excludedCharacterClass: "Не эти",
      nonDigitCharacter: "Не цифра",
      nonWordCharacter: "Не буква/цифра/_",
      nonWhitespaceCharacter: "Не пробел",
      wordBoundary: "Граница слова",
      notWordBoundary: "Не граница слова",
      sequenceThen: "Затем",
      chooseOne: "Или",
      repeatAtLeast: "Повтор минимум",
      repeatBetween: "Повтор диапазон",
    },
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
