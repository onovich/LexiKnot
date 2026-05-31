import { describe, expect, it } from "vitest";
import { messages, resolveLanguage, supportedLanguages } from "../src/i18n";

describe("i18n language resolution", () => {
  it("uses exact supported browser language matches", () => {
    expect(resolveLanguage(["pt-BR"])).toBe("pt-BR");
    expect(resolveLanguage(["ru"])).toBe("ru");
  });

  it("falls back from browser locale variants to supported language groups", () => {
    expect(resolveLanguage(["zh-CN"])).toBe("zh");
    expect(resolveLanguage(["ja-JP"])).toBe("ja");
    expect(resolveLanguage(["es-MX"])).toBe("es");
    expect(resolveLanguage(["pt-PT"])).toBe("pt-BR");
    expect(resolveLanguage(["ru-RU"])).toBe("ru");
  });

  it("falls back to English when no supported language is present", () => {
    expect(resolveLanguage(["fr-FR"])).toBe("en");
  });

  it("has messages for every supported language", () => {
    for (const language of supportedLanguages) {
      expect(messages[language].parseToGraph.length).toBeGreaterThan(0);
      expect(messages[language].nodes.literal.length).toBeGreaterThan(0);
    }
  });
});
