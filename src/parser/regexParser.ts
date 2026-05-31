import { RegExpParser, RegExpSyntaxError } from "@eslint-community/regexpp";
import type { AST } from "@eslint-community/regexpp";
import { unwrapCharacterClass } from "./regexEscapes";

export type RegexToken =
  | {
      readonly kind: "literal";
      readonly value: string;
      readonly raw: string;
    }
  | {
      readonly kind: "characterClass";
      readonly value: string;
      readonly raw: string;
    }
  | {
      readonly kind: "anyCharacter";
      readonly raw: string;
    }
  | {
      readonly kind: "regexFragment";
      readonly expression: string;
      readonly label: string;
      readonly raw: string;
    };

export interface RegexParseSuccess {
  readonly ok: true;
  readonly tokens: readonly RegexToken[];
  readonly warnings: readonly string[];
}

export interface RegexParseFailure {
  readonly ok: false;
  readonly error: string;
}

export type RegexParseResult = RegexParseSuccess | RegexParseFailure;

export function parseRegexPattern(pattern: string): RegexParseResult {
  const parser = new RegExpParser({ ecmaVersion: 2025 });

  try {
    const ast = parser.parsePattern(pattern);
    const warnings: string[] = [];

    if (ast.alternatives.length !== 1) {
      return {
        ok: true,
        tokens: [
          {
            kind: "regexFragment",
            expression: pattern,
            label: "Alternation",
            raw: pattern,
          },
        ],
        warnings: ["Alternation is represented as a single fragment in this MVP."],
      };
    }

    const tokens =
      ast.alternatives[0]?.elements.map((element) => toRegexToken(element, warnings)) ?? [];
    return { ok: true, tokens, warnings };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof RegExpSyntaxError ? error.message : "Unable to parse regex pattern.",
    };
  }
}

function toRegexToken(element: AST.Element, warnings: string[]): RegexToken {
  switch (element.type) {
    case "Character":
      return {
        kind: "literal",
        value: String.fromCodePoint(element.value),
        raw: element.raw,
      };
    case "CharacterClass":
      return {
        kind: "characterClass",
        value: unwrapCharacterClass(element.raw),
        raw: element.raw,
      };
    case "CharacterSet":
      if (element.raw === ".") {
        return { kind: "anyCharacter", raw: element.raw };
      }

      warnings.push(`${element.raw} is represented as a fragment in this MVP.`);
      return {
        kind: "regexFragment",
        expression: element.raw,
        label: "Character Set",
        raw: element.raw,
      };
    case "Quantifier":
      warnings.push(`${element.raw} is represented as a fragment in this MVP.`);
      return {
        kind: "regexFragment",
        expression: element.raw,
        label: "Quantifier",
        raw: element.raw,
      };
    case "Assertion":
      warnings.push(`${element.raw} is represented as a fragment in this MVP.`);
      return {
        kind: "regexFragment",
        expression: element.raw,
        label: "Assertion",
        raw: element.raw,
      };
    case "Backreference":
    case "CapturingGroup":
    case "ExpressionCharacterClass":
    case "Group":
      warnings.push(`${element.raw} is represented as a fragment in this MVP.`);
      return {
        kind: "regexFragment",
        expression: element.raw,
        label: element.type,
        raw: element.raw,
      };
  }
}
