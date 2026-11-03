/**
 * useStockFeed.js — Custom hook that polls backend proxy for stock prices every 15s.
 * Uses AbortController to cancel in-flight requests on unmount.
 * No API keys are used in the client.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { STOCK_SYMBOLS, POLL_INTERVAL, HISTORY_LENGTH } from "../data/constants.js";

/** Fetch a single stock quote through the secure backend proxy */
async function fetchQuote(symbol, signal) {
  const url = `/api/stock?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { signal });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const d = await res.json();

  return {
    symbol,
    price: d.c,
    open: d.o,
    high: d.h,
    low: d.l,
    prevClose: d.pc,
    change: d.d,
    changePercent: d.dp,
    volume: d.v ?? null,
    timestamp: Date.now(),
  };
}

/**
 * Returns live stock data for all 8 tracked symbols.
 * @returns {{ stockData: Object, priceHistory: Object, loading: boolean, error: string|null, lastUpdated: number|null }}
 */
export default function useStockFeed() {
  const [stockData, setStockData] = useState({});
  const [priceHistory, setPriceHistory] = useState(() =>
    Object.fromEntries(STOCK_SYMBOLS.map((s) => [s, []]))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const fetchAll = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const results = await Promise.all(
        STOCK_SYMBOLS.map((sym) =>
          fetchQuote(sym, controller.signal).catch((err) => {
            if (err.name === "AbortError") return null;
            return { symbol: sym, error: true };
          })
        )
      );
      const now = Date.now();
      setStockData((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r && !r.error) next[r.symbol] = r;
        });
        return next;
      });
      setPriceHistory((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r && !r.error && r.price != null) {
            const hist = [...(prev[r.symbol] || []), r.price];
            next[r.symbol] = hist.slice(-HISTORY_LENGTH);
          }
        });
        return next;
      });
      setLastUpdated(now);
      setError(null);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load prices — retrying…");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchAll]);

  return { stockData, priceHistory, loading, error, lastUpdated };
}
