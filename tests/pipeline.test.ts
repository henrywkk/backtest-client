import { describe, expect, it } from "vitest";
import { promptFixtures } from "../src/fixtures/prompts.js";
import { buildStrategyFromPrompt } from "../src/pipeline/buildStrategy.js";

describe("buildStrategyFromPrompt", () => {
  it("generates valid Pine scripts for all fixtures", () => {
    expect(promptFixtures).toHaveLength(20);

    for (const fixture of promptFixtures) {
      const result = buildStrategyFromPrompt(fixture.prompt);
      expect(result.spec.version).toBe("1.0");
      expect(result.spec.indicators.length).toBeGreaterThan(0);
      expect(result.pineScript).toContain("//@version=5");
      expect(result.pineScript).toContain("strategy(");
    }
  });

  it("applies defaults when prompt is underspecified", () => {
    const result = buildStrategyFromPrompt("Use ema crossover with stop 2% and target 4%");
    expect(result.spec.ticker).toBe("AAPL");
    expect(result.assumptions.length).toBeGreaterThan(0);
  });
});
