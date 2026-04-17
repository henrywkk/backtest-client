# backtest-client

Client app that converts natural-language trading strategy prompts into TradingView Pine Script for backtesting.

## MVP scope (implemented)

- Indicators: `SMA`, `EMA`, `RSI`, `MACD`
- Entry rules: simple threshold and crossover conditions joined with `AND`
- Direction: long, short, or both
- Exits: fixed `%` stop loss and take profit
- Handoff: manual copy/paste into TradingView Pine Editor

## Architecture

1. `prompt -> strategy spec (JSON)`
2. `strategy spec -> validation`
3. `validated spec -> Pine Script`
4. `web preview UI -> manual TradingView handoff`

## Local development

1. Install dependencies:
   - `npm install`
2. Run the app:
   - `npm run dev`
3. Open:
   - [http://localhost:3000](http://localhost:3000)

## Commands

- `npm run dev` - start local web UI and API
- `npm run test` - run fixture and pipeline tests
- `npm run build` - compile TypeScript
- `npm run start` - run built output from `dist`

## Project layout

- `src/config/mvpSubset.ts` - supported strategy subset and defaults
- `src/schema/strategy-spec.v1.json` - JSON schema for strategy spec v1
- `src/parser/parseStrategyPrompt.ts` - natural-language parser
- `src/validator/validateSpec.ts` - schema + semantic validation
- `src/generator/pineGenerator.ts` - deterministic Pine generator
- `src/pipeline/buildStrategy.ts` - parser/validator/generator pipeline
- `src/fixtures/prompts.ts` - 20 prompt fixtures
- `src/server.ts` - preview UI and API endpoint
- `tests/pipeline.test.ts` - end-to-end fixture tests
