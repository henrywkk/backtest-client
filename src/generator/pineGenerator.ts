import type { Condition, OperandRef, StrategySpec } from "../types/strategySpec.js";

function indicatorLine(name: string, type: string, params: Record<string, number>): string[] {
  if (type === "sma") return [`${name} = ta.sma(close, ${params.length ?? 20})`];
  if (type === "ema") return [`${name} = ta.ema(close, ${params.length ?? 20})`];
  if (type === "rsi") return [`${name} = ta.rsi(close, ${params.length ?? 14})`];
  if (type === "macd") {
    const fast = params.fastLength ?? 12;
    const slow = params.slowLength ?? 26;
    const signal = params.signalLength ?? 9;
    return [`[${name}Line, ${name}Signal, ${name}Hist] = ta.macd(close, ${fast}, ${slow}, ${signal})`];
  }
  return [];
}

function operandToPine(operand: OperandRef): string {
  if (operand.kind === "price") return operand.source;
  if (operand.kind === "number") return `${operand.value}`;
  if (operand.kind === "indicator") {
    if (operand.line && operand.name === "macd") {
      if (operand.line === "signal") return "macdSignal";
      if (operand.line === "hist") return "macdHist";
      return "macdLine";
    }
    return operand.name;
  }
  return "close";
}

function conditionToPine(condition: Condition): string {
  return `${operandToPine(condition.left)} ${condition.op} ${operandToPine(condition.right)}`;
}

export function generatePineScript(spec: StrategySpec): string {
  const lines: string[] = [];
  lines.push("//@version=5");
  lines.push(`strategy("NL Strategy - ${spec.ticker}", overlay=true, initial_capital=10000)`);
  lines.push("");
  lines.push(`// Run this script on ${spec.ticker} at ${spec.timeframe} timeframe in TradingView.`);
  lines.push("");

  for (const indicator of spec.indicators) {
    lines.push(...indicatorLine(indicator.name, indicator.type, indicator.params));
  }
  lines.push("");

  const hasLong = spec.direction === "long" || spec.direction === "both";
  const hasShort = spec.direction === "short" || spec.direction === "both";

  if (hasLong && spec.longEntry) {
    lines.push(
      `longCondition = ${spec.longEntry.conditions.map((c) => `(${conditionToPine(c)})`).join(" and ")}`
    );
    lines.push(`if (longCondition)`);
    lines.push(`    strategy.entry("Long", strategy.long)`);
    lines.push(
      `strategy.exit("Long Exit", from_entry="Long", stop=strategy.position_avg_price * (1 - ${spec.exits.stopLossPct} / 100), limit=strategy.position_avg_price * (1 + ${spec.exits.takeProfitPct} / 100))`
    );
    lines.push("");
  }

  if (hasShort && spec.shortEntry) {
    lines.push(
      `shortCondition = ${spec.shortEntry.conditions.map((c) => `(${conditionToPine(c)})`).join(" and ")}`
    );
    lines.push(`if (shortCondition)`);
    lines.push(`    strategy.entry("Short", strategy.short)`);
    lines.push(
      `strategy.exit("Short Exit", from_entry="Short", stop=strategy.position_avg_price * (1 + ${spec.exits.stopLossPct} / 100), limit=strategy.position_avg_price * (1 - ${spec.exits.takeProfitPct} / 100))`
    );
  }

  return lines.join("\n");
}
