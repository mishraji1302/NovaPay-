import { useState } from "react";

export default function RegisterPage({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [agreed, setAgreed] = useState(false);

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleCreate = () => {
    if (!agreed) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  const fields = [
    { key: 'name',     label: 'Full Name',     icon: '👤', type: 'text',     ph: 'John Doe' },
    { key: 'email',    label: 'Email Address', icon: '✉',  type: 'email',    ph: 'you@example.com' },
    { key: 'password', label: 'Password',      icon: '🔒', type: 'password', ph: 'Create a strong password' },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center relative overflow-hidden px-4">

      {/* Ambient orbs */}
      <div className="absolute top-[-8%] right-[18%] w-[450px] h-[450px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite' }} />
      <div className="absolute bottom-[-5%] left-[10%] w-[380px] h-[380px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite reverse' }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-md animate-[slideUp_0.5s_ease]">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-[0_0_28px_rgba(0,229,255,0.3)]"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #0088bb)' }}>
            <span className="text-xl font-black text-black">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#8892a4] text-sm mt-1">Join thousands managing smarter finances</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}>

          <div className="space-y-4 mb-5">
            {fields.map(({ key, label, icon, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[#8892a4] uppercase tracking-wider mb-1.5">{label}</label>
                <div className={`relative rounded-xl border transition-all duration-200 ${focused === key ? 'border-[#00e5ff] shadow-[0_0_0_3px_rgba(0,229,255,0.1)]' : 'border-white/10'}`}
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892a4]">{icon}</span>
                  <input type={type} value={form[key]} onChange={set(key)}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                    placeholder={ph}
                    className="w-full bg-transparent text-white pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder:text-white/20" />
                </div>
              </div>
            ))}
          </div>

          {/* Password strength */}
          {form.password && (
            <div className="mb-4">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    form.password.length >= i * 3
                      ? i <= 1 ? 'bg-[#ff4d6d]' : i <= 2 ? 'bg-[#f6c90e]' : i <= 3 ? 'bg-[#00e5ff]' : 'bg-green-400'
                      : 'bg-white/10'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-[#8892a4]">
                {form.password.length < 4 ? 'Weak' : form.password.length < 7 ? 'Fair' : form.password.length < 10 ? 'Good' : 'Strong'}
              </p>
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 mb-5 cursor-pointer group">
            <div onClick={() => setAgreed(v => !v)}
              className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${agreed ? 'bg-[#00e5ff] border-[#00e5ff]' : 'border-white/20 bg-white/5'}`}>
              {agreed && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm text-[#8892a4] group-hover:text-white/70 transition-colors">
              I agree to the <span className="text-[#00e5ff]">Terms of Service</span> and <span className="text-[#00e5ff]">Privacy Policy</span>
            </span>
          </label>

          {/* Create button */}
          <button onClick={handleCreate} disabled={loading || !agreed}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #0099cc)' }}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating account…</>
            ) : 'Create Account →'}
          </button>
        </div>

        <p className="text-center text-sm text-[#8892a4] mt-5">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-[#00e5ff] font-semibold hover:underline">Sign in →</button>
        </p>
      </div>
    </div>
  );
}
