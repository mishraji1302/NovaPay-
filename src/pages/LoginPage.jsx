import { useState } from "react";

export default function LoginPage({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden px-4">

      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite' }} />
      <div className="absolute bottom-[-5%] right-[15%] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite reverse' }} />
      <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-[slideUp_0.5s_ease]">

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,229,255,0.35)]"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #0088bb)' }}>
            <span className="text-2xl font-black text-black">N</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NovaPay</h1>
          <p className="text-[#8892a4] text-sm mt-1">Your intelligent financial companion</p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl p-8 border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}>

          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-[#8892a4] text-sm mb-6">Sign in to your account</p>

          {/* Email field */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#8892a4] uppercase tracking-wider mb-2">Email</label>
            <div className={`relative rounded-xl border transition-all duration-200 ${focused === 'email' ? 'border-[#00e5ff] shadow-[0_0_0_3px_rgba(0,229,255,0.1)]' : 'border-white/10'}`}
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892a4] text-base">✉</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                placeholder="you@example.com"
                className="w-full bg-transparent text-white pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-semibold text-[#8892a4] uppercase tracking-wider">Password</label>
              <button className="text-xs text-[#00e5ff] hover:text-white transition-colors">Forgot password?</button>
            </div>
            <div className={`relative rounded-xl border transition-all duration-200 ${focused === 'pass' ? 'border-[#00e5ff] shadow-[0_0_0_3px_rgba(0,229,255,0.1)]' : 'border-white/10'}`}
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892a4] text-base">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-transparent text-white pl-10 pr-12 py-3.5 rounded-xl text-sm outline-none placeholder:text-white/20"
              />
              <button onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8892a4] hover:text-white transition-colors text-sm">
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: loading ? 'rgba(0,229,255,0.6)' : 'linear-gradient(135deg, #00e5ff, #0099cc)' }}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in…</>
            ) : 'Sign In →'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-[#4a5568]">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            {['🔵 Google', '⬛ Apple'].map(label => (
              <button key={label}
                className="py-3 rounded-xl text-sm font-medium text-[#8892a4] border border-white/8 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-200">
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[#8892a4] mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-[#00e5ff] font-semibold hover:underline transition-colors">
            Create one →
          </button>
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {['🔐 256-bit SSL', '🏦 Bank-grade', '✓ SOC2'].map(b => (
            <span key={b} className="text-xs text-[#4a5568]">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
