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

  it("turns common regex usage into natural-language tokens", () => {
    expect(parseRegexPattern("a|b")).toMatchObject({
      ok: true,
      tokens: [
        { kind: "literal", value: "a" },
        { kind: "chooseOne" },
        { kind: "literal", value: "b" },
      ],
    });
    expect(parseRegexPattern("[^abc]")).toMatchObject({
      ok: true,
      tokens: [{ kind: "excludedCharacterClass", value: "abc" }],
    });
    expect(parseRegexPattern("a*b?c{3}")).toMatchObject({
      ok: true,
      tokens: [
        { kind: "literal", value: "a" },
        { kind: "zeroOrMore" },
        { kind: "literal", value: "b" },
        { kind: "optional" },
        { kind: "literal", value: "c" },
        { kind: "exactCount", count: "3" },
      ],
    });
    expect(parseRegexPattern("\\D\\W\\S\\b\\B")).toMatchObject({
      ok: true,
      tokens: [
        { kind: "nonDigitCharacter" },
        { kind: "nonWordCharacter" },
        { kind: "nonWhitespaceCharacter" },
        { kind: "wordBoundary" },
        { kind: "notWordBoundary" },
      ],
    });
    expect(parseRegexPattern("a{2,}b{2,5}")).toMatchObject({
      ok: true,
      tokens: [
        { kind: "literal", value: "a" },
        { kind: "repeatAtLeast", min: "2" },
        { kind: "literal", value: "b" },
        { kind: "repeatBetween", min: "2", max: "5" },
      ],
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
