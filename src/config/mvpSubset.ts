export const MVP_SUBSET = {
  indicators: ["sma", "ema", "rsi", "macd"],
  entryRules: ["crossovers", "threshold comparisons", "and-joined conditions"],
  exits: ["fixed stop loss %", "fixed take profit %"],
  timeframe: "single timeframe per strategy",
  direction: ["long", "short", "both"]
} as const;

export const MVP_DEFAULTS = {
  timeframe: "1D",
  direction: "long",
  stopLossPct: 2,
  takeProfitPct: 4
} as const;
