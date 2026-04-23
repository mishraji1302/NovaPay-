/**
 * helpers.js — Shared utility functions for NeoBank.
 */

/** Format a number as USD currency string */
export function formatCurrency(value, decimals = 2) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format large numbers with K/M/B suffixes */
export function formatVolume(value) {
  if (value == null) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** Format a percentage with sign */
export function formatPercent(value, decimals = 2) {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Clamp a value between min and max */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Debounce a function call */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Get color for a positive/negative value */
export function signColor(value) {
  if (value > 0) return "var(--color-up)";
  if (value < 0) return "var(--color-down)";
  return "var(--text-muted)";
}

/** Generate SVG path string from array of y-values */
export function sparklinePath(values, width = 200, height = 48) {
  if (!values || values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Read from localStorage safely */
export function readLS(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Write to localStorage safely */
export function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
