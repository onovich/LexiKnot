import { describe, expect, it } from "vitest";

describe("project scaffold", () => {
  it("runs the initial test harness", () => {
    expect("LexiKnot").toMatch(/^Lexi/);
  });
});
