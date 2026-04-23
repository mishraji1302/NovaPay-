import { useLocation } from "react-router-dom";
import { useStock } from "../context/StockContext.jsx";

const TITLES = { "/dashboard": "Dashboard", "/stocks": "Live Markets", "/banking": "Banking", "/chatbot": "Finn AI" };

export default function Navbar() {
  const { pathname } = useLocation();
  const { lastUpdated, error, loading } = useStock();
  const isStale = lastUpdated && Date.now() - lastUpdated > 20000;
  const since = lastUpdated ? Math.round((Date.now() - lastUpdated) / 1000) : null;

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 border-b border-white/8 sticky top-0 z-[90]"
      style={{ height: 'var(--navbar-height)', background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(12px)' }}>
      <h2 className="font-bold text-base text-white">{TITLES[pathname] || "NeoBank"}</h2>
      <div className="flex items-center gap-4">
        {/* Live status */}
        <div className="flex items-center gap-2">
          {loading && !lastUpdated
            ? <div className="spinner" style={{ width: 14, height: 14 }} />
            : error
            ? <span className="text-xs text-[#ff4d6d]">⚠ {error}</span>
            : <><span className={`live-dot ${isStale ? 'stale' : 'fresh'}`} />
               <span className="text-xs text-[#8892a4]">{isStale ? `Stale ${since}s` : 'Live'}</span></>
          }
        </div>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
          style={{ background: 'rgba(0,229,255,0.1)', borderColor: 'rgba(0,229,255,0.3)', color: '#00e5ff' }}>
          U
        </div>
      </div>
    </header>
  );
}
