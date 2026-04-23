/** App name constant */
export const APP_NAME = "NovaPay";

/** Stock symbols to track */
export const STOCK_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "NFLX", "RELIANCE.NS",
];

/** Metadata for each tracked stock */
export const STOCK_META = {
  AAPL: { name: "Apple Inc.", cap: "High", sector: "Technology" },
  MSFT: { name: "Microsoft Corp.", cap: "High", sector: "Technology" },
  GOOGL: { name: "Alphabet Inc.", cap: "High", sector: "Technology" },
  TSLA: { name: "Tesla Inc.", cap: "Mid", sector: "Automotive" },
  AMZN: { name: "Amazon.com Inc.", cap: "High", sector: "E-Commerce" },
  NVDA: { name: "NVIDIA Corp.", cap: "High", sector: "Semiconductors" },
  NFLX: { name: "Netflix Inc.", cap: "Mid", sector: "Streaming" },
  "RELIANCE.NS": { name: "Reliance Industries", cap: "High", sector: "Conglomerate" },
};

/** Polling interval in ms */
export const POLL_INTERVAL = 15000;

/** How many price history points to keep per stock */
export const HISTORY_LENGTH = 20;

/** LocalStorage key for watchlist */
export const WATCHLIST_KEY = "fintent_watchlist";

/** LocalStorage key for price alerts */
export const ALERTS_KEY = "fintent_alerts";

/** Finnhub base URL */
export const FINNHUB_BASE = "https://finnhub.io/api/v1";
