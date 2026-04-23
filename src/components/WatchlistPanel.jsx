/**
 * WatchlistPanel.jsx — Slide-in left drawer showing watchlisted stocks with alerts.
 */

import { useState } from "react";
import { STOCK_META, ALERTS_KEY } from "../data/constants.js";
import { useStock } from "../context/StockContext.jsx";
import { formatCurrency, formatPercent } from "../utils/helpers.js";
import { useToast } from "./ToastNotification.jsx";

function AlertPopover({ symbol, currentPrice, onClose }) {
  const { setAlert, removeAlert, alerts } = useStock();
  const [value, setValue] = useState(alerts[symbol] || "");

  const handleSave = () => {
    const price = parseFloat(value);
    if (!isNaN(price) && price > 0) {
      setAlert(symbol, price);
      onClose();
    }
  };

  return (
    <div style={{
      position: "absolute", right: 0, top: "110%",
      background: "#0d1220", border: "1px solid var(--border-accent)",
      borderRadius: "10px", padding: "14px", zIndex: 20, width: 220,
      boxShadow: "var(--shadow-card)",
    }}>
      <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 8 }}>🔔 Price Alert — {symbol}</p>
      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 8 }}>
        Current: {formatCurrency(currentPrice)}
      </p>
      <input
        type="number"
        placeholder="Target price…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%", background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--border)", borderRadius: 6,
          color: "var(--text-primary)", padding: "6px 10px",
          fontSize: "0.85rem", marginBottom: 8,
        }}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
        autoFocus
      />
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={handleSave} style={{
          flex: 1, background: "var(--color-accent)", color: "#000",
          border: "none", borderRadius: 6, padding: "6px", fontSize: "0.8rem", fontWeight: 700,
        }}>Set</button>
        {alerts[symbol] && (
          <button onClick={() => { removeAlert(symbol); onClose(); }} style={{
            flex: 1, background: "rgba(255,77,109,0.15)", color: "var(--color-down)",
            border: "1px solid rgba(255,77,109,0.2)", borderRadius: 6, padding: "6px", fontSize: "0.8rem",
          }}>Clear</button>
        )}
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "6px 10px", color: "var(--text-secondary)", fontSize: "0.8rem",
        }}>✕</button>
      </div>
    </div>
  );
}

function WatchlistRow({ symbol }) {
  const { stockData, removeStock, alerts } = useStock();
  const { addToast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const stock = stockData[symbol];
  const meta = STOCK_META[symbol] || {};
  const hasAlert = !!alerts[symbol];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 8,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid var(--border)",
      position: "relative",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="text-mono" style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-accent)" }}>
            {symbol}
          </span>
          {hasAlert && (
            <span title={`Alert at ${formatCurrency(alerts[symbol])}`} style={{ fontSize: "0.7rem" }}>🔔</span>
          )}
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {meta.name}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="text-mono" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          {stock ? formatCurrency(stock.price) : "—"}
        </div>
        {stock && (
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: stock.changePercent >= 0 ? "var(--color-up)" : "var(--color-down)" }}>
            {formatPercent(stock.changePercent)}
          </div>
        )}
      </div>
      <button
        onClick={() => setShowAlert((v) => !v)}
        title="Set price alert"
        style={{
          background: hasAlert ? "rgba(246,201,14,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${hasAlert ? "rgba(246,201,14,0.2)" : "var(--border)"}`,
          borderRadius: 6, color: hasAlert ? "var(--color-hold)" : "var(--text-secondary)",
          padding: "4px 6px", fontSize: "0.8rem", flexShrink: 0,
        }}
      >🔔</button>
      <button
        onClick={() => removeStock(symbol)}
        title="Remove from watchlist"
        style={{
          background: "none", border: "none",
          color: "var(--text-muted)", fontSize: "1rem", flexShrink: 0,
          transition: "color var(--transition)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-down)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
      >★</button>
      {showAlert && (
        <AlertPopover
          symbol={symbol}
          currentPrice={stock?.price}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

/**
 * @param {{ open: boolean, onClose: Function }} props
 */
export default function WatchlistPanel({ open, onClose }) {
  const { watchlist } = useStock();

  const highCap = watchlist.filter((s) => STOCK_META[s]?.cap === "High");
  const midCap = watchlist.filter((s) => STOCK_META[s]?.cap === "Mid");

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)", zIndex: 200,
        }} />
      )}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "min(340px, 100vw)",
        background: "linear-gradient(180deg, #0d1220 0%, #080c14 100%)",
        borderRight: "1px solid var(--border)",
        zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 300ms ease",
        overflowY: "auto",
        padding: "24px 16px",
      }}>
        <div className="flex-between" style={{ marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              ⭐ Watchlist
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>
              {watchlist.length} / 8 stocks
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text-primary)", width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {watchlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>☆</div>
            <p style={{ fontSize: "0.85rem" }}>Your watchlist is empty.<br />Star a stock to get started.</p>
          </div>
        ) : (
          <>
            {highCap.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-up)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  🔵 High Cap
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {highCap.map((sym) => <WatchlistRow key={sym} symbol={sym} />)}
                </div>
              </div>
            )}
            {midCap.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-hold)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  🟡 Mid Cap
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {midCap.map((sym) => <WatchlistRow key={sym} symbol={sym} />)}
                </div>
              </div>
            )}
            {highCap.length === 0 && midCap.length === 0 && (
              <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textAlign: "center", padding: 20 }}>
                No low-cap stocks tracked.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
