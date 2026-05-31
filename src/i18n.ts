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
  readonly regexFragment: string;
  readonly flowEntry: string;
  readonly flowExit: string;
}

export interface Messages {
  readonly appSubtitle: string;
  readonly nodeTools: string;
  readonly language: string;
  readonly addLiteral: string;
  readonly addClass: string;
  readonly addAny: string;
  readonly addDigit: string;
  readonly addWord: string;
  readonly addWhitespace: string;
  readonly addLineStart: string;
  readonly addLineEnd: string;
  readonly deleteNode: string;
  readonly characterClassHelp: string;
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

export const messages: Record<LanguageCode, Messages> = {
  en: {
    appSubtitle: "Bidirectional regex graph test UI",
    nodeTools: "Node tools",
    language: "Language",
    addLiteral: "Literal",
    addClass: "Class",
    addAny: "Any",
    addDigit: "Digit",
    addWord: "Word",
    addWhitespace: "Space",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "Delete node",
    characterClassHelp:
      "Character Class matches one character from a set, such as [abc] or [a-z]. It is different from a literal hyphen or connecting characters in sequence.",
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
    nodes: {
      start: "Start",
      end: "End",
      literal: "Literal",
      characterClass: "Character Class",
      anyCharacter: "Any Character",
      digitCharacter: "Digit",
      wordCharacter: "Word",
      whitespaceCharacter: "Whitespace",
      lineStart: "Line Start",
      lineEnd: "Line End",
      regexFragment: "Fragment",
      flowEntry: "flow entry",
      flowExit: "flow exit",
    },
  },
  zh: {
    appSubtitle: "双向正则图测试界面",
    nodeTools: "节点工具",
    language: "语言",
    addLiteral: "文本",
    addClass: "字符集",
    addAny: "任意",
    addDigit: "数字",
    addWord: "单词",
    addWhitespace: "空白",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "删除节点",
    characterClassHelp:
      "字符集表示“从一组字符里匹配一个字符”，例如 [abc] 或 [a-z]。它不是把字符连起来，也不是字面量连字符。",
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
    nodes: {
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
      regexFragment: "片段",
      flowEntry: "流程入口",
      flowExit: "流程出口",
    },
  },
  ja: {
    appSubtitle: "双方向正規表現グラフテスト UI",
    nodeTools: "ノードツール",
    language: "言語",
    addLiteral: "文字列",
    addClass: "文字クラス",
    addAny: "任意",
    addDigit: "数字",
    addWord: "単語",
    addWhitespace: "空白",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "ノード削除",
    characterClassHelp:
      "文字クラスは [abc] や [a-z] のように、候補の中から 1 文字を一致させます。文字を連結するものではありません。",
    regexInput: "正規表現入力",
    parseToGraph: "グラフ化",
    value: "値",
    generatedRegex: "生成された正規表現",
    testString: "テスト文字列",
    testPlaceholder: "完全一致サンプルを入力",
    empty: "（空）",
    invalidRegex: "無効な正規表現",
    fullMatch: "完全一致",
    noFullMatch: "完全一致なし",
    nodeInspector: "ノードインスペクター",
    graphCanvas: "LexiKnot グラフキャンバス",
    nodes: {
      start: "開始",
      end: "終了",
      literal: "文字列",
      characterClass: "文字クラス",
      anyCharacter: "任意文字",
      digitCharacter: "数字",
      wordCharacter: "単語文字",
      whitespaceCharacter: "空白文字",
      lineStart: "行頭",
      lineEnd: "行末",
      regexFragment: "断片",
      flowEntry: "フロー入口",
      flowExit: "フロー出口",
    },
  },
  es: {
    appSubtitle: "UI de prueba de grafo regex bidireccional",
    nodeTools: "Herramientas de nodo",
    language: "Idioma",
    addLiteral: "Literal",
    addClass: "Clase",
    addAny: "Cualquiera",
    addDigit: "Dígito",
    addWord: "Palabra",
    addWhitespace: "Espacio",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "Eliminar nodo",
    characterClassHelp:
      "Una clase de caracteres coincide con un solo carácter de un conjunto, como [abc] o [a-z]. No concatena caracteres.",
    regexInput: "Entrada regex",
    parseToGraph: "Convertir a grafo",
    value: "Valor",
    generatedRegex: "Regex generado",
    testString: "Cadena de prueba",
    testPlaceholder: "Prueba una coincidencia completa",
    empty: "(vacío)",
    invalidRegex: "Regex inválido",
    fullMatch: "Coincidencia completa",
    noFullMatch: "Sin coincidencia completa",
    nodeInspector: "Inspector de nodo",
    graphCanvas: "Lienzo de grafo LexiKnot",
    nodes: {
      start: "Inicio",
      end: "Fin",
      literal: "Literal",
      characterClass: "Clase de caracteres",
      anyCharacter: "Cualquier carácter",
      digitCharacter: "Dígito",
      wordCharacter: "Carácter de palabra",
      whitespaceCharacter: "Espacio",
      lineStart: "Inicio de línea",
      lineEnd: "Fin de línea",
      regexFragment: "Fragmento",
      flowEntry: "entrada de flujo",
      flowExit: "salida de flujo",
    },
  },
  "pt-BR": {
    appSubtitle: "UI de teste de grafo regex bidirecional",
    nodeTools: "Ferramentas de nó",
    language: "Idioma",
    addLiteral: "Literal",
    addClass: "Classe",
    addAny: "Qualquer",
    addDigit: "Dígito",
    addWord: "Palavra",
    addWhitespace: "Espaço",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "Excluir nó",
    characterClassHelp:
      "Classe de caracteres corresponde a um único caractere dentro de um conjunto, como [abc] ou [a-z]. Ela não concatena caracteres.",
    regexInput: "Entrada regex",
    parseToGraph: "Gerar grafo",
    value: "Valor",
    generatedRegex: "Regex gerada",
    testString: "Texto de teste",
    testPlaceholder: "Teste uma correspondência completa",
    empty: "(vazio)",
    invalidRegex: "Regex inválida",
    fullMatch: "Correspondência completa",
    noFullMatch: "Sem correspondência completa",
    nodeInspector: "Inspetor de nó",
    graphCanvas: "Canvas do grafo LexiKnot",
    nodes: {
      start: "Início",
      end: "Fim",
      literal: "Literal",
      characterClass: "Classe de caracteres",
      anyCharacter: "Qualquer caractere",
      digitCharacter: "Dígito",
      wordCharacter: "Caractere de palavra",
      whitespaceCharacter: "Espaço",
      lineStart: "Início da linha",
      lineEnd: "Fim da linha",
      regexFragment: "Fragmento",
      flowEntry: "entrada de fluxo",
      flowExit: "saída de fluxo",
    },
  },
  ru: {
    appSubtitle: "Тестовый интерфейс двунаправленного regex-графа",
    nodeTools: "Инструменты узлов",
    language: "Язык",
    addLiteral: "Литерал",
    addClass: "Класс",
    addAny: "Любой",
    addDigit: "Цифра",
    addWord: "Слово",
    addWhitespace: "Пробел",
    addLineStart: "^",
    addLineEnd: "$",
    deleteNode: "Удалить узел",
    characterClassHelp:
      "Класс символов совпадает с одним символом из набора, например [abc] или [a-z]. Он не соединяет символы в последовательность.",
    regexInput: "Ввод regex",
    parseToGraph: "Построить граф",
    value: "Значение",
    generatedRegex: "Сгенерированный regex",
    testString: "Тестовая строка",
    testPlaceholder: "Введите пример полного совпадения",
    empty: "(пусто)",
    invalidRegex: "Некорректный regex",
    fullMatch: "Полное совпадение",
    noFullMatch: "Нет полного совпадения",
    nodeInspector: "Инспектор узла",
    graphCanvas: "Холст графа LexiKnot",
    nodes: {
      start: "Старт",
      end: "Конец",
      literal: "Литерал",
      characterClass: "Класс символов",
      anyCharacter: "Любой символ",
      digitCharacter: "Цифра",
      wordCharacter: "Словесный символ",
      whitespaceCharacter: "Пробельный символ",
      lineStart: "Начало строки",
      lineEnd: "Конец строки",
      regexFragment: "Фрагмент",
      flowEntry: "вход потока",
      flowExit: "выход потока",
    },
  },
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
