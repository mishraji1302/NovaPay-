import { useState, useMemo } from "react";
import { STOCK_SYMBOLS, STOCK_META } from "../data/constants.js";
import { useStock } from "../context/StockContext.jsx";
import StockCard from "../components/StockCard.jsx";
import { sparklinePath } from "../utils/helpers.js";

const CAPS = ["All", "High", "Mid"];
const SORTS = [
  { label: "Price ↑", key: "price", dir: 1 },
  { label: "Price ↓", key: "price", dir: -1 },
  { label: "% ↑", key: "changePercent", dir: 1 },
  { label: "% ↓", key: "changePercent", dir: -1 },
  { label: "Vol ↑", key: "volume", dir: 1 },
  { label: "Vol ↓", key: "volume", dir: -1 },
];

function OverallSparkline({ priceHistory }) {
  const symbol = STOCK_SYMBOLS.find(s => priceHistory[s]?.length > 2) || STOCK_SYMBOLS[0];
  const data = priceHistory[symbol] || [];
  const path = sparklinePath(data, 800, 64);
  const isUp = data.length >= 2 && data[data.length - 1] >= data[0];
  const color = isUp ? "#00e5ff" : "#ff4d6d";

  return (
    <div className="glass rounded-2xl px-5 py-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-[#8892a4] uppercase tracking-wider">
          {symbol} — Price History ({data.length} data points)
        </span>
        <span className={`text-xs font-bold ${isUp ? 'text-[#00e5ff]' : 'text-[#ff4d6d]'}`}>
          {isUp ? "▲ Uptrend" : "▼ Downtrend"}
        </span>
      </div>
      <svg viewBox="0 0 800 64" width="100%" height="64" preserveAspectRatio="none">
        {path
          ? <><path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${path} L800,64 L0,64 Z`} fill={color} opacity="0.07" /></>
          : <text x="400" y="36" textAnchor="middle" fill="#4a5568" fontSize="12">Collecting price history…</text>
        }
      </svg>
    </div>
  );
}

export default function Stocks() {
  const { stockData, priceHistory, loading, error } = useStock();
  const [capFilter, setCapFilter] = useState("All");
  const [sortIdx, setSortIdx] = useState(null);

  const filtered = useMemo(() => {
    let syms = STOCK_SYMBOLS;
    if (capFilter !== "All") syms = syms.filter(s => STOCK_META[s]?.cap === capFilter);
    if (sortIdx !== null) {
      const { key, dir } = SORTS[sortIdx];
      syms = [...syms].sort((a, b) => ((stockData[a]?.[key] ?? -Infinity) - (stockData[b]?.[key] ?? -Infinity)) * dir);
    }
    return syms;
  }, [capFilter, sortIdx, stockData]);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Live Markets</h1>
        <p className="text-[#8892a4] text-sm mt-1">8 stocks tracked · refreshes every 15s</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
          style={{ background: 'rgba(255,77,109,0.08)', borderColor: 'rgba(255,77,109,0.2)', color: '#ff4d6d' }}>
          ⚠ {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex gap-1.5">
          {CAPS.map(cap => (
            <button key={cap} onClick={() => setCapFilter(cap)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
              style={{
                border: capFilter === cap ? '1px solid rgba(0,229,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                background: capFilter === cap ? 'rgba(0,229,255,0.12)' : 'transparent',
                color: capFilter === cap ? '#00e5ff' : '#8892a4',
              }}>
              {cap}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SORTS.map((s, i) => (
            <button key={i} onClick={() => setSortIdx(sortIdx === i ? null : i)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                border: sortIdx === i ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: sortIdx === i ? 'rgba(0,229,255,0.1)' : 'transparent',
                color: sortIdx === i ? '#00e5ff' : '#8892a4',
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sparkline */}
      <OverallSparkline priceHistory={priceHistory} />

      {/* Grid */}
      {loading && !Object.keys(stockData).length ? (
        <div className="flex items-center justify-center h-48 gap-3 text-[#8892a4]">
          <div className="spinner" /><span>Loading live prices…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(sym => <StockCard key={sym} symbol={sym} history={priceHistory[sym] || []} />)}
        </div>
      )}
    </div>
  );
}
