import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStock } from "../context/StockContext.jsx";
import { STOCK_SYMBOLS, STOCK_META } from "../data/constants.js";
import { formatCurrency, formatPercent } from "../utils/helpers.js";

function StatCard({ label, value, icon, sub, trend }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#8892a4] uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="font-mono text-2xl font-bold text-white">{value}</div>
      {sub && <div className={`text-xs font-semibold ${trend === 'up' ? 'text-[#00e5ff]' : trend === 'down' ? 'text-[#ff4d6d]' : 'text-[#8892a4]'}`}>{sub}</div>}
    </div>
  );
}

function MiniRow({ symbol }) {
  const { stockData } = useStock();
  const s = stockData[symbol];
  const meta = STOCK_META[symbol] || {};
  const up = s?.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #0088bb)' }}>
          {symbol[0]}
        </div>
        <div>
          <div className="font-mono text-sm font-bold text-[#00e5ff]">{symbol}</div>
          <div className="text-xs text-[#8892a4]">{meta.name}</div>
        </div>
      </div>
      {s ? (
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-white">{formatCurrency(s.price)}</div>
          <div className={`text-xs font-semibold ${up ? 'text-[#00e5ff]' : 'text-[#ff4d6d]'}`}>{formatPercent(s.changePercent)}</div>
        </div>
      ) : <div className="spinner" />}
    </div>
  );
}

export default function Dashboard() {
  const { stockData } = useStock();

  const topGainer = useMemo(() => {
    return STOCK_SYMBOLS.filter(s => stockData[s]?.changePercent > 0)
      .sort((a, b) => (stockData[b]?.changePercent || 0) - (stockData[a]?.changePercent || 0))[0];
  }, [stockData]);

  const s = stockData[topGainer];

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Good morning 👋</h1>
        <p className="text-[#8892a4] text-sm mt-1">Here's your financial snapshot for today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Balance" value="$24,000" icon="💰" sub="↑ +$1,200 this month" trend="up" />
        <StatCard label="Monthly Spend" value="$3,840" icon="💳" sub="↓ -8% vs last month" trend="up" />
        <StatCard label="Investments" value="$12,500" icon="📈" sub="↑ +5.2% portfolio gain" trend="up" />
        <StatCard label="Savings Goal" value="78%" icon="🎯" sub="$1,200 to target" trend="none" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Market snapshot */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Market Snapshot</h3>
            <Link to="/stocks" className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:text-white"
              style={{ color: '#00e5ff', borderColor: 'rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.08)' }}>
              View All →
            </Link>
          </div>
          {STOCK_SYMBOLS.slice(0, 6).map(sym => <MiniRow key={sym} symbol={sym} />)}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Top gainer */}
          {topGainer && s && (
            <div className="glass rounded-2xl p-5 border border-[rgba(0,229,255,0.15)]"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(0,229,255,0.02))' }}>
              <p className="text-xs font-bold text-[#8892a4] uppercase tracking-wider mb-3">🏆 Top Gainer</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xl font-black text-[#00e5ff]">{topGainer}</div>
                  <div className="text-xs text-[#8892a4] mt-0.5">{STOCK_META[topGainer]?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-white">{formatCurrency(s.price)}</div>
                  <div className="text-sm font-bold text-[#00e5ff]">{formatPercent(s.changePercent)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Finn CTA */}
          <div className="glass rounded-2xl p-5 flex-1 border border-[rgba(0,229,255,0.2)]"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(0,229,255,0.02))' }}>
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-bold text-white mb-1">Ask Finn AI</h4>
            <p className="text-sm text-[#8892a4] mb-4 leading-relaxed">
              Get instant insights on prices, predictions, and market trends — powered by Gemini.
            </p>
            <Link to="/chatbot"
              className="inline-block px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00e5ff, #0099cc)' }}>
              Chat with Finn →
            </Link>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-[#8892a4] uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '↑', label: 'Send', color: '#00e5ff' },
                { icon: '↓', label: 'Receive', color: '#f6c90e' },
                { icon: '⟳', label: 'Exchange', color: '#7c3aed' },
                { icon: '⊕', label: 'Top Up', color: '#10b981' },
              ].map(({ icon, label, color }) => (
                <button key={label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
                    style={{ background: `${color}22`, color }}>
                    {icon}
                  </div>
                  <span className="text-xs text-[#8892a4] group-hover:text-white transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
