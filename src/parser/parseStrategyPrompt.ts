import { MVP_DEFAULTS } from "../config/mvpSubset.js";
import type {
  ComparisonOperator,
  Condition,
  Direction,
  IndicatorConfig,
  StrategySpec
} from "../types/strategySpec.js";

const TICKER_RE = /\b([A-Z]{1,5}(?::[A-Z]{1,10})?)\b/;
const TIMEFRAME_RE = /\b(1m|5m|15m|30m|1h|4h|1d|1w)\b/i;
const PCT_RE = /(\d+(?:\.\d+)?)\s*%/g;

function pickTicker(prompt: string): string {
  const found = prompt.match(TICKER_RE)?.[1];
  return found ?? "AAPL";
}

function pickTimeframe(prompt: string): string {
  const found = prompt.match(TIMEFRAME_RE)?.[1];
  return (found ?? MVP_DEFAULTS.timeframe).toUpperCase();
}

function pickDirection(prompt: string): Direction {
  const p = prompt.toLowerCase();
  if (p.includes("long and short") || p.includes("both directions")) return "both";
  if (p.includes("short")) return "short";
  if (p.includes("long")) return "long";
  return MVP_DEFAULTS.direction;
}

function parseExits(prompt: string): { stopLossPct: number; takeProfitPct: number } {
  const matches = [...prompt.matchAll(PCT_RE)].map((m) => Number(m[1]));
  if (matches.length >= 2) {
    return { stopLossPct: matches[0], takeProfitPct: matches[1] };
  }
  return {
    stopLossPct: MVP_DEFAULTS.stopLossPct,
    takeProfitPct: MVP_DEFAULTS.takeProfitPct
  };
}

function buildIndicators(prompt: string): IndicatorConfig[] {
  const p = prompt.toLowerCase();
  const indicators: IndicatorConfig[] = [];

  if (p.includes("sma")) {
    indicators.push({ name: "fastSma", type: "sma", params: { length: 20 } });
  }
  if (p.includes("ema")) {
    indicators.push({ name: "fastEma", type: "ema", params: { length: 20 } });
    indicators.push({ name: "slowEma", type: "ema", params: { length: 50 } });
  }
  if (p.includes("rsi")) {
    indicators.push({ name: "rsi", type: "rsi", params: { length: 14 } });
  }
  if (p.includes("macd")) {
    indicators.push({
      name: "macd",
      type: "macd",
      params: { fastLength: 12, slowLength: 26, signalLength: 9 }
    });
  }

  if (indicators.length === 0) {
    indicators.push({ name: "fastEma", type: "ema", params: { length: 20 } });
    indicators.push({ name: "slowEma", type: "ema", params: { length: 50 } });
  }

  return indicators;
}

function crossoverCondition(prompt: string): Condition | undefined {
  const p = prompt.toLowerCase();
  if (
    p.includes("ema crossover") ||
    p.includes("ema cross") ||
    p.includes("cross above slow ema")
  ) {
    return {
      left: { kind: "indicator", name: "fastEma" },
      op: ">",
      right: { kind: "indicator", name: "slowEma" }
    };
  }
  if (p.includes("sma crossover") || p.includes("sma cross")) {
    return {
      left: { kind: "price", source: "close" },
      op: ">",
      right: { kind: "indicator", name: "fastSma" }
    };
  }
  return undefined;
}

function rsiThresholdCondition(prompt: string, direction: Direction): Condition | undefined {
  const p = prompt.toLowerCase();
  if (!p.includes("rsi")) return undefined;

  const rsiNumber = p.match(/rsi\s*(?:above|over|>|below|under|<)?\s*(\d{1,2})/)?.[1];
  const level = rsiNumber ? Number(rsiNumber) : direction === "short" ? 70 : 30;
  const op: ComparisonOperator =
    p.includes("below") || p.includes("under") || p.includes("<") ? "<" : ">";

  return {
    left: { kind: "indicator", name: "rsi" },
    op,
    right: { kind: "number", value: level }
  };
}

export function parseStrategyPrompt(prompt: string): {
  spec: StrategySpec;
  assumptions: string[];
} {
  const ticker = pickTicker(prompt);
  const timeframe = pickTimeframe(prompt);
  const direction = pickDirection(prompt);
  const exits = parseExits(prompt);
  const indicators = buildIndicators(prompt);

  const assumptions: string[] = [];
  if (!prompt.match(TICKER_RE)) assumptions.push("Ticker was not explicit; defaulted to AAPL.");
  if (!prompt.match(TIMEFRAME_RE))
    assumptions.push(`Timeframe was not explicit; defaulted to ${MVP_DEFAULTS.timeframe}.`);

  const conditions: Condition[] = [];
  const cross = crossoverCondition(prompt);
  if (cross) conditions.push(cross);
  const rsi = rsiThresholdCondition(prompt, direction);
  if (rsi) conditions.push(rsi);
  if (conditions.length === 0) {
    conditions.push({
      left: { kind: "price", source: "close" },
      op: ">",
      right: { kind: "indicator", name: indicators[0].name }
    });
    assumptions.push("No explicit entry rule found; used close > first indicator.");
  }

  const spec: StrategySpec = {
    version: "1.0",
    ticker,
    timeframe,
    direction,
    indicators,
    exits
  };

  if (direction === "long" || direction === "both") {
    spec.longEntry = { logic: "and", conditions };
  }
  if (direction === "short" || direction === "both") {
    spec.shortEntry = {
      logic: "and",
      conditions: conditions.map((condition) => ({
        ...condition,
        op: condition.op === ">" ? "<" : condition.op === "<" ? ">" : condition.op
      }))
    };
  }

  return { spec, assumptions };
}
