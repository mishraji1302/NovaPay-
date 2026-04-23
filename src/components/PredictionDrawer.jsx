/**
 * PredictionDrawer.jsx — Right-side drawer showing ML prediction details for a stock.
 */

import { useEffect } from "react";
import { computeRSI } from "../utils/mlPredictor.js";

function RSIGauge({ rsi }) {
  const angle = (rsi / 100) * 180 - 90;
  const rad = (angle * Math.PI) / 180;
  const cx = 80, cy = 80, r = 60;
  const endX = cx + r * Math.cos(rad);
  const endY = cy + r * Math.sin(rad);
  const color = rsi > 70 ? "var(--color-down)" : rsi < 30 ? "var(--color-up)" : "var(--color-hold)";

  return (
    <svg viewBox="0 0 160 100" width="160" height="100">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={endX} y2={endY} stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="4" fill={color} />
      <text x={cx} y={cy + 20} textAnchor="middle" fill="var(--text-primary)"
        fontSize="18" fontFamily="var(--font-mono)" fontWeight="600">{rsi}</text>
      <text x="20" y={cy + 8} fill="var(--color-up)" fontSize="9">Oversold</text>
      <text x="108" y={cy + 8} fill="var(--color-down)" fontSize="9">Overbought</text>
    </svg>
  );
}

function ConfBar({ value, direction }) {
  const color = direction === "UP" ? "var(--color-up)" : direction === "DOWN" ? "var(--color-down)" : "var(--color-hold)";
  return (
    <div className="conf-bar-track" style={{ marginTop: 6 }}>
      <div className="conf-bar-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function DirectionBadge({ direction, confidence }) {
  const cls = direction === "UP" ? "badge-up" : direction === "DOWN" ? "badge-down" : "badge-hold";
  const arrow = direction === "UP" ? "▲" : direction === "DOWN" ? "▼" : "—";
  return (
    <span className={`badge ${cls}`} style={{ fontSize: "0.9rem", padding: "4px 12px" }}>
      {arrow} {direction} {confidence}%
    </span>
  );
}

/**
 * @param {{ stock: object, prediction: object, onClose: Function }} props
 */
export default function PredictionDrawer({ stock, prediction, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!stock || !prediction) return null;

  const { modelA, modelB, shortTerm, longTerm, combinedDirection, combinedConfidence } = prediction;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)", zIndex: 300,
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)",
        background: "linear-gradient(180deg, #0d1220 0%, #080c14 100%)",
        borderLeft: "1px solid var(--border)",
        zIndex: 301, overflowY: "auto", padding: "24px",
        animation: "slideInRight2 0.3s ease",
      }}>
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", margin: 0 }}>
              {stock.symbol}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
              ML Prediction Analysis
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
            borderRadius: "8px", color: "var(--text-primary)", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
          }}>✕</button>
        </div>

        {/* Combined verdict */}
        <div className="glass" style={{ padding: "16px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 8 }}>Combined Signal</p>
          <DirectionBadge direction={combinedDirection} confidence={combinedConfidence} />
        </div>

        {/* Model A */}
        <div className="glass" style={{ padding: "16px", marginBottom: "12px" }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Model A — Linear Regression</span>
            <DirectionBadge direction={modelA.direction} confidence={modelA.confidence} />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginBottom: 8 }}>
            Slope: <span className="text-mono">{modelA.slope?.toFixed(4)}</span> per tick
          </p>
          <ConfBar value={modelA.confidence} direction={modelA.direction} />
          <div className="flex-between" style={{ marginTop: 10 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Long-term trend</span>
            <span style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: longTerm === "UP" ? "var(--color-up)" : longTerm === "DOWN" ? "var(--color-down)" : "var(--color-hold)"
            }}>{longTerm}</span>
          </div>
        </div>

        {/* Model B */}
        <div className="glass" style={{ padding: "16px", marginBottom: "12px" }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Model B — RSI Momentum</span>
            <DirectionBadge direction={modelB.direction} confidence={modelB.confidence} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
            <RSIGauge rsi={modelB.rsi} />
          </div>
          <ConfBar value={modelB.confidence} direction={modelB.direction} />
          <div className="flex-between" style={{ marginTop: 10 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Short-term signal</span>
            <span style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: shortTerm === "UP" ? "var(--color-up)" : shortTerm === "DOWN" ? "var(--color-down)" : "var(--color-hold)"
            }}>{shortTerm}</span>
          </div>
        </div>

        {/* Timeframes */}
        <div className="glass" style={{ padding: "16px", marginBottom: "12px" }}>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 10 }}>Timeframe Breakdown</p>
          <div className="flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>⚡ Short-term (1h)</span>
            <span style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: shortTerm === "UP" ? "var(--color-up)" : shortTerm === "DOWN" ? "var(--color-down)" : "var(--color-hold)"
            }}>{shortTerm}</span>
          </div>
          <div className="flex-between" style={{ padding: "8px 0" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>📈 Long-term (session+)</span>
            <span style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: longTerm === "UP" ? "var(--color-up)" : longTerm === "DOWN" ? "var(--color-down)" : "var(--color-hold)"
            }}>{longTerm}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: "12px 14px",
          background: "rgba(246,201,14,0.06)",
          border: "1px solid rgba(246,201,14,0.15)",
          borderRadius: "8px",
          fontSize: "0.75rem",
          color: "var(--color-hold)",
          lineHeight: 1.5,
        }}>
          ⚠️ Predictions are model-generated estimates based on recent price data. Not financial advice. Past performance does not guarantee future results.
        </div>
      </div>
    </>
  );
}
