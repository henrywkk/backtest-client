export interface PromptFixture {
  id: string;
  prompt: string;
}

export const promptFixtures: PromptFixture[] = [
  { id: "p01", prompt: "Backtest AAPL 1D long strategy with EMA crossover and 2% stop, 4% take profit." },
  { id: "p02", prompt: "Test NVDA on 4h with RSI above 55 for long entries, stop 1.5% and target 3%." },
  { id: "p03", prompt: "Use TSLA 1h short strategy when RSI above 70, SL 2%, TP 5%." },
  { id: "p04", prompt: "MSFT 15m long and short using ema cross, risk 1% and reward 2%." },
  { id: "p05", prompt: "Backtest AMD 1D with SMA crossover and exits 3% stop and 6% take profit." },
  { id: "p06", prompt: "GOOGL 30m long only, RSI under 35 then buy, 2% stop 5% target." },
  { id: "p07", prompt: "META 1W ema cross strategy long with stop 4% and TP 8%." },
  { id: "p08", prompt: "SPY 1D both directions macd + rsi system with 2% stop and 4% take." },
  { id: "p09", prompt: "QQQ 1h long strategy, ema crossover, 1% stop loss and 2.5% profit target." },
  { id: "p10", prompt: "BTCUSD 4h short strategy based on RSI above 65, stop 2% and target 3.5%." },
  { id: "p11", prompt: "ETHUSD 1h both directions with ema cross and 1.2% stop, 2.4% take profit." },
  { id: "p12", prompt: "Backtest AMZN daily with RSI above 60 and EMA trend filter, stop 2%, TP 4%." },
  { id: "p13", prompt: "NFLX 5m long strategy when close above sma, 0.8% stop and 1.6% TP." },
  { id: "p14", prompt: "INTC 1D short only with EMA crossover down, stop loss 2% take 3%." },
  { id: "p15", prompt: "Coinbase ticker COIN 1h long setup with RSI below 30 then buy, stop 2% tp 5%." },
  { id: "p16", prompt: "Backtest JPM 4h both directions with macd and rsi, 1.5% SL and 3% TP." },
  { id: "p17", prompt: "AAPL 1D long strategy using SMA and RSI, 2% stop 4% target." },
  { id: "p18", prompt: "TSM 30m short strategy when close below ema, stop 1% and target 2%." },
  { id: "p19", prompt: "BABA 1W long and short EMA crossover strategy with 3% stop and 6% TP." },
  { id: "p20", prompt: "UBER 1h long strategy with RSI above 52 and 1.2% stop plus 2.2% take profit." }
];
