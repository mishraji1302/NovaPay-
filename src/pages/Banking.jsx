export default function Banking() {
  const cards = [
    { label: "Main Account", num: "**** **** **** 4291", bal: "$18,240.00", color: "from-[#00e5ff] to-[#0077aa]" },
    { label: "Savings",      num: "**** **** **** 7703", bal: "$5,760.00",  color: "from-[#7c3aed] to-[#4f46e5]" },
  ];
  const txns = [
    { icon: "🏪", name: "Grocery Store",    amount: -142.50, date: "Today" },
    { icon: "💼", name: "Salary Deposit",   amount: 5000,    date: "Apr 1" },
    { icon: "⚡", name: "Electricity Bill", amount: -89.00,  date: "Mar 30" },
    { icon: "🍕", name: "Restaurant",       amount: -47.20,  date: "Mar 28" },
    { icon: "📦", name: "Amazon Order",     amount: -234.99, date: "Mar 27" },
  ];
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Banking</h1>
        <p className="text-[#8892a4] text-sm mt-1">Manage your accounts and transactions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-6 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">{c.label}</p>
            <p className="font-mono text-2xl font-bold text-white mb-4">{c.bal}</p>
            <p className="font-mono text-sm text-white/70">{c.num}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-1">
          {txns.map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-lg flex-shrink-0">{t.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{t.name}</div>
                <div className="text-xs text-[#8892a4]">{t.date}</div>
              </div>
              <div className={`font-mono text-sm font-bold ${t.amount > 0 ? 'text-[#00e5ff]' : 'text-[#ff4d6d]'}`}>
                {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
