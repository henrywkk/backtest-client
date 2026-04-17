import { createServer } from "node:http";
import { buildStrategyFromPrompt } from "./pipeline/buildStrategy.js";
import { MVP_SUBSET } from "./config/mvpSubset.js";

const port = Number(process.env.PORT ?? 3000);

function pageHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TradingView Strategy App</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; max-width: 1000px; }
    textarea { width: 100%; min-height: 120px; }
    pre { background: #f5f5f5; padding: 12px; white-space: pre-wrap; border-radius: 8px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .muted { color: #666; }
    button { padding: 10px 14px; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>TradingView Strategy App (MVP)</h1>
  <p class="muted">Supported subset: ${MVP_SUBSET.indicators.join(", ")} | exits: ${MVP_SUBSET.exits.join(", ")}</p>
  <textarea id="prompt">Backtest AAPL 1D long strategy with EMA crossover and 2% stop, 4% take profit.</textarea>
  <br />
  <button id="generate">Generate Pine Script</button>
  <h2>Manual TradingView Handoff</h2>
  <ol>
    <li>Open TradingView and launch Pine Editor.</li>
    <li>Paste generated script into editor and click Add to chart.</li>
    <li>Open Strategy Tester to review backtest metrics.</li>
  </ol>
  <div class="row">
    <div>
      <h3>Assumptions / Warnings</h3>
      <pre id="notes"></pre>
      <h3>Parsed Strategy Spec</h3>
      <pre id="spec"></pre>
    </div>
    <div>
      <h3>Pine Script</h3>
      <pre id="pine"></pre>
    </div>
  </div>
  <script>
    const button = document.getElementById("generate");
    const promptEl = document.getElementById("prompt");
    const notesEl = document.getElementById("notes");
    const specEl = document.getElementById("spec");
    const pineEl = document.getElementById("pine");

    button.addEventListener("click", async () => {
      notesEl.textContent = "Generating...";
      specEl.textContent = "";
      pineEl.textContent = "";

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptEl.value })
      });
      const data = await response.json();

      if (!response.ok) {
        notesEl.textContent = data.error || "Failed to generate strategy.";
        return;
      }

      notesEl.textContent = [...data.warnings, ...data.assumptions].join("\\n") || "No warnings.";
      specEl.textContent = JSON.stringify(data.spec, null, 2);
      pineEl.textContent = data.pineScript;
    });
  </script>
</body>
</html>`;
}

function sendJson(res: import("node:http").ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

const server = createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: "Missing URL." });
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(pageHtml());
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body) as { prompt?: string };
        if (!payload.prompt || payload.prompt.trim().length === 0) {
          sendJson(res, 400, { error: "Prompt is required." });
          return;
        }

        const result = buildStrategyFromPrompt(payload.prompt);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : "Invalid request payload."
        });
      }
    });
    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TradingView strategy app listening on http://localhost:${port}`);
});
