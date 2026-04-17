export type IndicatorType = "sma" | "ema" | "rsi" | "macd";
export type Direction = "long" | "short" | "both";
export type ComparisonOperator = ">" | "<" | ">=" | "<=";

export interface PriceSeriesRef {
  kind: "price";
  source: "close" | "open" | "high" | "low";
}

export interface IndicatorSeriesRef {
  kind: "indicator";
  name: string;
  line?: string;
}

export interface NumberRef {
  kind: "number";
  value: number;
}

export type OperandRef = PriceSeriesRef | IndicatorSeriesRef | NumberRef;

export interface IndicatorConfig {
  name: string;
  type: IndicatorType;
  params: Record<string, number>;
}

export interface Condition {
  left: OperandRef;
  op: ComparisonOperator;
  right: OperandRef;
}

export interface RuleGroup {
  logic: "and";
  conditions: Condition[];
}

export interface ExitRules {
  stopLossPct: number;
  takeProfitPct: number;
}

export interface StrategySpec {
  version: "1.0";
  ticker: string;
  timeframe: string;
  direction: Direction;
  indicators: IndicatorConfig[];
  longEntry?: RuleGroup;
  shortEntry?: RuleGroup;
  exits: ExitRules;
}

export interface PipelineResult {
  spec: StrategySpec;
  warnings: string[];
  assumptions: string[];
  pineScript: string;
}
