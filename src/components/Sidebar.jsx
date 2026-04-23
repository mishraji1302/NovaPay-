import { NavLink } from "react-router-dom";
import { useState } from "react";
import { APP_NAME } from "../data/constants.js";
import WatchlistPanel from "./WatchlistPanel.jsx";
import { useStock } from "../context/StockContext.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/stocks",    label: "Markets",   icon: "◈" },
  { to: "/banking",   label: "Banking",   icon: "⬡" },
  { to: "/chatbot",   label: "Finn AI",   icon: "◎" },
];

export default function Sidebar() {
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const { watchlist } = useStock();

  return (
    <>
      <aside className="flex flex-col flex-shrink-0 sticky top-0 h-screen border-r border-white/8 z-[100]"
        style={{ width: 'var(--sidebar-width)', background: 'var(--bg-sidebar)' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              style={{ background: 'linear-gradient(135deg, #00e5ff, #0088bb)' }}>N</div>
            <span className="font-extrabold text-base tracking-tight text-white">{APP_NAME}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3">
          <p className="text-[10px] font-bold text-[#4a5568] uppercase tracking-[0.12em] px-2 mb-2">Menu</p>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, marginBottom: 2,
              background: isActive ? 'rgba(0,229,255,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent',
              color: isActive ? '#00e5ff' : '#8892a4',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.85rem',
              transition: 'all 200ms ease',
              textDecoration: 'none',
            })}>
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className="mt-4 pt-3 border-t border-white/8">
            <button onClick={() => setWatchlistOpen(true)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-transparent text-[#8892a4] text-sm transition-all hover:bg-yellow-400/8 hover:text-yellow-300 hover:border-yellow-400/20">
              <span className="text-base w-5 text-center">⭐</span>
              Watchlist
              {watchlist.length > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400 text-black">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/8">
          <p className="text-[10px] text-[#4a5568]">NeoBank v1.0 · Live Markets</p>
        </div>
      </aside>
      <WatchlistPanel open={watchlistOpen} onClose={() => setWatchlistOpen(false)} />
    </>
  );
}
