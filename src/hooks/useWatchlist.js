/**
 * useWatchlist.js — Manages the user's stock watchlist via localStorage.
 */

import { useState, useCallback } from "react";
import { WATCHLIST_KEY } from "../data/constants.js";
import { readLS, writeLS } from "../utils/helpers.js";

/**
 * Hook for managing the watchlist (max 8 stocks).
 * @returns {{ watchlist: string[], addStock: Function, removeStock: Function, isWishlisted: Function, toggleStock: Function }}
 */
export default function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => readLS(WATCHLIST_KEY, []));

  const addStock = useCallback((symbol) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol) || prev.length >= 8) return prev;
      const next = [...prev, symbol];
      writeLS(WATCHLIST_KEY, next);
      return next;
    });
  }, []);

  const removeStock = useCallback((symbol) => {
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== symbol);
      writeLS(WATCHLIST_KEY, next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (symbol) => watchlist.includes(symbol),
    [watchlist]
  );

  const toggleStock = useCallback(
    (symbol) => {
      if (watchlist.includes(symbol)) removeStock(symbol);
      else addStock(symbol);
    },
    [watchlist, addStock, removeStock]
  );

  return { watchlist, addStock, removeStock, isWishlisted, toggleStock };
}
