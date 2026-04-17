import { generatePineScript } from "../generator/pineGenerator.js";
import { parseStrategyPrompt } from "../parser/parseStrategyPrompt.js";
import type { PipelineResult } from "../types/strategySpec.js";
import { validateSpec } from "../validator/validateSpec.js";

export function buildStrategyFromPrompt(prompt: string): PipelineResult {
  const { spec, assumptions } = parseStrategyPrompt(prompt);
  const validationErrors = validateSpec(spec);
  if (validationErrors.length > 0) {
    throw new Error(`Strategy validation failed: ${validationErrors.join("; ")}`);
  }

  const pineScript = generatePineScript(spec);
  const warnings: string[] = [];

  if (assumptions.length > 0) {
    warnings.push("Prompt required defaults. Review assumptions before backtesting.");
  }

  return {
    spec,
    assumptions,
    warnings,
    pineScript
  };
}
