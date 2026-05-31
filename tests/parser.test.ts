import { describe, expect, it } from "vitest";
import { testFullMatch } from "../src/parser/matcher";
import { parseRegexPattern } from "../src/parser/regexParser";

describe("regex parser", () => {
  it("turns a simple regex pattern into linear tokens", () => {
    const result = parseRegexPattern("^ab[c].\\d\\w\\s$");

    expect(result).toMatchObject({
      ok: true,
      tokens: [
        { kind: "lineStart" },
        { kind: "literal", value: "a" },
        { kind: "literal", value: "b" },
        { kind: "characterClass", value: "c" },
        { kind: "anyCharacter" },
        { kind: "digitCharacter" },
        { kind: "wordCharacter" },
        { kind: "whitespaceCharacter" },
        { kind: "lineEnd" },
      ],
    });
  });

  it("turns plus quantifiers into verb tokens", () => {
    expect(parseRegexPattern("a+")).toMatchObject({
      ok: true,
      tokens: [{ kind: "literal", value: "a" }, { kind: "oneOrMore" }],
    });
  });

  it("reports invalid regex syntax without throwing", () => {
    expect(parseRegexPattern("[abc")).toMatchObject({
      ok: false,
    });
  });

  it("tests full-string matches", () => {
    expect(testFullMatch("ab[c].", "abcx")).toMatchObject({
      isValid: true,
      isMatch: true,
    });
    expect(testFullMatch("ab[c].", "zabcx")).toMatchObject({
      isValid: true,
      isMatch: false,
    });
  });
});
