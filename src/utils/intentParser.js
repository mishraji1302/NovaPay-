/**
 * intentParser.js — Client-side NLP intent classifier for Finn chatbot.
 * Classifies common queries without an API call.
 */

import { STOCK_META, STOCK_SYMBOLS } from "../data/constants.js";

const INTENTS = {
  PRICE_QUERY: "PRICE_QUERY",
  TRENDING_UP: "TRENDING_UP",
  TRENDING_DOWN: "TRENDING_DOWN",
  PREDICTION_QUERY: "PREDICTION_QUERY",
  WATCHLIST_QUERY: "WATCHLIST_QUERY",
  UNKNOWN: "UNKNOWN",
};

/** Detect a stock symbol or name mention in text */
function detectSymbol(text) {
  const upper = text.toUpperCase();
  for (const sym of STOCK_SYMBOLS) {
    if (upper.includes(sym.toUpperCase())) return sym;
  }
  for (const [sym, meta] of Object.entries(STOCK_META)) {
    const nameParts = meta.name.toLowerCase().split(" ");
    if (nameParts.some((p) => p.length > 3 && text.toLowerCase().includes(p))) return sym;
  }
  return null;
}

/**
 * Parse intent from user message.
 * @param {string} message - Raw user message
 * @returns {{ intent: string, symbol: string|null }}
 */
export function parseIntent(message) {
  const text = message.toLowerCase().trim();
  const symbol = detectSymbol(text);

  // Watchlist
  if (/watchlist|saved stock|my stock|my watch/.test(text)) {
    return { intent: INTENTS.WATCHLIST_QUERY, symbol: null };
  }

  // Trending up
  if (/going up|rising|best perform|top gainer|bullish|highest gain/.test(text)) {
    return { intent: INTENTS.TRENDING_UP, symbol: null };
  }

  // Trending down
  if (/falling|going down|worst|top loser|bearish|dropping|declining/.test(text)) {
    return { intent: INTENTS.TRENDING_DOWN, symbol: null };
  }

  // Prediction
  if (/predict|will .* go|forecast|outlook|should i buy|should i sell|recommendation/.test(text)) {
    return { intent: INTENTS.PREDICTION_QUERY, symbol };
  }

  // Price query
  if (symbol && /price|how much|worth|trading at|current|value|cost/.test(text)) {
    return { intent: INTENTS.PRICE_QUERY, symbol };
  }
  if (symbol && /^(what is|what's|whats|show me|tell me) /.test(text)) {
    return { intent: INTENTS.PRICE_QUERY, symbol };
  }

  return { intent: INTENTS.UNKNOWN, symbol };
}

/**
 * Resolve a known intent to a response string using live data.
 * @param {{ intent: string, symbol: string|null }} parsed
 * @param {Object} stockData - Live stock data map keyed by symbol
 * @param {Object} predictions - ML predictions map keyed by symbol
 * @param {string[]} watchlist - Array of watchlisted symbols
 * @returns {string|null} Response string, or null if UNKNOWN (needs API)
 */
export function resolveIntent(parsed, stockData, predictions, watchlist) {
  const { intent, symbol } = parsed;
  const fmt = (n) => (n == null ? "N/A" : `$${Number(n).toFixed(2)}`);
  const fmtPct = (n) => (n == null ? "N/A" : `${n > 0 ? "+" : ""}${Number(n).toFixed(2)}%`);

  if (intent === INTENTS.PRICE_QUERY && symbol) {
    const s = stockData?.[symbol];
    if (!s) return `I don't have live data for ${symbol} right now.`;
    return `**${symbol}** (${STOCK_META[symbol]?.name}) is trading at **${fmt(s.price)}** — ${fmtPct(s.changePercent)} today. Day range: ${fmt(s.low)} – ${fmt(s.high)}.`;
  }

  if (intent === INTENTS.TRENDING_UP) {
    const up = Object.entries(stockData || {})
      .filter(([, s]) => s.changePercent > 0)
      .sort((a, b) => b[1].changePercent - a[1].changePercent)
      .slice(0, 3);
    if (!up.length) return "No stocks are currently gaining today.";
    return "**Top gainers today:**\n" + up.map(([sym, s]) => `• ${sym}: ${fmt(s.price)} (${fmtPct(s.changePercent)})`).join("\n");
  }

  if (intent === INTENTS.TRENDING_DOWN) {
    const down = Object.entries(stockData || {})
      .filter(([, s]) => s.changePercent < 0)
      .sort((a, b) => a[1].changePercent - b[1].changePercent)
      .slice(0, 3);
    if (!down.length) return "No stocks are declining today.";
    return "**Biggest losers today:**\n" + down.map(([sym, s]) => `• ${sym}: ${fmt(s.price)} (${fmtPct(s.changePercent)})`).join("\n");
  }

  if (intent === INTENTS.PREDICTION_QUERY) {
    if (symbol) {
      const pred = predictions?.[symbol];
      if (!pred) return `No prediction data available for ${symbol} yet.`;
      return `**${symbol} Prediction:**\n• Short-term: **${pred.shortTerm}** (${pred.modelB.confidence}% confidence)\n• Long-term: **${pred.longTerm}** (${pred.modelA.confidence}% confidence)\n• RSI: ${pred.modelB.rsi}\n\n_These are model-generated estimates. Not financial advice._`;
    }
    return "Which stock would you like a prediction for? (e.g. 'predict AAPL')";
  }

  if (intent === INTENTS.WATCHLIST_QUERY) {
    if (!watchlist?.length) return "Your watchlist is empty. Star a stock to add it!";
    const items = watchlist.map((sym) => {
      const s = stockData?.[sym];
      return `• ${sym}: ${s ? fmt(s.price) + ` (${fmtPct(s.changePercent)})` : "loading..."}`;
    });
    return "**Your Watchlist:**\n" + items.join("\n");
  }

  return null; // UNKNOWN → fall through to API
}

export { INTENTS };
