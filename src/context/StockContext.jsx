/**
 * StockContext.jsx — Single shared context for live stock data, predictions, and watchlist.
 * All consumers read from one source — zero duplicate fetches.
 */

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import useStockFeed from "../hooks/useStockFeed.js";
import useWatchlist from "../hooks/useWatchlist.js";
import { predictStock } from "../utils/mlPredictor.js";
import { ALERTS_KEY } from "../data/constants.js";
import { readLS, writeLS } from "../utils/helpers.js";

const StockContext = createContext(null);

/** Provider component — wrap the app with this */
export function StockProvider({ children }) {
  const { stockData, priceHistory, loading, error, lastUpdated } = useStockFeed();
  const watchlistApi = useWatchlist();

  // Alerts state: { [symbol]: targetPrice }
  const [alerts, setAlerts] = useState(() => readLS(ALERTS_KEY, {}));

  const setAlert = useCallback((symbol, price) => {
    setAlerts((prev) => {
      const next = { ...prev, [symbol]: price };
      writeLS(ALERTS_KEY, next);
      return next;
    });
  }, []);

  const removeAlert = useCallback((symbol) => {
    setAlerts((prev) => {
      const next = { ...prev };
      delete next[symbol];
      writeLS(ALERTS_KEY, next);
      return next;
    });
  }, []);

  // Memoize predictions — only recalculate when priceHistory changes
  const predictions = useMemo(() => {
    const result = {};
    for (const [sym, hist] of Object.entries(priceHistory)) {
      result[sym] = predictStock(hist);
    }
    return result;
  }, [priceHistory]);

  const value = {
    stockData,
    priceHistory,
    predictions,
    loading,
    error,
    lastUpdated,
    alerts,
    setAlert,
    removeAlert,
    ...watchlistApi,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

/** Hook to consume the stock context */
export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used within StockProvider");
  return ctx;
}
