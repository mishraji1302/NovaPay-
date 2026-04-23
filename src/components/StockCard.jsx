/**
 * StockCard.jsx — Glassmorphism card showing live stock price, ML prediction badge, watchlist star.
 */

import { memo, useMemo, useState, useRef, useEffect } from "react";
import { STOCK_META } from "../data/constants.js";
import { formatCurrency, formatPercent, formatVolume, sparklinePath } from "../utils/helpers.js";
import { useStock } from "../context/StockContext.jsx";
import PredictionDrawer from "./PredictionDrawer.jsx";

function PredictionBadge({ prediction, onClick }) {
  if (!prediction) return null;
  const { combinedDirection: dir, combinedConfidence: conf } = prediction;
  const cls = dir === "UP" ? "badge-up" : dir === "DOWN" ? "badge-down" : "badge-hold";
  const arrow = dir === "UP" ? "▲" : dir === "DOWN" ? "▼" : "—";
  return (
    <button
      className={`badge ${cls}`}
      onClick={onClick}
      title="Click for ML analysis"
      style={{ cursor: "pointer", border: "none", marginTop: 8 }}
    >
      {arrow} {dir} {conf}%
    </button>
  );
}

/**
 * @param {{ symbol: string, history: number[] }} props
 */
const StockCard = memo(function StockCard({ symbol, history }) {
  const { stockData, predictions, isWishlisted, toggleStock, lastUpdated } = useStock();
  const stock = stockData[symbol];
  const prediction = predictions[symbol];
  const [showDrawer, setShowDrawer] = useState(false);
  const [flashClass, setFlashClass] = useState("");
  const prevPrice = useRef(null);

  // Flash animation on price change
  useEffect(() => {
    if (!stock?.price) return;
    if (prevPrice.current !== null && prevPrice.current !== stock.price) {
      const cls = stock.price > prevPrice.current ? "flash-up" : "flash-down";
      setFlashClass(cls);
      const t = setTimeout(() => setFlashClass(""), 700);
      return () => clearTimeout(t);
    }
    prevPrice.current = stock.price;
  }, [stock?.price]);

  const isStale = lastUpdated && Date.now() - lastUpdated > 20000;
  const meta = STOCK_META[symbol] || {};
  const wishlisted = isWishlisted(symbol);

  const sparkData = useMemo(() => history?.slice(-20) || [], [history]);
  const sparkPath = useMemo(() => sparklinePath(sparkData, 200, 48), [sparkData]);
  const sparkColor = stock?.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)";

  if (!stock) {
    return (
      <div className="glass glass-hover" style={{ padding: "20px", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`glass glass-hover ${flashClass}`}
        style={{
          padding: "18px 20px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Header row */}
        <div className="flex-between">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="text-mono" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-accent)" }}>
                {symbol}
              </span>
              <span className={`live-dot ${isStale ? "stale" : "fresh"}`} title={isStale ? "Stale data" : "Live"} />
            </div>
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: 0 }}>{meta.name}</p>
          </div>
          <button
            onClick={() => toggleStock(symbol)}
            title={wishlisted ? "Remove from watchlist" : "Add to watchlist"}
            style={{
              background: "none", border: "none",
              fontSize: "1.2rem", color: wishlisted ? "#f6c90e" : "var(--text-muted)",
              transition: "color var(--transition), transform var(--transition)",
              transform: wishlisted ? "scale(1.1)" : "scale(1)",
            }}
          >
            {wishlisted ? "★" : "☆"}
          </button>
        </div>

        {/* Price */}
        <div style={{ marginTop: 8 }}>
          <div className="text-mono" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
            {formatCurrency(stock.price)}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: stock.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)" }}>
              {formatPercent(stock.changePercent)}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {stock.change >= 0 ? "+" : ""}{formatCurrency(stock.change)}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparkPath && (
          <div style={{ margin: "8px 0" }}>
            <svg viewBox="0 0 200 48" width="100%" height="48" style={{ overflow: "visible" }}>
              <path d={sparkPath} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${sparkPath} L200,48 L0,48 Z`} fill={sparkColor} opacity="0.08" />
            </svg>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
          {[
            { label: "High", value: formatCurrency(stock.high) },
            { label: "Low", value: formatCurrency(stock.low) },
            { label: "Open", value: formatCurrency(stock.open) },
            { label: "Vol", value: formatVolume(stock.volume) },
          ].map(({ label, value }) => (
            <div key={label} style={{ fontSize: "0.75rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{label}: </span>
              <span className="text-mono" style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ML prediction badge */}
        <PredictionBadge prediction={prediction} onClick={() => setShowDrawer(true)} />

        {/* Cap tier chip */}
        <span style={{
          position: "absolute", top: 14, right: 44,
          fontSize: "0.66rem", fontWeight: 700,
          padding: "2px 6px", borderRadius: "4px",
          background: meta.cap === "High" ? "rgba(0,229,255,0.1)" : "rgba(246,201,14,0.1)",
          color: meta.cap === "High" ? "var(--color-up)" : "var(--color-hold)",
          border: `1px solid ${meta.cap === "High" ? "rgba(0,229,255,0.2)" : "rgba(246,201,14,0.2)"}`,
        }}>
          {meta.cap}
        </span>
      </div>

      {showDrawer && (
        <PredictionDrawer
          stock={{ symbol, ...stock }}
          prediction={prediction}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </>
  );
});

export default StockCard;
