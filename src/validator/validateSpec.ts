import { z } from "zod";
import type { StrategySpec } from "../types/strategySpec.js";

const operandSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("price"),
    source: z.enum(["close", "open", "high", "low"])
  }),
  z.object({
    kind: z.literal("indicator"),
    name: z.string().min(1),
    line: z.string().optional()
  }),
  z.object({
    kind: z.literal("number"),
    value: z.number()
  })
]);

const specSchema = z.object({
  version: z.literal("1.0"),
  ticker: z.string().min(1),
  timeframe: z.string().min(1),
  direction: z.enum(["long", "short", "both"]),
  indicators: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(["sma", "ema", "rsi", "macd"]),
        params: z.record(z.string(), z.number())
      })
    )
    .min(1),
  longEntry: z
    .object({
      logic: z.literal("and"),
      conditions: z.array(
        z.object({
          left: operandSchema,
          op: z.enum([">", "<", ">=", "<="]),
          right: operandSchema
        })
      )
    })
    .optional(),
  shortEntry: z
    .object({
      logic: z.literal("and"),
      conditions: z.array(
        z.object({
          left: operandSchema,
          op: z.enum([">", "<", ">=", "<="]),
          right: operandSchema
        })
      )
    })
    .optional(),
  exits: z.object({
    stopLossPct: z.number().positive(),
    takeProfitPct: z.number().positive()
  })
});

export function validateSpec(spec: StrategySpec): string[] {
  const errors: string[] = [];
  const parsed = specSchema.safeParse(spec);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".") || "/"} ${issue.message}`);
    }
  }

  if (
    spec.exits.takeProfitPct <= spec.exits.stopLossPct &&
    (spec.direction === "long" || spec.direction === "both")
  ) {
    errors.push("takeProfitPct should be greater than stopLossPct for long strategies.");
  }

  if (spec.direction === "long" && !spec.longEntry) {
    errors.push("longEntry is required for direction=long.");
  }
  if (spec.direction === "short" && !spec.shortEntry) {
    errors.push("shortEntry is required for direction=short.");
  }

  return errors;
}
